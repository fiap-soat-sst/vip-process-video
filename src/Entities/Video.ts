import { VideoProcessingStatus } from './VideoProcessingStatus';

export class Video {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly size: number,
    public readonly contentType: string,
    public readonly url: string,
    public status: VideoProcessingStatus,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static fromDatabase(data: any): Video {
    return new Video(
      data.id,
      data.name,
      data.size,
      data.content_type,
      data.url,
      data.status,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  toDatabase() {
    return {
      id: this.id,
      name: this.name,
      size: this.size,
      content_type: this.contentType,
      url: this.url,
      status: this.status,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
