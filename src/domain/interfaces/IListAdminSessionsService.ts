import { AdminBookingListDTO } from "../dtos/booking.dto";

export interface IListAdminSessionsService {
  execute(searchQuery?: string, page?: number, pageSize?: number): Promise<{ sessions: AdminBookingListDTO[], total: number }>;
}