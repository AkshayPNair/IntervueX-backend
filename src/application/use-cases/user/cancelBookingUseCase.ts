import { IBookingRepository } from "../../../domain/interfaces/IBookingRepository";
import { CancelBookingDTO } from "../../../domain/dtos/booking.dto";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from '../../../application/error/ErrorCode'
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { BookingStatus } from "../../../domain/entities/Booking";
import { ICancelBookingService } from "../../../domain/interfaces/ICancelBookingService";
import { IWalletRepository } from "../../../domain/interfaces/IWalletRepository";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { toCreateWalletTransactionDTO } from "../../../application/mappers/walletMapper";

export class CancelBookingUseCase implements ICancelBookingService {
    constructor(
        private _bookingRepository: IBookingRepository,
        private _userRepository: IUserRepository,
        private _walletRepository: IWalletRepository
    ) { }

    async execute(userId: string, data: CancelBookingDTO): Promise<void> {
        try {

            const booking = await this._bookingRepository.getBookingById(data.bookingId)

            if (!booking) {
                throw new AppError(
                    ErrorCode.NOT_FOUND,
                    "Booking not found",
                    HttpStatusCode.NOT_FOUND
                )
            }

            if (booking.userId !== userId) {
                throw new AppError(
                    ErrorCode.FORBIDDEN,
                    'You can only cancel your own bookings',
                    HttpStatusCode.FORBIDDEN
                )
            }

            if (booking.status === BookingStatus.CANCELLED) {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Booking is already cancelled',
                    HttpStatusCode.BAD_REQUEST
                )
            }

            if (booking.status === BookingStatus.COMPLETED) {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Cannot cancel a completed booking',
                    HttpStatusCode.BAD_REQUEST
                )
            }

            const [user,admin]=await Promise.all([
                this._userRepository.findUserById(booking.userId),
                this._userRepository.findAdmin()
            ])

            if(!user){
                throw new AppError(
                    ErrorCode.INTERNAL_ERROR,
                    'User not found for wallet refund',
                    HttpStatusCode.INTERNAL_SERVER
                )
            }

            if(!admin || !admin.id){
                throw new AppError(
                    ErrorCode.INTERNAL_ERROR,
                    'Admin user not founf for wallet adjustment',
                    HttpStatusCode.INTERNAL_SERVER
                )
            }

            const amount=booking.amount
            const interviewerAmount=booking.interviewerAmount
            const adminFee=booking.adminFee

            const userCedit=toCreateWalletTransactionDTO({
                userId:booking.userId,
                role:'user',
                type:'credit',
                amount,
                reason:'Refund Processed',
                bookingId:booking.id,
                userName:user.name
            })

            const interviewerDebit=toCreateWalletTransactionDTO({
                userId:booking.interviewerId,
                role:'interviewer',
                type:'debit',
                amount:interviewerAmount,
                reason: 'Session Cancelled',
                bookingId: booking.id,
                userName: user.name,
            })

            const adminDebit=toCreateWalletTransactionDTO({
                userId:admin.id,
                role:'admin',
                type:'debit',
                amount:adminFee,
                reason:'Session Cancelled',
                bookingId:booking.id,
                userName:user.name
            })

            const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
            const now = new Date();
            const timeDifference = bookingDateTime.getTime() - now.getTime();
            const hoursUntilBooking = timeDifference / (1000 * 60 * 60);

            if (hoursUntilBooking < 24) {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Cannot cancel booking less than 24 hours before the scheduled time',
                    HttpStatusCode.BAD_REQUEST
                );
            }

            await Promise.all([
                this._walletRepository.createTransaction(userCedit),
                this._walletRepository.createTransaction(interviewerDebit),
                this._walletRepository.createTransaction(adminDebit)
            ])

            

            const cancelledBooking = await this._bookingRepository.cancelBooking(data.bookingId, data.reason);

            if (!cancelledBooking) {
                throw new AppError(
                    ErrorCode.DATABASE_ERROR,
                    'Failed to cancel booking',
                    HttpStatusCode.INTERNAL_SERVER
                );
            }

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                ErrorCode.UNKNOWN_ERROR,
                'An unexpected error occurred while cancelling booking',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }
}












