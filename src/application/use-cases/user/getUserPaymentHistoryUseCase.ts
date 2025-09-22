import { IGetUserPaymentHistoryService } from "../../../domain/interfaces/IGetUserPaymentHistoryService";
import { IBookingRepository } from "../../../domain/interfaces/IBookingRepository";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { PaymentHistoryDTO } from "../../../domain/dtos/payment.dto";
import { toPaymentHistoryDTO } from "../../mappers/paymentMapper";

export class GetUserPaymentHistoryUseCase implements IGetUserPaymentHistoryService {
    constructor(
        private _bookingRepository: IBookingRepository,
        private _userRepository: IUserRepository
    ) { }

    async execute(userId: string): Promise<PaymentHistoryDTO> {
        try {
            const user = await this._userRepository.findUserById(userId)
            if (!user) {
                throw new AppError(
                    ErrorCode.NOT_FOUND,
                    'User not found',
                    HttpStatusCode.NOT_FOUND
                )
            }

            const bookings = await this._bookingRepository.getBookingsByFilter({ userId })

            const interviewerIds = Array.from(new Set(bookings.map(b => b.interviewerId)))
            const interviewerMap = new Map<string, string>()
            await Promise.all(
                interviewerIds.map(async (id) => {
                    const interviewer = await this._userRepository.findApprovedInterviewerById(id)
                    if (interviewer) interviewerMap.set(id, interviewer.name)
                })
            )

            return toPaymentHistoryDTO(bookings, interviewerMap)
        } catch (error) {
            if (error instanceof AppError) throw error
            throw new AppError(
                ErrorCode.INTERNAL_ERROR,
                'Failed to get user payment history',
                HttpStatusCode.INTERNAL_SERVER
            )

        }
    }
}