import axios from 'axios'
import { Either, Left, Right } from "../../@Shared/Either";
import {
  INotificationGateway,
  InputNotificationDTO,
} from "../Contracts/INotificationGateway";


export default class NotificationGateway implements INotificationGateway {
  private readonly endpoint: string;
  constructor(notificationEndpoint: string) {
    this.endpoint = notificationEndpoint;
  }

  async sendEmail(input: InputNotificationDTO): Promise<Either<Error, string>> {
    const { type, videoId, email, message } = input;

    try {
      await axios.post(this.endpoint + '/send-email', {
        type,
        videoId,
        email,
        message,
      });
      return Right('Email sent successfully');
    } catch (error: any) {
      return Left(new Error('Error sending email, error message: ' + error.message));
    }
  }
}
