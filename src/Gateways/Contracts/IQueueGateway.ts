export default interface IQueueGateway {
    publish(topic: string, message: string): Promise<void>
}
