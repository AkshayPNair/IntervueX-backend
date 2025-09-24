"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAdminBookingListDTO = exports.toCreateBookingDTO = exports.toInterviewerBookingResponseDTO = exports.toBookingResponseDTO = void 0;
const toBookingResponseDTO = (booking, interviewer) => {
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
    };
};
exports.toBookingResponseDTO = toBookingResponseDTO;
const toInterviewerBookingResponseDTO = (booking, user) => {
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
    };
};
exports.toInterviewerBookingResponseDTO = toInterviewerBookingResponseDTO;
const toCreateBookingDTO = (data) => {
    return {
        interviewerId: data.interviewerId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentId: data.paymentId
    };
};
exports.toCreateBookingDTO = toCreateBookingDTO;
const toAdminBookingListDTO = (booking, userName, interviewerName) => ({
    id: booking.id,
    userName,
    interviewerName,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: booking.status,
    paymentMethod: booking.paymentMethod
});
exports.toAdminBookingListDTO = toAdminBookingListDTO;
