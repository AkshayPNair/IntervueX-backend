import { IBookingRepository } from "../../../domain/interfaces/IBookingRepository";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { CompleteBookingDTO } from "../../../domain/dtos/booking.dto";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { BookingStatus } from "../../../domain/entities/Booking";
import { ICompleteBookingService } from "../../../domain/interfaces/ICompleteBookingService";

export class CompleteBookingUseCase implements ICompleteBookingService {
    constructor(private _bookingRepository: IBookingRepository) { }

    async execute(userId: string, data: CompleteBookingDTO): Promise<void> {
        const booking = await this._bookingRepository.getBookingById(data.bookingId)
        if (!booking) {
            throw new AppError(ErrorCode.NOT_FOUND, "Booking not found", HttpStatusCode.NOT_FOUND);
        }

        const isParticipant = booking.userId === userId || booking.interviewerId === userId;
        if (!isParticipant) {
            throw new AppError(
                ErrorCode.FORBIDDEN,
                "You are not allowed to complete this booking",
                HttpStatusCode.FORBIDDEN
            );
        }

        if (booking.status === BookingStatus.CANCELLED) {
            throw new AppError(
                ErrorCode.VALIDATION_ERROR,
                "Cannot complete a cancelled booking",
                HttpStatusCode.BAD_REQUEST
            );
        }

        // Idempotent: if already completed, do nothing
        if (booking.status === BookingStatus.COMPLETED) return;

        const updated = await this._bookingRepository.completeBooking(data.bookingId)
        if (!updated) {
            throw new AppError(
              ErrorCode.DATABASE_ERROR,
              "Failed to update booking status",
              HttpStatusCode.INTERNAL_SERVER
            );
          }
    }


}