import { Booking, PaymentMethod } from "../../domain/entities/Booking";
import { BookingResponseDTO, CreateBookingDTO, InterviewerBookingResponseDTO, AdminBookingListDTO } from "../../domain/dtos/booking.dto";
import { InterviewerProfileDTO } from "../../domain/dtos/interviewer.dto";
import { UserProfileDTO } from "../../domain/dtos/user.dto";


export const toBookingResponseDTO = (
    booking: Booking,
    interviewer?: InterviewerProfileDTO
): BookingResponseDTO => {
    return {
        id: booking.id,
        userId: booking.userId,
        interviewerId: booking.interviewerId,
        interviewerName: interviewer?.user?.name || 'Interviewer',
        interviewerProfilePicture: interviewer?.profile?.profilePic,
        interviewerJobTitle: interviewer?.profile?.jobTitle,
        interviewerExperience: interviewer?.profile?.yearsOfExperience,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        amount: booking.amount,
        adminFee: booking.adminFee,
        interviewerAmount: booking.interviewerAmount,
        status: booking.status,
        paymentMethod: booking.paymentMethod,
        paymentId: booking.paymentId,
        cancelReason: booking.cancelReason,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
    }
}

export const toInterviewerBookingResponseDTO = (
    booking: Booking,
    user?: UserProfileDTO
): InterviewerBookingResponseDTO => {
    return {
        id: booking.id,
        userId: booking.userId,
        interviewerId: booking.interviewerId,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        amount: booking.amount,
        adminFee: booking.adminFee,
        interviewerAmount: booking.interviewerAmount,
        status: booking.status,
        paymentMethod: booking.paymentMethod,
        paymentId: booking.paymentId,
        cancelReason: booking.cancelReason,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        userName: user?.name || 'Unknown User',
        userEmail: user?.email || '',
        userProfilePicture: user?.profilePicture || '',
    }
}

export const toCreateBookingDTO = (data: CreateBookingDTO): CreateBookingDTO => {
    return {
        interviewerId: data.interviewerId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentId: data.paymentId
    }
}

export const toAdminBookingListDTO = (
    booking: Booking,
    userName: string,
    interviewerName: string
): AdminBookingListDTO => ({
    id: booking.id,
    userName,
    interviewerName,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: booking.status,
    paymentMethod:booking.paymentMethod
});