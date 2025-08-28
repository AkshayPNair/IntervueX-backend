import { IBookingRepository } from "../../../domain/interfaces/IBookingRepository";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { BookingResponseDTO, InterviewerBookingResponseDTO, } from "../../../domain/dtos/booking.dto";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { toInterviewerBookingResponseDTO } from "../../mappers/bookingMapper";
import { toUserProfileDTO } from "../../../application/mappers/userMapper";
import { IGetInterviewerBookingsService } from "../../../domain/interfaces/IGetInterviewerBookingsService";


export class GetInterviewerBookingsUseCase implements IGetInterviewerBookingsService{
    constructor(
        private _bookingRepository:IBookingRepository,
        private _userRepository:IUserRepository
    ){}

    async execute(interviewerId:string):Promise<InterviewerBookingResponseDTO[]>{
        try {
            const interviewer=await this._userRepository.findApprovedInterviewerById(interviewerId)
            if(!interviewer){
                throw new AppError(
                    ErrorCode.NOT_FOUND,
                    'Interviewer not found',
                    HttpStatusCode.NOT_FOUND
                )
            }

            const bookings=await this._bookingRepository.getBookingsByFilter({interviewerId})

            const userIds=[...new Set(bookings.map(booking=> booking.userId))]

            const users=await Promise.all(
                userIds.map(id=> this._userRepository.findUserById(id))
            )

            const userMap = new Map()
            users.forEach(user=>{
                if(user){
                    userMap.set(user.id,toUserProfileDTO(user))
                }
            })

            return bookings.map(booking=>
                toInterviewerBookingResponseDTO(booking,userMap.get(booking.userId))
            )

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