import { vi } from 'vitest'
import { AxiosHeaders, AxiosResponse } from 'axios'
import { Payment } from '../../src/Entities/Payment'
import { HttpRequest } from '../../src/@Shared/Request'
import { isLeft, isRight } from '../../src/@Shared/Either'
import { MercadoPagoExternal } from '../../src/External/Payment/MercadoPagoExternal'

// Mock dependencies
vi.mock('../../src/@Shared/Request')

describe('MercadoPagoExternal', () => {
    let payment: Payment

    beforeEach(() => {
        vi.clearAllMocks()

        // Mock Payment object
        payment = {
            getId: vi.fn().mockReturnValue('payment-123'),
            getNotificationUrl: vi
                .fn()
                .mockReturnValue('https://webhook.example.com'),
        } as unknown as Payment

        // Set up environment variables
        process.env.ACCESS_TOKEN_MERCADO_PAGO = 'mock-access-token'
        process.env.MERCADO_PAGO_URL = 'https://api.mercadopago.com'
        process.env.MERCADO_PAGO_USER_ID = 'mock-user-id'
        process.env.MERCADO_PAGO_POS_ID = 'mock-pos-id'
    })

    describe('generateQrCodePaymentString', () => {
        it('should return Right with QR code data on success', async () => {
            const headers = new AxiosHeaders()

            const mockResponse: AxiosResponse = {
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {
                    headers,
                },
                data: { qr_data: 'mock-qr-code-data' },
            }

            vi.spyOn(HttpRequest.prototype, 'post').mockResolvedValue(
                mockResponse
            )

            const repository = new MercadoPagoExternal()
            const result = await repository.generateQrCodePaymentString(
                payment,
                100
            )

            expect(HttpRequest.prototype.post).toHaveBeenCalledWith(
                `${process.env.MERCADO_PAGO_URL}/instore/orders/qr/seller/collectors/${process.env.MERCADO_PAGO_USER_ID}/pos/${process.env.MERCADO_PAGO_POS_ID}/qrs`,
                expect.any(AxiosHeaders),
                expect.objectContaining({
                    description: 'mandatory description',
                    external_reference: 'payment-123',
                    total_amount: 100,
                })
            )
            expect(isRight(result)).toBe(true)
            expect(result.value).toBe('mock-qr-code-data')
        })

        it('should return Left with an error if the request fails', async () => {
            const mockError = new Error('Request failed')
            vi.spyOn(HttpRequest.prototype, 'post').mockRejectedValue(mockError)

            const repository = new MercadoPagoExternal()
            const result = await repository.generateQrCodePaymentString(
                payment,
                100
            )

            expect(HttpRequest.prototype.post).toHaveBeenCalled()
            expect(isLeft(result)).toBe(true)
            expect(result.value).toBe(mockError)
        })

        it('should throw an error if total is 0', async () => {
            const repository = new MercadoPagoExternal()
            const result = await repository.generateQrCodePaymentString(
                payment,
                0
            )

            expect(result.value).toEqual(Error('Payment amount cannot be 0.'))
        })
    })

    describe('getPaymentStatusById', () => {
        it('should return Right with the payment status on success', async () => {
            const headers = new AxiosHeaders()

            const mockResponse: AxiosResponse = {
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {
                    headers,
                },
                data: { status: 'approved' },
            }

            vi.spyOn(HttpRequest.prototype, 'get').mockResolvedValue(
                mockResponse
            )

            const repository = new MercadoPagoExternal()
            const result = await repository.getPaymentStatusById('payment-123')

            expect(HttpRequest.prototype.get).toHaveBeenCalledWith(
                `${process.env.MERCADO_PAGO_URL}/v1/payments/payment-123`,
                expect.any(AxiosHeaders)
            )
            expect(isRight(result)).toBe(true)
            expect(result.value).toBe('approved')
        })

        it('should return Left with an error if the request fails', async () => {
            const mockError = new Error('Request failed')
            vi.spyOn(HttpRequest.prototype, 'get').mockRejectedValue(mockError)

            const repository = new MercadoPagoExternal()
            const result = await repository.getPaymentStatusById('payment-123')

            expect(HttpRequest.prototype.get).toHaveBeenCalled()
            expect(isLeft(result)).toBe(true)
            expect(result.value).toBe(mockError)
        })
    })
})
