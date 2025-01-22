import { Video } from '../../Entities/Video';
import { VideoProcessingStatus } from '../../Entities/VideoProcessingStatus';

export interface IExtractFramesRepository {
  updateProcessingStatus(
    videoId: string,
    status: VideoProcessingStatus
  ): Promise<void>;
  getVideoById(videoId: string): Promise<Video | null>;
  saveVideo(video: Video): Promise<void>;
}
