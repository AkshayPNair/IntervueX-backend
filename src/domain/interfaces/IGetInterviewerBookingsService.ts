import { InterviewerBookingResponseDTO } from "../dtos/booking.dto";

export interface IGetInterviewerBookingsService{
    execute(interviewerId:string, search?:string):Promise<InterviewerBookingResponseDTO[]>
}