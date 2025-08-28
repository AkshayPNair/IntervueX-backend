import { CreateBookingDTO, BookingResponseDTO } from "../dtos/booking.dto";

export interface ICreateBookingService{
    execute(userId:string,data:CreateBookingDTO):Promise<BookingResponseDTO>;
}