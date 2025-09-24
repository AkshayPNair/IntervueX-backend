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
        for (const daySlotRule of data.slotRules) {
            if (daySlotRule.enabled) {
                if (!this._isValidTimeFormat(daySlotRule.startTime) || !this._isValidTimeFormat(daySlotRule.endTime)) {
                    throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid time format. Use HH:MM format', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
                }
                if (!daySlotRule.startTime || !daySlotRule.endTime) {
                    throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, `Start time and end time are required for enabled days`, HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
                }
                if (daySlotRule.bufferTime < 0 || daySlotRule.bufferTime > 60) {
                    throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Buffer time must be between 0 and 60 minutes', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
                }
            }
        }
        if (data.blockedDates && Array.isArray(data.blockedDates)) {
            for (const date of data.blockedDates) {
                if (!this._isValidDateFormat(date)) {
                    throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid date format. Use YYYY-MM-DD format', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
                }
            }
        }
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
