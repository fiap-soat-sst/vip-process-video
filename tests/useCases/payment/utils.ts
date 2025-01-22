import { randomUUID, UUID } from 'crypto'
import { Payment } from '../../../src/Entities/Payment'
import { PaymentStatus } from '../../../src/Entities/Enums/PaymentStatusEnum'

export const createExpectedPayment = (id: UUID): Payment => {
    return new Payment(id, 'order-id', PaymentStatus.INITIALIZED)
}
