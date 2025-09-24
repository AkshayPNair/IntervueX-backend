"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateAvailableSlotsUseCase = void 0;
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class GenerateAvailableSlotsUseCase {
    constructor(_slotRuleRepository, _bookingRepository) {
        this._slotRuleRepository = _slotRuleRepository;
        this._bookingRepository = _bookingRepository;
    }
    async execute(data) {
        try {
            if (!this.isValidDateFormat(data.selectedDate)) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid date format. Please use YYYY-MM-DD format', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const selectedDate = new Date(data.selectedDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Cannot generate slots for past dates', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const slotRule = await this._slotRuleRepository.getSlotRuleByInterviewer(data.interviewerId);
            if (!slotRule) {
                const weekday = this.getWeekdayName(selectedDate.getDay());
                return {
                    date: data.selectedDate,
                    weekday,
                    slots: [],
                };
            }
            return await this.generateAvailableSlots(slotRule, data.selectedDate, data.interviewerId);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Failed to generate available slots', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async generateAvailableSlots(slotRule, selectedDate, interviewerId) {
        const date = new Date(selectedDate);
        const weekday = this.getWeekdayName(date.getDay());
        if (slotRule.blockedDates.includes(selectedDate)) {
            return {
                date: selectedDate,
                weekday,
                slots: [],
            };
        }
        const daySlotRule = slotRule.slotRules.find(rule => rule.day === weekday);
        if (!daySlotRule) {
            return {
                date: selectedDate,
                weekday,
                slots: [],
            };
        }
        if (daySlotRule.startTime === '00:00' && daySlotRule.endTime === '00:00') {
            return {
                date: selectedDate,
                weekday,
                slots: [],
            };
        }
        const slots = await this.generateTimeSlots(daySlotRule, selectedDate, interviewerId);
        const excluded = slotRule.excludedSlotsByDate?.[selectedDate] || [];
        const notExcluded = slots.filter(s => !excluded.some(ex => this.overlaps(s.startTime, s.endTime, ex.startTime, ex.endTime)));
        const availableSlots = notExcluded.filter(slot => !slot.isBooked);
        return {
            date: selectedDate,
            weekday,
            slots: availableSlots
        };
    }
    async generateTimeSlots(daySlotRule, selectedDate, interviewerId) {
        const slots = [];
        const startMinutes = this.timeToMinutes(daySlotRule.startTime);
        const endMinutes = this.timeToMinutes(daySlotRule.endTime);
        const slotDuration = 60;
        let currentMinutes = startMinutes;
        while (currentMinutes + slotDuration <= endMinutes) {
            const slotStartTime = this.minutesToTime(currentMinutes);
            const slotEndTime = this.minutesToTime(currentMinutes + slotDuration);
            const isSlotAvailable = await this._bookingRepository.checkSlotAvailability(interviewerId, selectedDate, slotStartTime, slotEndTime);
            slots.push({
                startTime: slotStartTime,
                endTime: slotEndTime,
                available: daySlotRule.enabled,
                isBooked: !isSlotAvailable
            });
            currentMinutes += slotDuration + daySlotRule.bufferTime;
        }
        return slots;
    }
    overlaps(aStart, aEnd, bStart, bEnd) {
        const aS = this.timeToMinutes(aStart);
        const aE = this.timeToMinutes(aEnd);
        const bS = this.timeToMinutes(bStart);
        const bE = this.timeToMinutes(bEnd);
        return aS < bE && bS < aE; // proper overlap check
    }
    isValidDateFormat(date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date))
            return false;
        const parsedDate = new Date(date);
        return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
    }
    getWeekdayName(dayIndex) {
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return weekdays[dayIndex];
    }
    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
}
exports.GenerateAvailableSlotsUseCase = GenerateAvailableSlotsUseCase;
