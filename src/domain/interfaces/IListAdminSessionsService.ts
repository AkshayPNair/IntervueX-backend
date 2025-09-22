import { AdminBookingListDTO } from "../dtos/booking.dto";

export interface IListAdminSessionsService {
  execute(): Promise<AdminBookingListDTO[]>;
}