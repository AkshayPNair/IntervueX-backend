export interface ICancelExpiredPendingBookingsService {
    execute(): Promise<{ cancelled: number }>;
}