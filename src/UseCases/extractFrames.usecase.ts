import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import QueueRequest from '../Entities/QueueObject';
import { ExtractFramesRepository } from '../External/ExtractFrames/ExtractFramesRepository';
import { Readable } from 'stream';

const execAsync = promisify(exec);

export class ExtractFramesUseCase {
  private readonly s3Client: S3Client;
  private readonly videoRepository: ExtractFramesRepository;
  private readonly sourceBucket: string;
  private readonly destinationBucket: string;
  private readonly tempDir: string;

  constructor(
    videoRepository: ExtractFramesRepository,
    sourceBucket: string,
    destinationBucket: string,
    tempDir: string = '/tmp'
  ) {
    this.videoRepository = videoRepository;
    this.s3Client = new S3Client();
    this.sourceBucket = sourceBucket;
    this.destinationBucket = destinationBucket;
    this.tempDir = tempDir;
  }

  async execute(request: QueueRequest): Promise<void> {
    const videos = request.getVideos();

    for (const video of videos) {
      try {
        // Create temp directory for this video
        const videoTempDir = path.join(this.tempDir, video.id);
        await fs.promises.mkdir(videoTempDir, { recursive: true });

        // Download video from S3
        const videoPath = path.join(videoTempDir, `${video.id}.mp4`);
        await this.downloadVideo(video.managerService.url, videoPath);

        // Extract frames using ffmpeg
        await this.extractFrames(video.id, videoPath, videoTempDir);

        // Upload frames to S3
        await this.uploadFrames(video.id, videoTempDir);

        // Clean up
        await fs.promises.rm(videoTempDir, {
          recursive: true,
          force: true,
        });

        // Update video status in repository
        await this.videoRepository.updateProcessingStatus(
          video.id,
          'FRAMES_EXTRACTED'
        );
      } catch (error) {
        console.error(`Error processing video ${video.id}:`, error);
        await this.videoRepository.updateProcessingStatus(
          video.id,
          'FAILED'
        );
        throw error;
      }
    }
  }

  private async downloadVideo(
    url: string,
    destination: string
  ): Promise<void> {
    const key = url.split('/').pop()!;

    const command = new GetObjectCommand({
      Bucket: this.sourceBucket,
      Key: key,
    });

    const response = await this.s3Client.send(command);

    if (!response.Body) {
      throw new Error('No data received from S3');
    }

    // Convert the readable stream to buffer
    const chunks: Buffer[] = [];
    const stream = response.Body as Readable;

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);
    await fs.promises.writeFile(destination, buffer);
  }

  private async extractFrames(
    videoId: string,
    videoPath: string,
    outputDir: string
  ): Promise<void> {
    // Extract one frame per second
    const command = `ffmpeg -i "${videoPath}" -vf fps=1 "${outputDir}/${videoId}-%03d.jpg"`;

    try {
      await execAsync(command);
    } catch (error) {
      throw new Error(`Failed to extract frames: ${error}`);
    }
  }

  private async uploadFrames(
    videoId: string,
    framesDir: string
  ): Promise<void> {
    const files = await fs.promises.readdir(framesDir);
    const frameFiles = files.filter((file) => file.endsWith('.jpg'));

    for (const file of frameFiles) {
      const fileContent = await fs.promises.readFile(
        path.join(framesDir, file)
      );

      // Get the frame number from the original filename and create new name
      const frameNumber = file.match(/\d+/)![0];
      const newKey = `${videoId}/${videoId}-${frameNumber}.jpg`;

      const command = new PutObjectCommand({
        Bucket: this.destinationBucket,
        Key: newKey,
        Body: fileContent,
        ContentType: 'image/jpeg',
      });

      await this.s3Client.send(command);
    }
  }
}
