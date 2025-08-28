import { Types } from "mongoose";
import { IBookingRepository } from '../../../domain/interfaces/IBookingRepository';
import { Booking, BookingStatus } from '../../../domain/entities/Booking';
import { BookingFilterDTO, CreateBookingDTO } from '../../../domain/dtos/booking.dto';
import { BookingModel, IBookingDocument } from '../models/BookingModel';
import { AppError } from '../../../application/error/AppError';
import { ErrorCode } from '../../../application/error/ErrorCode';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';
import { BaseRepository } from './baseRepository';

export class BookingRepository extends BaseRepository<IBookingDocument> implements IBookingRepository{
    constructor(){
        super(BookingModel)
    }

    async createBooking(userId: string, data: CreateBookingDTO): Promise<Booking> {
        try {
            const userObjectId=new Types.ObjectId(userId)
            const interviewerObjectId=new Types.ObjectId(data.interviewerId)

            const isAvailable=await this.checkSlotAvailability(
                data.interviewerId,
                data.date,
                data.startTime,
                data.endTime
            )

            if(!isAvailable){
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    "This slot is no longer available",
                    HttpStatusCode.BAD_REQUEST
                );
            }

            const adminFee=Math.round(data.amount*0.1)
            const interviewerAmount=data.amount-adminFee

            const bookingDoc=await this.create({
                userId:userObjectId,
                interviewerId:interviewerObjectId,
                date:data.date,
                startTime:data.startTime,
                endTime:data.endTime,
                amount:data.amount,
                adminFee,
                interviewerAmount,
                paymentMethod:data.paymentMethod,
                paymentId:data.paymentId,
                status:BookingStatus.CONFIRMED
            })

            return new Booking(
                (bookingDoc._id as Types.ObjectId).toString(),
                bookingDoc.userId.toString(),
                bookingDoc.interviewerId.toString(),
                bookingDoc.date,
                bookingDoc.startTime,
                bookingDoc.endTime,
                bookingDoc.amount,
                bookingDoc.adminFee,
                bookingDoc.interviewerAmount,
                bookingDoc.status,
                bookingDoc.paymentMethod,
                bookingDoc.paymentId,
                bookingDoc.cancellationReason,
                bookingDoc.createdAt,
                bookingDoc.updatedAt
            )

        } catch (error:any) {
            if (error instanceof AppError) {
                throw error;
            }
            if (error.name === 'ValidationError') {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Invalid booking data',
                    HttpStatusCode.BAD_REQUEST
                );
            }
            if (error.name === 'CastError') {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Invalid ID format',
                    HttpStatusCode.BAD_REQUEST
                );
            }
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to create booking',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }

    async getBookingById(bookingId:string):Promise<Booking | null>{
        try {
            const bookingDoc = await this.findById(bookingId)

            if(!bookingDoc){
                return null
            }

            return new Booking(
               (bookingDoc._id as Types.ObjectId).toString(),
                bookingDoc.userId.toString(),
                bookingDoc.interviewerId.toString(),
                bookingDoc.date,
                bookingDoc.startTime,
                bookingDoc.endTime,
                bookingDoc.amount,
                bookingDoc.adminFee,
                bookingDoc.interviewerAmount,
                bookingDoc.status,
                bookingDoc.paymentMethod,
                bookingDoc.paymentId,
                bookingDoc.cancellationReason,
                bookingDoc.createdAt,
                bookingDoc.updatedAt
            )
        } catch (error:any) {
            if (error.name === 'CastError') {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Invalid booking ID',
                    HttpStatusCode.BAD_REQUEST
                );
            }
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to get booking',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }

    async getBookingsByFilter(filter: BookingFilterDTO): Promise<Booking[]> {
        try {
            const query:any={}

            if(filter.userId){
                query.userId=new Types.ObjectId(filter.userId)
            }

            if(filter.interviewerId){
                query.interviewerId=new Types.ObjectId(filter.interviewerId)
            }

            if(filter.status){
                query.status=filter.status
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

            return bookingDocs.map(doc => new Booking(
                (doc._id as Types.ObjectId).toString(),
                doc.userId.toString(),
                doc.interviewerId.toString(),
                doc.date,
                doc.startTime,
                doc.endTime,
                doc.amount,
                doc.adminFee,
                doc.interviewerAmount,
                doc.status,
                doc.paymentMethod,
                doc.paymentId,
                doc.cancellationReason,
                doc.createdAt,
                doc.updatedAt
            ));

        } catch (error:any) {
            if (error.name === 'CastError') {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Invalid ID format in filter',
                    HttpStatusCode.BAD_REQUEST
                );
            }
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to get bookings',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }

    async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking | null> {
        try {
            const updatedDoc=await this.update(bookingId,{
                status,
                updatedAt:new Date()
            })

            if(!updatedDoc){
                return null
            }

            return new Booking(
                (updatedDoc._id as Types.ObjectId).toString(),
                updatedDoc.userId.toString(),
                updatedDoc.interviewerId.toString(),
                updatedDoc.date,
                updatedDoc.startTime,
                updatedDoc.endTime,
                updatedDoc.amount,
                updatedDoc.adminFee,
                updatedDoc.interviewerAmount,
                updatedDoc.status,
                updatedDoc.paymentMethod,
                updatedDoc.paymentId,
                updatedDoc.cancellationReason,
                updatedDoc.createdAt,
                updatedDoc.updatedAt
            )
        } catch (error:any) {
            if (error.name === 'CastError') {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Invalid booking ID',
                    HttpStatusCode.BAD_REQUEST
                );
            }
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to update booking status',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }

    async cancelBooking(bookingId:string, reason:string):Promise<Booking | null>{
        try {
            const updatedDoc=await this.update(bookingId,{
                status:BookingStatus.CANCELLED,
                cancellationReason:reason,
                updatedAt:new Date()
            })

            if(!updatedDoc){
                return null
            }

            return new Booking(
                (updatedDoc._id as Types.ObjectId).toString(),
                updatedDoc.userId.toString(),
                updatedDoc.interviewerId.toString(),
                updatedDoc.date,
                updatedDoc.startTime,
                updatedDoc.endTime,
                updatedDoc.amount,
                updatedDoc.adminFee,
                updatedDoc.interviewerAmount,
                updatedDoc.status,
                updatedDoc.paymentMethod,
                updatedDoc.paymentId,
                updatedDoc.cancellationReason,
                updatedDoc.createdAt,
                updatedDoc.updatedAt
            )
        } catch (error:any) {
            if (error.name === 'CastError') {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                   'Invalid booking ID',
                    HttpStatusCode.BAD_REQUEST
                );
            }
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to cancel booking',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }

    async completeBooking(bookingId:string):Promise<Booking | null>{
        try {
            const updatedDoc=await this.update(bookingId,{
                status:BookingStatus.COMPLETED,
                updatedAt:new Date()
            })

            if(!updatedDoc){
                return null
            }

            return new Booking(
                (updatedDoc._id as Types.ObjectId).toString(),
                updatedDoc.userId.toString(),
                updatedDoc.interviewerId.toString(),
                updatedDoc.date,
                updatedDoc.startTime,
                updatedDoc.endTime,
                updatedDoc.amount,
                updatedDoc.adminFee,
                updatedDoc.interviewerAmount,
                updatedDoc.status,
                updatedDoc.paymentMethod,
                updatedDoc.paymentId,
                updatedDoc.cancellationReason,
                updatedDoc.createdAt,
                updatedDoc.updatedAt
            )
        } catch (error:any) {
            if (error.name === 'CastError') {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                   'Invalid booking ID',
                    HttpStatusCode.BAD_REQUEST
                );
            }
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to complete booking',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }

    async checkSlotAvailability(interviewerId: string, date: string, startTime: string, endTime: string): Promise<boolean> {
        try {
            const interviewerObjectId=new Types.ObjectId(interviewerId)

            const existingBooking=await this.findOne({
                interviewerId:interviewerObjectId,
                date:date,
                startTime:startTime,
                endTime:endTime,
                status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING, BookingStatus.COMPLETED] }
            });
            return !existingBooking
        } catch (error) {
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to check slot availability',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }

}