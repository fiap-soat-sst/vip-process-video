export default class QueueRequest {
  private _email: string;
  private _videos: {
    id: string;
    name: string;
    size: number;
    contentType: string;
    managerService: {
      url: string;
    };
    hash: string;
  }[];

  constructor(
    email: string,
    videos: {
      id: string;
      name: string;
      size: number;
      contentType: string;
      managerService: { url: string };
      hash: string;
    }[]
  ) {
    this._email = email;
    this._videos = videos;
  }

  public getEmail(): string {
    return this._email;
  }

  public getVideos(): {
    id: string;
    name: string;
    size: number;
    contentType: string;
    managerService: { url: string };
    hash: string;
  }[] {
    return this._videos;
  }

  static fromJson(json: {
    email: string;
    videos: {
      id: string;
      name: string;
      size: number;
      contentType: string;
      managerService: { url: string };
      hash: string;
    }[];
  }): QueueRequest {
    const { email, videos } = json;
    return new QueueRequest(email, videos);
  }
}
