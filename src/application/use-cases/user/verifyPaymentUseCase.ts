import { IBookingRepository } from "../../../domain/interfaces/IBookingRepository";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { VerifyPaymentDTO } from "../../../domain/dtos/booking.dto";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { toCreateWalletTransactionDTO } from "../../../application/mappers/walletMapper";
import { PaymentMethod, BookingStatus } from "../../../domain/entities/Booking";
import { IWalletRepository } from "../../../domain/interfaces/IWalletRepository";
import { IVerifyPaymentService } from "../../../domain/interfaces/IVerifyPaymentService";
import { razorpayInstance } from "../../../infrastructure/external/services/razorpayService";
import crypto from 'crypto';

export class VerifyPaymentUseCase implements IVerifyPaymentService {
    constructor(
        private _bookingRepository: IBookingRepository,
        private _userRepository: IUserRepository,
        private _walletRepository: IWalletRepository
    ) { }

    async execute(data: VerifyPaymentDTO, userId:string): Promise<void> {
        const {razorpay_order_id, razorpay_payment_id,razorpay_signature,bookingId}=data

        if (!process.env.RAZORPAY_KEY_SECRET) {
            throw new AppError(
                ErrorCode.INTERNAL_ERROR,
                "Payment verification secret not configured",
                HttpStatusCode.INTERNAL_SERVER
            );
        }

        const sign =`${razorpay_order_id}|${razorpay_payment_id}`
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(sign)
            .digest('hex')

         if (razorpay_signature !== expectedSign) {
            throw new AppError(
                ErrorCode.PAYMENT_ERROR,
                'Payment verification failed',
                HttpStatusCode.BAD_REQUEST
            );
        }
        
        // Get booking
        const booking = await this._bookingRepository.getBookingById(bookingId);
        if (!booking) {
            throw new AppError(
                ErrorCode.NOT_FOUND,
                'Booking not found',
                HttpStatusCode.NOT_FOUND
            );
        }

        if (booking.userId !== userId) {
            throw new AppError(
                ErrorCode.UNAUTHORIZED,
                "You are not allowed to verify this booking",
                HttpStatusCode.UNAUTHORIZED
            );
        }

        if (booking.paymentMethod !== PaymentMethod.RAZORPAY) {
            throw new AppError(
                ErrorCode.VALIDATION_ERROR,
                "Payment verification is only applicable for Razorpay bookings",
                HttpStatusCode.BAD_REQUEST
           )
        }

        if (booking.status !== BookingStatus.PENDING) {
            throw new AppError(
                ErrorCode.VALIDATION_ERROR,
                "Booking is not pending payment",
                HttpStatusCode.BAD_REQUEST
            );
        }

        // Update booking
        await this._bookingRepository.updateBookingStatus(bookingId, BookingStatus.CONFIRMED);
        await this._bookingRepository.updatePaymentId(bookingId, razorpay_payment_id);

        // Get user
        const user = await this._userRepository.findUserById(booking.userId);
        if (!user) {
            throw new AppError(
                ErrorCode.NOT_FOUND,
                'User not found',
                HttpStatusCode.NOT_FOUND
            );
        }

        // Wallet transactions
        const admin = await this._userRepository.findAdmin();
        if (!admin || !admin.id) {
            throw new AppError(
                ErrorCode.INTERNAL_ERROR,
                'Admin user not found for wallet credit',
                HttpStatusCode.INTERNAL_SERVER
            );
        }

        // Interviewer credit
        const interviewerTnx = toCreateWalletTransactionDTO({
            userId: booking.interviewerId,
            role: 'interviewer',
            type: 'credit',
            amount: booking.amount,
            reason: 'Session Booked',
            bookingId: booking.id,
            interviewerFee: booking.interviewerAmount,
            adminFee: booking.adminFee,
            userName: user.name
        });
        await this._walletRepository.createTransaction(interviewerTnx);

        // Admin credit
        const adminTnx = toCreateWalletTransactionDTO({
            userId: admin.id!,
            role: 'admin',
            type: 'credit',
            amount: booking.amount,
            reason: 'Session Booked',
            bookingId: booking.id,
            interviewerFee: booking.interviewerAmount,
            adminFee: booking.adminFee,
            userName: user.name
        });
        await this._walletRepository.createTransaction(adminTnx);
    }
}