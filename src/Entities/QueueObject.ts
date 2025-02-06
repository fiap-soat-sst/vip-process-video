export default class QueueRequest {
  private _email: string;
  private _video: {
    id: string;
    name: string;
    size: number;
    contentType: string;
    managerService: {
      url: string;
    };
    hash: string;
    processService?: { images: { url: string }[] } | undefined;
  };

  constructor(
    email: string,
    video: {
      id: string;
      name: string;
      size: number;
      contentType: string;
      managerService: { url: string };
      hash: string;
    }
  ) {
    this._email = email;
    this._video = video;
  }

  public getEmail(): string {
    return this._email;
  }

  public getVideo(): {
    id: string;
    name: string;
    size: number;
    contentType: string;
    managerService: { url: string };
    processService?: { images: { url: string }[] } | undefined;
    hash: string;
  } {
    return this._video;
  }

  static fromJson(json: {
    email: string;
    video: {
      id: string;
      name: string;
      size: number;
      contentType: string;
      managerService: { url: string };
      hash: string;
    };
  }): QueueRequest {
    const { email, video } = json;
    return new QueueRequest(email, video);
  }
}
