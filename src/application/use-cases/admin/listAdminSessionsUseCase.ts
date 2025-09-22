import { IListAdminSessionsService } from "../../../domain/interfaces/IListAdminSessionsService";
import { IBookingRepository } from "../../../domain/interfaces/IBookingRepository";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { AdminBookingListDTO } from "../../../domain/dtos/booking.dto";
import { toAdminBookingListDTO } from "../../../application/mappers/bookingMapper";

export class ListAdminSessionsUseCase implements IListAdminSessionsService{
    constructor(
        private _bookingRepository:IBookingRepository,
        private _userRepository:IUserRepository
    ) { }

    async execute(): Promise<AdminBookingListDTO[]> {
        const bookings = await this._bookingRepository.getBookingsByFilter({})

        const userIds = Array.from(new Set(bookings.map(b => b.userId)));
    const interviewerIds = Array.from(new Set(bookings.map(b => b.interviewerId)));

    const userMap = new Map<string, string>();
    for (const id of userIds) {
      const u = await this._userRepository.findUserById(id);
      userMap.set(id, u?.name || "Unknown User");
    }

    const interviewerMap = new Map<string, string>();
    for (const id of interviewerIds) {
      const i = await this._userRepository.findUserById(id);
      interviewerMap.set(id, i?.name || "Interviewer");
    }

    return bookings.map(booking =>
        toAdminBookingListDTO(
            booking,
            userMap.get(booking.userId) || 'Unknown User',
            interviewerMap.get(booking.interviewerId) || "Interviewer"
        )
    )
    }

}