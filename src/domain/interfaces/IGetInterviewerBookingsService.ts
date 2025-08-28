import { InterviewerBookingResponseDTO } from "../dtos/booking.dto";

export interface IGetInterviewerBookingsService{
    execute(interviewerId:string):Promise<InterviewerBookingResponseDTO[]>
}