import { IBookingRepository } from "../../../domain/interfaces/IBookingRepository";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { CreateBookingDTO, BookingResponseDTO } from "../../../domain/dtos/booking.dto";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { toBookingResponseDTO } from "../../../application/mappers/bookingMapper";
import { mapRepositoryToInterviewerDTO } from "../../../application/mappers/interviewerMapper";
import { toCreateWalletTransactionDTO } from "../../../application/mappers/walletMapper";
import { PaymentMethod } from "../../../domain/entities/Booking";
import { IWalletRepository } from "../../../domain/interfaces/IWalletRepository";
import { ICreateBookingService } from "../../../domain/interfaces/ICreateBookingService";

export class CreateBookingUseCase implements ICreateBookingService{
    constructor(
        private _bookingRepository: IBookingRepository,
        private _userRepository: IUserRepository,
        private _walletRepository: IWalletRepository
    ) { }

    async execute(userId: string, data: CreateBookingDTO): Promise<BookingResponseDTO> {
        try {
            const user = await this._userRepository.findUserById(userId)
            if (!user) {
                throw new AppError(
                    ErrorCode.NOT_FOUND,
                    'User not found',
                    HttpStatusCode.NOT_FOUND
                )
            }

            const interviewer = await this._userRepository.findApprovedInterviewerById(data.interviewerId)
            if (!interviewer) {
                throw new AppError(
                    ErrorCode.NOT_FOUND,
                    'Interviewer not found',
                    HttpStatusCode.NOT_FOUND
                )
            }

            const isAvailable = await this._bookingRepository.checkSlotAvailability(
                data.interviewerId,
                data.date,
                data.startTime,
                data.endTime
            )

            if (!isAvailable) {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'This slot is no longer available',
                    HttpStatusCode.BAD_REQUEST
                )
            }

            const interviewerDTO = mapRepositoryToInterviewerDTO(interviewer)

            if(data.paymentMethod === PaymentMethod.WALLET){
                const userWallet=await this._walletRepository.getOrCreateWallet(userId,'user')
                if(userWallet.balance<data.amount){
                    throw new AppError(
                        ErrorCode.PAYMENT_ERROR,
                        'Insufficient wallet balance',
                        HttpStatusCode.BAD_REQUEST
                    )
                }
            }

            const booking = await this._bookingRepository.createBooking(userId, data)

            if (booking.paymentMethod === PaymentMethod.RAZORPAY || booking.paymentMethod === PaymentMethod.WALLET) {
                const admin = await this._userRepository.findAdmin()
                if (!admin || !admin.id) {
                    throw new AppError(
                        ErrorCode.INTERNAL_ERROR,
                        'Admin user not found for wallet credit',
                        HttpStatusCode.INTERNAL_SERVER
                    );
                }

                if(booking.paymentMethod === PaymentMethod.WALLET){
                    const userTnx=toCreateWalletTransactionDTO({
                        userId:booking.userId,
                        role:'user',
                        type:'debit',
                        amount:booking.amount,
                        reason:'Session Booked',
                        bookingId:booking.id,
                        userName: user.name
                    })
                    await this._walletRepository.createTransaction(userTnx)
                }

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
                })
                await this._walletRepository.createTransaction(interviewerTnx)

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
                })
                await this._walletRepository.createTransaction(adminTnx);
            }

            return toBookingResponseDTO(booking, interviewerDTO)

        } catch (error) {
            if (error instanceof AppError) {
                throw error
            }
            throw new AppError(
                ErrorCode.INTERNAL_ERROR,
                'Failed to create booking',
                HttpStatusCode.INTERNAL_SERVER
            )
        }
    }
}