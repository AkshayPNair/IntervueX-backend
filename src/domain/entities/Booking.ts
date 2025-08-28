export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export enum PaymentMethod {
    WALLET = 'wallet',
    RAZORPAY = 'razorpay'
}

export class Booking {
    constructor(
        public id: string,
        public userId: string,
        public interviewerId: string,
        public date: string,
        public startTime: string,
        public endTime: string,
        public amount: number,
        public adminFee: number,
        public interviewerAmount: number,
        public status: BookingStatus,
        public paymentMethod: PaymentMethod,
        public paymentId?: string,
        public cancelReason?: string,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) { }
}