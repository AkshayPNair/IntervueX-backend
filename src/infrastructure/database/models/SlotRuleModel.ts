import mongoose, { Schema, Document, Types } from "mongoose";
import { DaySlotRule } from "../../../domain/entities/SlotRule";
import { Interviewer } from "@/domain/entities/Interviewer";

export interface ISlotRuleDocument extends Document {
    interviewerId: Types.ObjectId;
    slotRules: DaySlotRule[];
    blockedDates: string[];
    excludedSlotsByDate: Record<string, { startTime: string; endTime: string }[]>;
    createdAt: Date;
    updatedAt: Date;
}

const DaySlotRuleSchema = new Schema<DaySlotRule>({
    day: {
        type: String,
        required: true,
        enum: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
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
    bufferTime: {
        type: Number,
        required: true,
        min: 0,
        max: 60
    },
    enabled: {
        type: Boolean,
        required: true,
        default: false
    }
}, { _id: false })

const ExcludedTimeSlotSchema = new Schema({
    startTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    }
}, { _id: false })

const SlotRuleSchema = new Schema<ISlotRuleDocument>({
    interviewerId: {
        type: Schema.Types.ObjectId,
        ref: 'Interviewer',
        required: true,
        unique: true,
        index: true
    },
    slotRules: {
        type: [DaySlotRuleSchema],
        required: true,
        validate: {
            validator: function (slotRules: DaySlotRule[]) {
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const ruleDays = slotRules.map(s => s.day);
                return days.every(day => ruleDays.includes(day));
            },
            message: 'Slot rules must contain all 7 days of the week'
        }
    },
    blockedDates: {
        type: [String],
        default: [],
        validate: {
            validator: function (dates: string[]) {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                return dates.every(date => dateRegex.test(date));
            },
            message: 'Blocked dates must be in YYYY-MM-DD format'
        }
    },
    excludedSlotsByDate: {
        type: Map,
        of: [ExcludedTimeSlotSchema],
        default: {},
        validate: {
            validator: function(map: Map<string, { startTime: string; endTime: string }[]>) {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                for (const [date, slots] of (map as any).entries()) {
                    if (!dateRegex.test(date)) return false;
                    if (!Array.isArray(slots)) return false;
                }
                return true;
            },
            message: 'excludedSlotsByDate keys must be YYYY-MM-DD and values arrays of time ranges'
        }
    }    
}, {
    timestamps: true,
    collection: 'interviewer_slot_rules'
});

SlotRuleSchema.index({ interviewerId: 1 });
SlotRuleSchema.index({ 'slotRules.enabled': 1 });
SlotRuleSchema.index({ blockedDates: 1 });

export const SlotRuleModel = mongoose.model<ISlotRuleDocument>('SlotRule', SlotRuleSchema);