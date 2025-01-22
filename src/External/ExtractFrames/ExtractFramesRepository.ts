import { Video } from '../../Entities/Video';
import { VideoProcessingStatus } from '../../Entities/VideoProcessingStatus';
import { IExtractFramesRepository } from './IExtractFramesRepository';

export class ExtractFramesRepository
  implements IExtractFramesRepository
{
  private videos: Map<string, Video> = new Map();

  async updateProcessingStatus(
    videoId: string,
    status: VideoProcessingStatus
  ): Promise<void> {
    const video = this.videos.get(videoId);
    if (!video) {
      throw new Error('Video not found');
    }
    video.status = status;
    video.updatedAt = new Date();
    this.videos.set(videoId, video);
  }

  async getVideoById(videoId: string): Promise<Video | null> {
    return this.videos.get(videoId) || null;
  }

  async saveVideo(video: Video): Promise<void> {
    this.videos.set(video.id, video);
  }
}
