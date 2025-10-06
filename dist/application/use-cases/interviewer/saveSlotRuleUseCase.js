"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveSlotRuleUseCase = void 0;
const slotRuleMapper_1 = require("../../mappers/slotRuleMapper");
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class SaveSlotRuleUseCase {
    constructor(_slotRuleRepository) {
        this._slotRuleRepository = _slotRuleRepository;
    }
    async execute(interviewerId, data) {
        this._validateSlotRuleData(data);
        try {
            const slotRule = await this._slotRuleRepository.saveOrUpdateSlotRule(interviewerId, data);
            return (0, slotRuleMapper_1.toSlotRuleResponseDTO)(slotRule);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Failed to save slot rule', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    _validateSlotRuleData(data) {
        const errors = [];
        const slotRules = Array.isArray(data.slotRules) ? data.slotRules : [];
        if (!slotRules.length) {
            errors.push('Slot rules are required');
        }
        const activeDays = slotRules.filter((rule) => rule.enabled && !!rule.startTime && !!rule.endTime);
        if (activeDays.length === 0) {
            errors.push('No active days configured');
        }
        for (const daySlotRule of slotRules) {
            if (!daySlotRule.enabled) {
                continue;
            }
            if (!daySlotRule.startTime || !daySlotRule.endTime) {
                errors.push(`Start time and end time are required for ${daySlotRule.day}`);
                continue;
            }
            if (!this._isValidTimeFormat(daySlotRule.startTime) || !this._isValidTimeFormat(daySlotRule.endTime)) {
                errors.push(`Invalid time format for ${daySlotRule.day}. Use HH:MM format`);
                continue;
            }
            if (!this._isValidTimeRange(daySlotRule.startTime, daySlotRule.endTime)) {
                errors.push(`Invalid time range for ${daySlotRule.day}. Start time must be before end time`);
            }
            if (typeof daySlotRule.bufferTime !== 'number' || Number.isNaN(daySlotRule.bufferTime)) {
                errors.push(`Invalid buffer time for ${daySlotRule.day}. Buffer time must be between 0 and 60 minutes`);
            }
            else if (daySlotRule.bufferTime < 0 || daySlotRule.bufferTime > 60) {
                errors.push(`Invalid buffer time for ${daySlotRule.day}. Buffer time must be between 0 and 60 minutes`);
            }
        }
        const today = this._startOfToday();
        if (Array.isArray(data.blockedDates)) {
            const seenDates = new Set();
            for (const date of data.blockedDates) {
                if (!date) {
                    errors.push('Please select a date');
                    continue;
                }
                if (!this._isValidDateFormat(date)) {
                    errors.push('Invalid blocked date format. Use YYYY-MM-DD format');
                    continue;
                }
                if (seenDates.has(date)) {
                    errors.push('This date is already blocked');
                    continue;
                }
                seenDates.add(date);
                const selectedDate = this._parseDate(date);
                if (!selectedDate) {
                    errors.push('Invalid blocked date format. Use YYYY-MM-DD format');
                    continue;
                }
                if (selectedDate < today) {
                    errors.push('Cannot block past dates');
                }
                else if (selectedDate.getTime() === today.getTime()) {
                    errors.push('Cannot block the current day. Exclude specific slots instead.');
                }
            }
        }
        if (data.excludedSlotsByDate && typeof data.excludedSlotsByDate === 'object') {
            for (const [date, slots] of Object.entries(data.excludedSlotsByDate)) {
                if (!this._isValidDateFormat(date)) {
                    errors.push(`Invalid date ${date} in exclusions`);
                    continue;
                }
                const selectedDate = this._parseDate(date);
                if (!selectedDate) {
                    errors.push(`Invalid date ${date} in exclusions`);
                    continue;
                }
                if (!Array.isArray(slots) || slots.length === 0) {
                    errors.push(`Excluded slots for ${date} must include at least one time range`);
                    continue;
                }
                if (selectedDate < today) {
                    errors.push('Cannot exclude slots on past dates');
                    continue;
                }
                const isSameDay = selectedDate.getTime() === today.getTime();
                for (const slot of slots) {
                    if (!slot.startTime || !slot.endTime) {
                        errors.push(`Excluded slot on ${date} must include start and end time`);
                        continue;
                    }
                    if (!this._isValidTimeRange(slot.startTime, slot.endTime)) {
                        errors.push(`Invalid time range ${slot.startTime}-${slot.endTime} on ${date}`);
                        continue;
                    }
                    if (isSameDay) {
                        const now = new Date();
                        const startDateTime = this._combineDateTime(selectedDate, slot.startTime);
                        const endDateTime = this._combineDateTime(selectedDate, slot.endTime);
                        if (endDateTime <= now) {
                            errors.push('Cannot exclude slots that end in the past');
                        }
                        if (startDateTime < now) {
                            errors.push('Cannot exclude slots that start in the past');
                        }
                    }
                }
            }
        }
        if (errors.length > 0) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, Array.from(new Set(errors)).join(', '), HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
    }
    _isValidTimeRange(startTime, endTime) {
        if (!this._isValidTimeFormat(startTime) || !this._isValidTimeFormat(endTime)) {
            return false;
        }
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        return startMinutes < endMinutes;
    }
    _startOfToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }
    _parseDate(date) {
        if (!this._isValidDateFormat(date)) {
            return null;
        }
        const parsed = new Date(`${date}T00:00:00`);
        if (Number.isNaN(parsed.getTime())) {
            return null;
        }
        parsed.setHours(0, 0, 0, 0);
        return parsed;
    }
    _combineDateTime(date, time) {
        const [hour, minute] = time.split(':').map(Number);
        const combined = new Date(date);
        combined.setHours(hour, minute, 0, 0);
        return combined;
    }
    _isValidTimeFormat(time) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }
    _isValidDateFormat(date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date))
            return false;
        // Check if it's a valid date
        const parsedDate = new Date(date);
        return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
    }
}
exports.SaveSlotRuleUseCase = SaveSlotRuleUseCase;
