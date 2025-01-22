import { randomUUID, UUID } from 'crypto'
import { InputCheckoutDTO } from '../../src/UseCases/Payment/checkout/checkout.dto'
import { Payment } from '../../src/Entities/Payment'
import { PaymentStatus } from '../../src/Entities/Enums/PaymentStatusEnum'

export const createMockInputPayment = (
    orderId: string,
    total: number
): InputCheckoutDTO => {
    return {
        orderId,
        total,
    }
}

export const createMockPayment = (id: UUID): Payment => {
    return new Payment(id, 'order-id', PaymentStatus.INITIALIZED)
}
