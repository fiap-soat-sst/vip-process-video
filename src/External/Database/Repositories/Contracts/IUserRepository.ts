import { Either } from '../../../../@Shared/Either'
import User from '../../../../Entities/User'

export default interface IUserRepository {
    getUser(email: string): Promise<Either<Error, User>>    
    getVideos(email: string): Promise<
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
    >
    saveUrlsProcessVideo(email: string, videoId: string, urls: string[]): Promise<void>
}
