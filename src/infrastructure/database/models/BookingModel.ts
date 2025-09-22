import mongoose , {Schema,Document,Types} from "mongoose";
import { BookingStatus, PaymentMethod } from "../../../domain/entities/Booking";

export interface IBookingDocument extends Document{
    userId: Types.ObjectId;
    interviewerId: Types.ObjectId;
    date: string;
    startTime: string;
    endTime: string;
    amount: number;
    adminFee: number;
    interviewerAmount: number;
    status: BookingStatus;
    paymentMethod: PaymentMethod;
    paymentId?: string;
    cancellationReason?:string;
    reminderEmail15Sent: boolean;
    reminderEmail5Sent: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema=new Schema<IBookingDocument>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true
    },
    interviewerId: {
        type: Schema.Types.ObjectId,
        ref: 'Interviewer',
        required: true,
        index: true
    },
    date: {
        type: String,
        required: true,
        validate: {
            validator: function(date: string) {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                return dateRegex.test(date);
            },
            message: 'Date must be in YYYY-MM-DD format'
        },
        index: true
    },
    startTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    adminFee: {
        type: Number,
        required: true,
        min: 0
    },
    interviewerAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: Object.values(BookingStatus),
        default: BookingStatus.COMPLETED,
        required: true,
        index: true
    },
    paymentMethod: {
        type: String,
        enum: Object.values(PaymentMethod),
        required: true
    },
    paymentId: {
        type: String
    },
    cancellationReason:{
        type:String
    },
    reminderEmail15Sent: {
        type: Boolean,
        default: false
    },
    reminderEmail5Sent: {
        type: Boolean,
        default: false    
    }
},{
    timestamps:true,
    collection:'bookings'
})

BookingSchema.index({interviewerId:1,date:1,status:1})

export const BookingModel = mongoose.model<IBookingDocument>('Booking', BookingSchema);
