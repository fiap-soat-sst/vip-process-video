import { vi } from 'vitest'

import { AxiosHeaders, AxiosResponse } from 'axios'
import { HttpRequest } from '../../src/@Shared/Request'
import { OrderExternal } from '../../src/External/Order/OrderExternal'
import { isLeft, isRight } from '../../src/@Shared/Either'
import { PaymentStatus } from '../../src/Entities/Enums/PaymentStatusEnum'

// Mock dependencies
vi.mock('../../@Shared/Request')

describe('OrderExternal.updateOrderStatus', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        process.env.ORDER_SERVICE_URL = 'https://api.example.com/orders'
        process.env.X_API_KEY = 'mock-api-key'
    })

    it('should return Right with the status on success', async () => {
        const headers = new AxiosHeaders()
        headers.set('x-api-key', process.env.X_API_KEY)
        const mockResponse: AxiosResponse = {
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {
                headers,
            },
            data: {},
        }

        // Mock HttpRequest.post with the correct type
        vi.spyOn(HttpRequest.prototype, 'post').mockResolvedValue(mockResponse)

        const repository = new OrderExternal()
        const result = await repository.updateOrderStatus(
            '123',
            PaymentStatus.APPROVED
        )

        // Assert
        expect(HttpRequest.prototype.post).toHaveBeenCalledWith(
            `${process.env.ORDER_SERVICE_URL}/123`,
            headers,
            {
                status: PaymentStatus.APPROVED,
            }
        )
        expect(isRight(result)).toBe(true)
        expect(result.value).toBe('200')
    })

    it('should return Left with an error when request fails', async () => {
        const headers = new AxiosHeaders()
        headers.set('x-api-key', process.env.X_API_KEY)
        const mockError = new Error('Request failed')
        vi.spyOn(HttpRequest.prototype, 'post').mockRejectedValue(mockError)

        const repository = new OrderExternal()
        const result = await repository.updateOrderStatus(
            '123',
            PaymentStatus.DECLINED
        )

        expect(HttpRequest.prototype.post).toHaveBeenCalledWith(
            `${process.env.ORDER_SERVICE_URL}/123`,
            headers,
            {
                status: PaymentStatus.DECLINED,
            }
        )
        expect(isLeft(result)).toBe(true)
        expect(result.value).toBe(mockError)
    })
})
