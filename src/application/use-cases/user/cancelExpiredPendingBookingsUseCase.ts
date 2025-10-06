import { IBookingRepository } from "../../../domain/interfaces/IBookingRepository";
import { ICancelExpiredPendingBookingsService } from "../../../domain/interfaces/ICancelExpiredPendingBookingsService";
import { logger } from '../../../utils/logger';

export class CancelExpiredPendingBookingsUseCase implements ICancelExpiredPendingBookingsService {
    constructor(private _bookingRepository: IBookingRepository) {}

    async execute(): Promise<{ cancelled: number }> {
        try {
            // Find PENDING bookings older than 10 minutes for Razorpay payments
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

            // Get expired pending Razorpay bookings from the database
            const razorpayExpiredBookings = await this._bookingRepository.getExpiredPendingBookings(tenMinutesAgo);

            let cancelledCount = 0;

            for (const booking of razorpayExpiredBookings) {
                try {
                    await this._bookingRepository.cancelBooking(booking.id, 'Payment not completed within 10 minutes');
                    cancelledCount++;
                    logger.info(`Cancelled expired pending booking: ${booking.id}`);
                } catch (error) {
                    logger.error(`Failed to cancel booking ${booking.id}`, { error });
                }
            }

            return { cancelled: cancelledCount };
        } catch (error) {
            logger.error('Error in CancelExpiredPendingBookingsUseCase', { error });
            throw error;
        }
    }
}