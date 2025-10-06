import { Booking, BookingStatus } from "../entities/Booking";
import { BookingFilterDTO,CreateBookingDTO } from "../dtos/booking.dto";
import { IBaseRepository } from "./IBaseRepository";
import { Document } from "mongoose";

export interface IBookingRepository extends IBaseRepository<Document>{
    createBooking(userId:string,data:CreateBookingDTO):Promise<Booking>;
    getBookingById(bookingId:string):Promise<Booking|null>;
    getBookingsByFilter(filter:BookingFilterDTO):Promise<Booking[]>;
    getBookingsByFilterPaginated(filter:BookingFilterDTO, page?: number, pageSize?: number):Promise<{ bookings: Booking[], total: number }>;
    updateBookingStatus(bookingId:string,status:BookingStatus):Promise<Booking|null>;
    updatePaymentId(bookingId:string,paymentId:string):Promise<void>;
    checkSlotAvailability(interviewerId:string,date:string,startTime:string,endTime:string):Promise<boolean>;
    cancelBooking(bookingId:string,reason:string):Promise<Booking|null>;
    completeBooking(bookingId:string):Promise<Booking|null>;
    updateReminderFlags(bookingId: string, flags: { reminderEmail15Sent?: boolean; reminderEmail5Sent?: boolean }): Promise<void>;
    getExpiredPendingBookings(olderThan: Date): Promise<Booking[]>;
    
}