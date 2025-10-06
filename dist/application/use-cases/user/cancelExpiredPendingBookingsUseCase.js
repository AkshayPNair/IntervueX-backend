"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelExpiredPendingBookingsUseCase = void 0;
const logger_1 = require("../../../utils/logger");
class CancelExpiredPendingBookingsUseCase {
    constructor(_bookingRepository) {
        this._bookingRepository = _bookingRepository;
    }
    async execute() {
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
                    logger_1.logger.info(`Cancelled expired pending booking: ${booking.id}`);
                }
                catch (error) {
                    logger_1.logger.error(`Failed to cancel booking ${booking.id}`, { error });
                }
            }
            return { cancelled: cancelledCount };
        }
        catch (error) {
            logger_1.logger.error('Error in CancelExpiredPendingBookingsUseCase', { error });
            throw error;
        }
    }
}
exports.CancelExpiredPendingBookingsUseCase = CancelExpiredPendingBookingsUseCase;
