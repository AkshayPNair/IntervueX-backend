import { IBookingRepository } from "../../../domain/interfaces/IBookingRepository";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { BookingResponseDTO } from "../../../domain/dtos/booking.dto";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { toBookingResponseDTO } from "../../mappers/bookingMapper";
import { mapRepositoryToInterviewerDTO } from "../../mappers/interviewerMapper";
import { IGetUserBookingsService } from "../../../domain/interfaces/IGetUserBookingsService";


export class GetUserBookingsUseCase implements IGetUserBookingsService{
    constructor(
        private _bookingRepository: IBookingRepository,
        private _userRepository: IUserRepository
    ) { }

    async execute(userId:string):Promise<BookingResponseDTO[]>{
        try {
            
            const user=await this._userRepository.findUserById(userId)
            if(!user){
                throw new AppError(
                    ErrorCode.NOT_FOUND,
                    'User not found',
                    HttpStatusCode.NOT_FOUND
                )
            }

            const bookings=await this._bookingRepository.getBookingsByFilter({userId})

            const interviewerIds=[...new Set(bookings.map(booking=>booking.interviewerId))]

            const interviewers=await Promise.all(
                interviewerIds.map(id=>this._userRepository.findApprovedInterviewerById(id))
            )

            const interviewerMap=new Map()
            interviewers.forEach(interviewer=>{
                if(interviewer){
                     const interviewerProfileDTO = mapRepositoryToInterviewerDTO(interviewer)
                    interviewerMap.set(interviewer._id.toString(),interviewerProfileDTO)
                }
            })

            return bookings.map(booking=>
                toBookingResponseDTO(booking,interviewerMap.get(booking.interviewerId))
            );

        } catch (error) {
            if(error instanceof AppError){
                throw error
            }
            throw new  AppError(
                ErrorCode.INTERNAL_ERROR,
                'Failed to get user bookings',
                HttpStatusCode.INTERNAL_SERVER
            )
        }
    }

}