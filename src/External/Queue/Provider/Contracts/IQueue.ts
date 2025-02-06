import { Either } from '../../../../@Shared/Either'

export default interface IQueue {
    publish(topic: string, message: string): Promise<Either<Error, void>>
}
