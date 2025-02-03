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
    destinationBucket: string
  ) {
    this.videoRepository = videoRepository;
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
    });
    this.sourceBucket = sourceBucket;
    this.destinationBucket = destinationBucket;
    const path = require('path');

    const outputDir = path.join(__dirname, 'frames');
    this.tempDir = outputDir;
  }

  async execute(request: QueueRequest): Promise<void> {
    const videos = request.getVideos();

    for (const video of videos) {
      try {
        const videoTempDir = path.join(this.tempDir, video.id);
        await fs.promises.mkdir(videoTempDir, { recursive: true });

        const videoPath = path.join(videoTempDir, `${video.id}.mp4`);
        await this.downloadVideo(video.managerService.url, videoPath);

        await this.extractFrames(video.id, videoPath, videoTempDir);

        await this.uploadFrames(video.id, videoTempDir);

        await fs.promises.rm(videoTempDir, {
          recursive: true,
          force: true,
        });

        //TODO: salvar no DynamoDB o status do vídeo
      } catch (error) {
        //TODO: em caso de erro chamar o ms notification
        console.error(`Error processing video ${video.id}:`, error);
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
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const command = `ffmpeg -i "${videoPath}" -vf fps=1 "${outputDir}/${videoId}-%03d.jpg"`;

    try {
      await execAsync(command);
      console.log(`Frames extracted successfully to ${outputDir}`);
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

    for (let i = 0; i < frameFiles.length; i++) {
      const fileContent = await fs.promises.readFile(
        path.join(framesDir, frameFiles[i])
      );

      const newKey = `${videoId}/${videoId}-${i}.jpg`;

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
