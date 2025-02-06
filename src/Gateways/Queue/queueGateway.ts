import IQueue from '../../External/Queue/Provider/Contracts/IQueue'
import IQueueGateway from '../Contracts/IQueueGateway'

export default class QueueGateway implements IQueueGateway {
    constructor(private readonly queueProvider: IQueue) {}

    async publish(topic: string, message: string): Promise<void> {
        await this.queueProvider.publish(topic, message)
    }
}
