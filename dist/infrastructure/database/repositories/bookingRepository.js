"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRepository = void 0;
const mongoose_1 = require("mongoose");
const Booking_1 = require("../../../domain/entities/Booking");
const BookingModel_1 = require("../models/BookingModel");
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const baseRepository_1 = require("./baseRepository");
class BookingRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(BookingModel_1.BookingModel);
    }
    async createBooking(userId, data) {
        try {
            const userObjectId = new mongoose_1.Types.ObjectId(userId);
            const interviewerObjectId = new mongoose_1.Types.ObjectId(data.interviewerId);
            const isAvailable = await this.checkSlotAvailability(data.interviewerId, data.date, data.startTime, data.endTime);
            if (!isAvailable) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, "This slot is no longer available", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const adminFee = Math.round(data.amount * 0.1);
            const interviewerAmount = data.amount - adminFee;
            const bookingDoc = await this.create({
                userId: userObjectId,
                interviewerId: interviewerObjectId,
                date: data.date,
                startTime: data.startTime,
                endTime: data.endTime,
                amount: data.amount,
                adminFee,
                interviewerAmount,
                paymentMethod: data.paymentMethod,
                paymentId: data.paymentId,
                status: data.paymentMethod === Booking_1.PaymentMethod.RAZORPAY ? Booking_1.BookingStatus.PENDING : Booking_1.BookingStatus.CONFIRMED
            });
            return new Booking_1.Booking(bookingDoc._id.toString(), bookingDoc.userId.toString(), bookingDoc.interviewerId.toString(), bookingDoc.date, bookingDoc.startTime, bookingDoc.endTime, bookingDoc.amount, bookingDoc.adminFee, bookingDoc.interviewerAmount, bookingDoc.status, bookingDoc.paymentMethod, bookingDoc.paymentId, bookingDoc.cancellationReason, bookingDoc.reminderEmail15Sent ?? false, bookingDoc.reminderEmail5Sent ?? false, bookingDoc.createdAt, bookingDoc.updatedAt);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            if (error.name === 'ValidationError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid booking data', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            if (error.name === 'CastError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid ID format', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to create booking', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async getBookingById(bookingId) {
        try {
            const bookingDoc = await this.findById(bookingId);
            if (!bookingDoc) {
                return null;
            }
            return new Booking_1.Booking(bookingDoc._id.toString(), bookingDoc.userId.toString(), bookingDoc.interviewerId.toString(), bookingDoc.date, bookingDoc.startTime, bookingDoc.endTime, bookingDoc.amount, bookingDoc.adminFee, bookingDoc.interviewerAmount, bookingDoc.status, bookingDoc.paymentMethod, bookingDoc.paymentId, bookingDoc.cancellationReason, bookingDoc.reminderEmail15Sent ?? false, bookingDoc.reminderEmail5Sent ?? false, bookingDoc.createdAt, bookingDoc.updatedAt);
        }
        catch (error) {
            if (error.name === 'CastError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid booking ID', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to get booking', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async getBookingsByFilter(filter) {
        try {
            const query = {};
            if (filter.userId) {
                query.userId = new mongoose_1.Types.ObjectId(filter.userId);
            }
            if (filter.interviewerId) {
                query.interviewerId = new mongoose_1.Types.ObjectId(filter.interviewerId);
            }
            if (filter.status) {
                query.status = filter.status;
            }
            if (filter.startDate || filter.endDate) {
                query.date = {};
                if (filter.startDate) {
                    query.date.$gte = filter.startDate;
                }
                if (filter.endDate) {
                    query.date.$lte = filter.endDate;
                }
            }
            const bookingDocs = await this.findAll(query);
            return bookingDocs.map(doc => new Booking_1.Booking(doc._id.toString(), doc.userId.toString(), doc.interviewerId.toString(), doc.date, doc.startTime, doc.endTime, doc.amount, doc.adminFee, doc.interviewerAmount, doc.status, doc.paymentMethod, doc.paymentId, doc.cancellationReason, doc.reminderEmail15Sent ?? false, doc.reminderEmail5Sent ?? false, doc.createdAt, doc.updatedAt));
        }
        catch (error) {
            if (error.name === 'CastError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid ID format in filter', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to get bookings', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async updateBookingStatus(bookingId, status) {
        try {
            const updatedDoc = await this.update(bookingId, {
                status,
                updatedAt: new Date()
            });
            if (!updatedDoc) {
                return null;
            }
            return new Booking_1.Booking(updatedDoc._id.toString(), updatedDoc.userId.toString(), updatedDoc.interviewerId.toString(), updatedDoc.date, updatedDoc.startTime, updatedDoc.endTime, updatedDoc.amount, updatedDoc.adminFee, updatedDoc.interviewerAmount, updatedDoc.status, updatedDoc.paymentMethod, updatedDoc.paymentId, updatedDoc.cancellationReason, updatedDoc.reminderEmail15Sent ?? false, updatedDoc.reminderEmail5Sent ?? false, updatedDoc.createdAt, updatedDoc.updatedAt);
        }
        catch (error) {
            if (error.name === 'CastError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid booking ID', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to update booking status', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async updatePaymentId(bookingId, paymentId) {
        try {
            await this.update(bookingId, {
                paymentId,
                updatedAt: new Date()
            });
        }
        catch (error) {
            if (error.name === 'CastError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid booking ID', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to update payment id', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async cancelBooking(bookingId, reason) {
        try {
            const updatedDoc = await this.update(bookingId, {
                status: Booking_1.BookingStatus.CANCELLED,
                cancellationReason: reason,
                updatedAt: new Date()
            });
            if (!updatedDoc) {
                return null;
            }
            return new Booking_1.Booking(updatedDoc._id.toString(), updatedDoc.userId.toString(), updatedDoc.interviewerId.toString(), updatedDoc.date, updatedDoc.startTime, updatedDoc.endTime, updatedDoc.amount, updatedDoc.adminFee, updatedDoc.interviewerAmount, updatedDoc.status, updatedDoc.paymentMethod, updatedDoc.paymentId, updatedDoc.cancellationReason, updatedDoc.reminderEmail15Sent ?? false, updatedDoc.reminderEmail5Sent ?? false, updatedDoc.createdAt, updatedDoc.updatedAt);
        }
        catch (error) {
            if (error.name === 'CastError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid booking ID', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to cancel booking', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async completeBooking(bookingId) {
        try {
            const updatedDoc = await this.update(bookingId, {
                status: Booking_1.BookingStatus.COMPLETED,
                updatedAt: new Date()
            });
            if (!updatedDoc) {
                return null;
            }
            return new Booking_1.Booking(updatedDoc._id.toString(), updatedDoc.userId.toString(), updatedDoc.interviewerId.toString(), updatedDoc.date, updatedDoc.startTime, updatedDoc.endTime, updatedDoc.amount, updatedDoc.adminFee, updatedDoc.interviewerAmount, updatedDoc.status, updatedDoc.paymentMethod, updatedDoc.paymentId, updatedDoc.cancellationReason, updatedDoc.reminderEmail15Sent ?? false, updatedDoc.reminderEmail5Sent ?? false, updatedDoc.createdAt, updatedDoc.updatedAt);
        }
        catch (error) {
            if (error.name === 'CastError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid booking ID', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to complete booking', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async checkSlotAvailability(interviewerId, date, startTime, endTime) {
        try {
            const interviewerObjectId = new mongoose_1.Types.ObjectId(interviewerId);
            const existingBooking = await this.findOne({
                interviewerId: interviewerObjectId,
                date: date,
                startTime: startTime,
                endTime: endTime,
                status: { $in: [Booking_1.BookingStatus.CONFIRMED, Booking_1.BookingStatus.PENDING, Booking_1.BookingStatus.COMPLETED] }
            });
            return !existingBooking;
        }
        catch (error) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to check slot availability', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async updateReminderFlags(bookingId, flags) {
        try {
            await this.update(bookingId, { ...flags, updatedAt: new Date() });
        }
        catch (error) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to update reminder flags', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async getExpiredPendingBookings(olderThan) {
        try {
            const bookingDocs = await this.findAll({
                status: Booking_1.BookingStatus.PENDING,
                paymentMethod: Booking_1.PaymentMethod.RAZORPAY
            });
            // Filter by createdAt in memory as a temporary fix
            const expiredDocs = bookingDocs.filter(doc => doc.createdAt < olderThan);
            return expiredDocs.map(doc => new Booking_1.Booking(doc._id.toString(), doc.userId.toString(), doc.interviewerId.toString(), doc.date, doc.startTime, doc.endTime, doc.amount, doc.adminFee, doc.interviewerAmount, doc.status, doc.paymentMethod, doc.paymentId, doc.cancellationReason, doc.reminderEmail15Sent ?? false, doc.reminderEmail5Sent ?? false, doc.createdAt, doc.updatedAt));
        }
        catch (error) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to get expired pending bookings', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.BookingRepository = BookingRepository;
