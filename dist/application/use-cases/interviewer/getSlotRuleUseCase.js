"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSlotRuleUseCase = void 0;
const slotRuleMapper_1 = require("../../mappers/slotRuleMapper");
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class GetSlotRuleUseCase {
    constructor(_slotRuleRepository) {
        this._slotRuleRepository = _slotRuleRepository;
    }
    async execute(interviewerId) {
        try {
            const slotRule = await this._slotRuleRepository.getSlotRuleByInterviewer(interviewerId);
            if (!slotRule) {
                return (0, slotRuleMapper_1.getDefaultSlotRuleResponseDTO)(interviewerId);
            }
            return (0, slotRuleMapper_1.toSlotRuleResponseDTO)(slotRule);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Failed to get slot rule', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.GetSlotRuleUseCase = GetSlotRuleUseCase;
