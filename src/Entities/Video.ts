import { VideoProcessingStatus } from './VideoProcessingStatus';

export class Video {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly size: number,
    public readonly contentType: string,
    public readonly hash: string,
    public managerService?: { url: string } | undefined,
    public processService?: { images: { url: string }[] } | undefined,
  ) {}
}
