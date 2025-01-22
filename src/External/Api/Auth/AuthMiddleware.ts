import { Request, Response, NextFunction } from 'express'
import VerifyAuthToken from '../../../UseCases/Payment/Auth/verifyAuthToken.usecase'

export const authMiddleware = (verifyAuthToken: VerifyAuthToken) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const path = req.path
        const token = req.header('token')

        if (!token) {
            return res
                .status(401)
                .json({ message: 'Authorization denied, no token' })
        }

        try {
            const userAuth = verifyAuthToken.execute(token)

            if (userAuth.getType()) return next()

            res.status(403).json({
                message: 'You dont have auth rights for this route.',
            })
        } catch (err) {
            console.log('🚀 ~ return ~ err:', err)
            res.status(401).json({ message: 'Token is not valid' })
        }
    }
}
