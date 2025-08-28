import { BookingResponseDTO } from "../dtos/booking.dto";

export interface IGetUserBookingsService{
    execute(userId:string):Promise<BookingResponseDTO[]>
}