import { Either, Left, Right } from '../../../@Shared/Either'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import IQueue from './Contracts/IQueue'

export default class SNSQueueProvider implements IQueue {
    private sns: SNSClient

    constructor() {
        this.sns = new SNSClient({
            region: process.env.AWS_REGION,
        })
    }

    async publish(
        topic: string,
        message: string
    ): Promise<Either<Error, void>> {
        try {
            const command = new PublishCommand({
                Message: message,
                TopicArn: topic,
            })

            await this.sns.send(command)

            return Right(undefined)
        } catch (error) {
            return Left<Error>(error as Error)
        }
    }
}
