"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotRuleModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const DaySlotRuleSchema = new mongoose_1.Schema({
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
}, { _id: false });
const ExcludedTimeSlotSchema = new mongoose_1.Schema({
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
}, { _id: false });
const SlotRuleSchema = new mongoose_1.Schema({
    interviewerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Interviewer',
        required: true,
        unique: true,
        index: true
    },
    slotRules: {
        type: [DaySlotRuleSchema],
        required: true,
        validate: {
            validator: function (slotRules) {
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
            validator: function (dates) {
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
            validator: function (map) {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                for (const [date, slots] of map.entries()) {
                    if (!dateRegex.test(date))
                        return false;
                    if (!Array.isArray(slots))
                        return false;
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
SlotRuleSchema.index({ 'slotRules.enabled': 1 });
SlotRuleSchema.index({ blockedDates: 1 });
exports.SlotRuleModel = mongoose_1.default.model('SlotRule', SlotRuleSchema);
