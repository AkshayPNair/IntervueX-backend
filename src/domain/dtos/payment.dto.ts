import { BookingStatus, PaymentMethod } from "../entities/Booking";

export interface PaymentRecordDTO{
    bookingId:string;
    date:string;
    amount:number;
    paymentMethod:PaymentMethod;
    status:BookingStatus;
    interviewerName?:string
}

export interface PaymentStatsDTO{
    totalBooked:number;
    completed:number;
    cancelled:number;
}

export interface PaymentHistoryDTO{
    stats:PaymentStatsDTO;
    payments:PaymentRecordDTO[];
}