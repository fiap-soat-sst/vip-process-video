import { DynamoDBAdapter } from '../../DynamoDbAdapter'
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import IUserRepository from '../Contracts/IUserRepository'
import { Either, isLeft, Left, Right } from '../../../../@Shared/Either'
import User from '../../../../Entities/User'

export default class DynamoDBUserRepository implements IUserRepository {
    private client: DynamoDBDocumentClient

    constructor(adapter: DynamoDBAdapter) {
        this.client = adapter.getClient()
    }

    async getUser(email: string): Promise<Either<Error, User>> {
        const params = {
            TableName: process.env.AWS_TABLE_USERS,
            Key: {
                email,
            },
        }

        try {
            const result = await this.client.send(new GetCommand(params))

            if (!result.Item) {
                return Left<Error>(new Error('User not found'))
            }

            return Right({
                email: result.Item?.email,
                password: result.Item?.password,
                videos: result.Item?.videos,
            })
        } catch (error) {
            return Left<Error>(error as Error)
        }
    }
            
    async getVideos(email: string): Promise<
        Either<
            Error,
            {
                email: string
                videos: [
                    {
                        contentType: string
                        id: string
                        name: string
                        size: number
                        managerService?: { url: string } | undefined
                        processService?:
                            | { images: { url: string }[] }
                            | undefined
                        compressService?: { url: string } | undefined
                    }
                ]
            }
        >
    > {
        const user = await this.getUser(email)

        if (isLeft(user)) {
            return Left<Error>(new Error('Email not found'))
        }

        const videos = user.value.videos.map((video) => ({
            id: video.id,
            name: video.name,
            size: video.size,
            contentType: video.contentType,
            managerService: video.managerService
                ? {
                      url: video.managerService.url as string,
                  }
                : undefined,
            processService: video.processService
                ? {
                      images: video.processService.images.map((image: any) => ({
                          url: image.url as string,
                      })),
                  }
                : undefined,            
        }))

        if (videos.length === 0) {
            return Left<Error>(new Error('No videos found'))
        }

        return Right({
            email: user.value.email,
            videos: videos as [
                {
                    id: string
                    name: string
                    size: number
                    contentType: string
                    managerService?: { url: string } | undefined
                    processService?: { images: { url: string }[] } | undefined
                    compressService?: { url: string } | undefined
                }
            ],
        })
    }
    
    async saveUrlsProcessVideo(email: string, videoId: string, urls: string[]): Promise<void> {
      const user = await this.getUser(email);

      if (isLeft(user)) {
          return;
      }
  
      const videoIndex = user.value.videos.findIndex((video) => video.id === videoId);
  
      if (videoIndex === -1) {
          return;
      }
  
      user.value.videos[videoIndex].processService = {
          images: urls.map((url) => ({ url })),
      };
  
      const params = {
          TableName: process.env.AWS_TABLE_USERS,
          Key: { email },
          UpdateExpression: "SET videos = :videos",
          ExpressionAttributeValues: {
              ":videos": user.value.videos,
          },
      };
  
      try {
          await this.client.send(new UpdateCommand(params));
          return;
      } catch (error) {
          return;
      }
    }
}
