import { PaymentStatus } from '../../src/Entities/Enums/PaymentStatusEnum'
import { Payment } from '../../src/Entities/Payment'
import dotenv from 'dotenv'

describe('Payment entity', () => {
    beforeAll(() => {
        dotenv.config({
            path: '.env.test',
        })
    })
    let payment: Payment
    beforeEach(() => {
        payment = new Payment('1', '1', PaymentStatus.INITIALIZED)
    })

    it('should create a payment entity correctly', () => {
        expect(payment.getStatus()).toBe(PaymentStatus.INITIALIZED)
    })

    it('should change payment status', () => {
        payment.setStatus(PaymentStatus.APPROVED)

        expect(payment.getStatus()).toBe(PaymentStatus.APPROVED)
    })

    it('should return an object', () => {
        expect(typeof payment.toJSON()).toBe('object')
    })

    it('should return status', () => {
        expect(payment.getStatus()).toBe(PaymentStatus.INITIALIZED)
    })

    it('should return id', () => {
        expect(payment.getId()).toBe('1')
    })

    it('should return order id', () => {
        expect(payment.getOrderId()).toBe('1')
    })

    it('should set value', () => {
        payment.setValue(10.0)

        expect(payment.getValue()).toBe(10.0)
    })

    it('get payment url', () => {
        expect(payment.getPaymentUrl()).toBe('http://localhost:4000/payments/1')
    })

    it('get notification url', () => {
        expect(payment.getNotificationUrl()).toBe(process.env.NOTIFICATION_URL)
    })
})
