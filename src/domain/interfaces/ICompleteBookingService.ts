import { CompleteBookingDTO } from "../dtos/booking.dto";

export interface ICompleteBookingService{
    execute(userId:string, data:CompleteBookingDTO):Promise<void>;
}