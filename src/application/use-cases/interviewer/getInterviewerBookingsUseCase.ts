import { IBookingRepository } from "../../../domain/interfaces/IBookingRepository";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { BookingResponseDTO, InterviewerBookingResponseDTO, PaginatedInterviewerBookingsDTO, } from "../../../domain/dtos/booking.dto";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { toInterviewerBookingResponseDTO } from "../../mappers/bookingMapper";
import { toUserProfileDTO } from "../../../application/mappers/userMapper";
import { IGetInterviewerBookingsService } from "../../../domain/interfaces/IGetInterviewerBookingsService";
import { BookingStatus } from "../../../domain/entities/Booking";

export class GetInterviewerBookingsUseCase implements IGetInterviewerBookingsService{
    constructor(
        private _bookingRepository:IBookingRepository,
        private _userRepository:IUserRepository
    ){}

    async execute(interviewerId:string,page: number,limit: number,status: BookingStatus, search:string=''):Promise<PaginatedInterviewerBookingsDTO>{
        try {
            const interviewer=await this._userRepository.findApprovedInterviewerById(interviewerId)
            if(!interviewer){
                throw new AppError(
                    ErrorCode.NOT_FOUND,
                    'Interviewer not found',
                    HttpStatusCode.NOT_FOUND
                )
            }

            const { bookings, total, userMap } = await this._bookingRepository.getInterviewerBookingsPaginated(
                interviewerId,
                page,
                limit,
                status,
                search
            )

            const data = bookings.map(booking =>
                toInterviewerBookingResponseDTO(booking, userMap.get(booking.userId))
            )

            return {
                data,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit) || 1,
                    totalItems: total,
                    limit
                }
            }

        } catch (error) {
             if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                ErrorCode.INTERNAL_ERROR,
                'Failed to get interviewer bookings',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }
}