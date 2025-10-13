import { InterviewerBookingResponseDTO, PaginatedInterviewerBookingsDTO } from "../dtos/booking.dto";
import { BookingStatus } from "../entities/Booking";

export interface IGetInterviewerBookingsService {
    execute(interviewerId: string, page: number, limit: number, status: BookingStatus, search?: string): Promise<PaginatedInterviewerBookingsDTO>
}