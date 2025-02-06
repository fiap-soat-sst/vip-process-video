import { Either } from '../../@Shared/Either'
import User from '../../Entities/User'
import IUserRepository from '../../External/Database/Repositories/Contracts/IUserRepository'
import IUserGatewayRepository from '../Contracts/IUserGatewayRepository'

export default class UserGatewayRepository implements IUserGatewayRepository {
    constructor(private readonly repository: IUserRepository) {}

    async getUser(email: string): Promise<Either<Error, User>> {
        return this.repository.getUser(email)
    }    

    async getVideos(email: string): Promise<
        Either<
            Error,
            {
                email: string
                videos: [
                    {
                        id: string
                        name: string
                        size: number
                        contentType: string
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
        return this.repository.getVideos(email)
    }

    async saveUrlsProcessVideo(email: string, videoId: string, urls: string[]): Promise<void> {
        return this.repository.saveUrlsProcessVideo(email, videoId, urls)
    }
}
