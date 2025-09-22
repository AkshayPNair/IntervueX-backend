import { Booking, BookingStatus } from "../entities/Booking";
import { BookingFilterDTO,CreateBookingDTO } from "../dtos/booking.dto";
import { IBaseRepository } from "./IBaseRepository";
import { Document } from "mongoose";

export interface IBookingRepository extends IBaseRepository<Document>{
    createBooking(userId:string,data:CreateBookingDTO):Promise<Booking>;
    getBookingById(bookingId:string):Promise<Booking|null>;
    getBookingsByFilter(filter:BookingFilterDTO):Promise<Booking[]>;
    updateBookingStatus(bookingId:string,status:BookingStatus):Promise<Booking|null>;
    checkSlotAvailability(interviewerId:string,date:string,startTime:string,endTime:string):Promise<boolean>;
    cancelBooking(bookingId:string,reason:string):Promise<Booking|null>;
    completeBooking(bookingId:string):Promise<Booking|null>;
    updateReminderFlags(bookingId: string, flags: { reminderEmail15Sent?: boolean; reminderEmail5Sent?: boolean }): Promise<void>;
}