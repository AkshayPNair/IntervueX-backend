import { CancelBookingDTO } from "../dtos/booking.dto";

export interface ICancelBookingService{
    execute(userId:string,data:CancelBookingDTO):Promise<void>
}