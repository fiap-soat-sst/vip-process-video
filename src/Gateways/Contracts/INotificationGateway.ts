import { Either } from "../../@Shared/Either";

export interface InputNotificationDTO {
  type: "SUCCESS" | "ERROR";
  videoId: string;
  email: string;
  message: string;
}

export interface INotificationGateway {
  sendEmail(input: InputNotificationDTO): Promise<Either<Error, string>>
}
