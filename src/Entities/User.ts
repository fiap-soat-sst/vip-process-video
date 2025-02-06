import { Video } from './Video'

export default class User {
    constructor(
        public readonly email: string,
        public readonly password: string,
        public readonly videos: Video[]
    ) {
        if (!email || !password) {
            throw new Error('Invalid user properties')
        }
    }
}
