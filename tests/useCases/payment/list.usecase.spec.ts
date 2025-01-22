import { randomUUID } from 'crypto'
import { isLeft, Left, Right } from '../../../src/@Shared/Either'
import IPaymentGatewayRepository from '../../../src/Gateways/contracts/IPaymentGatewayRepository'
import ListUseCase from '../../../src/UseCases/Payment/list/list.usecase'
import { createMockPayment } from '../../mocks/payment.mock'
import { createMock } from '../../utils/mock.util'
import { createExpectedPayment } from './utils'

const PAYMENT_ID_1 = randomUUID()
const PAYMENT_ID_2 = randomUUID()

const rawExpectedPayments = [
    createExpectedPayment(PAYMENT_ID_1),
    createExpectedPayment(PAYMENT_ID_2),
]

const expectedPayments = rawExpectedPayments.map((result) => {
    return {
        id: result.getId(),
        status: result.getStatus(),
    }
})

describe('ListUseCase', () => {
    let listUseCase: ListUseCase
    let mockPaymentRepository: jest.Mocked<IPaymentGatewayRepository>

    beforeEach(() => {
        mockPaymentRepository = createMock<IPaymentGatewayRepository>()
        listUseCase = new ListUseCase(mockPaymentRepository)
    })

    it('should return a list of payments successfully', async () => {
        const mockPayments = [
            createMockPayment(PAYMENT_ID_1),
            createMockPayment(PAYMENT_ID_2),
        ]
        mockPaymentRepository.list.mockResolvedValue(Right(mockPayments))
        const result = await listUseCase.execute()
        expect(isLeft(result)).toBe(false)
        expect(result.value).toEqual({
            payments: expectedPayments,
        })
    })

    it('should return an error if the repository fails', async () => {
        const error = new Error('Repository error')
        mockPaymentRepository.list.mockResolvedValue(Left(error))

        const result = await listUseCase.execute()

        expect(isLeft(result)).toBe(true)
        expect(result.value).toBe(error)
    })
})
