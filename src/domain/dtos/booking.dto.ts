import { BookingStatus,PaymentMethod } from "../entities/Booking";

export interface CreateBookingDTO{
    interviewerId:string;
    date:string;
    startTime:string;
    endTime:string;
    amount:number;
    paymentMethod:PaymentMethod;
    discussionTopic: string;
    paymentId?:string;
}

export interface BookingResponseDTO{
    id:string;
    userId:string;
    interviewerId:string;
    interviewerName:string;
    interviewerProfilePicture?:string;
    interviewerJobTitle?:string;
    interviewerExperience?:number;
    date:string;
    startTime:string;
    endTime:string;
    amount:number;
    adminFee:number;
    interviewerAmount:number;
    status:BookingStatus;
    paymentMethod:PaymentMethod;
    discussionTopic?: string;
    paymentId?:string;
    cancelReason?:string;
    createdAt:Date;
    updatedAt:Date;
}

export interface InterviewerBookingResponseDTO{
    id: string;
    userId: string;
    interviewerId: string;
    date: string;
    startTime: string;
    endTime: string;
    amount: number;
    adminFee: number;
    interviewerAmount: number;
    status: BookingStatus;
    paymentMethod: PaymentMethod;
    discussionTopic?: string;
    paymentId?: string;
    cancelReason?: string;
    createdAt: Date;
    updatedAt:Date;
    userName: string;
    userEmail: string;
    userProfilePicture: string;
}

export interface BookingFilterDTO{
    userId?:string;
    interviewerId?:string;
    status?:BookingStatus;
    startDate?:string;
    endDate?:string;
}

export interface RazorpayOrderDTO{
    amount:number;
    currency:string;
    receipt:string;
}

export interface RazorpayOrderResponseDTO{
    id:string;
    amount:number;
    currency:string;
    receipt:string;
}

export interface CancelBookingDTO{
    bookingId:string;
    reason:string;
}
export interface CompleteBookingDTO{
    bookingId:string;
}

export interface AdminBookingListDTO{
    id: string;
    userName: string;
    interviewerName: string;
    date: string;
    startTime: string;
    endTime: string;
    status: BookingStatus;
    paymentMethod:PaymentMethod;
}

export interface VerifyPaymentDTO {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    bookingId: string;
}

export interface PaginatedInterviewerBookingsDTO {
    data: InterviewerBookingResponseDTO[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      limit: number;
    };
  }