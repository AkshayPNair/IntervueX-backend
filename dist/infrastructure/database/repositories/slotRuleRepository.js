"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotRuleRepository = void 0;
const mongoose_1 = require("mongoose");
const SlotRule_1 = require("../../../domain/entities/SlotRule");
const SlotRuleModel_1 = require("../models/SlotRuleModel");
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class SlotRuleRepository {
    async saveOrUpdateSlotRule(interviewerId, data) {
        try {
            const interviewerObjectId = new mongoose_1.Types.ObjectId(interviewerId);
            const updatedDoc = await SlotRuleModel_1.SlotRuleModel.findOneAndUpdate({ interviewerId: interviewerObjectId }, {
                interviewerId: interviewerObjectId,
                slotRules: data.slotRules,
                blockedDates: data.blockedDates,
                excludedSlotsByDate: data.excludedSlotsByDate || {},
                updatedAt: new Date()
            }, {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            });
            if (!updatedDoc) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Failed to save or update slot rule', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
            }
            return new SlotRule_1.SlotRule(updatedDoc._id.toString(), updatedDoc.interviewerId.toString(), updatedDoc.slotRules, updatedDoc.blockedDates, updatedDoc.excludedSlotsByDate instanceof Map
                ? Object.fromEntries(updatedDoc.excludedSlotsByDate)
                : updatedDoc.excludedSlotsByDate || {}, updatedDoc.createdAt, updatedDoc.updatedAt);
        }
        catch (error) {
            if (error.name === 'ValidationError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid slot rule data', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            if (error.name === 'CastError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid interviewer ID', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to save slot rule', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async getSlotRuleByInterviewer(interviewerId) {
        try {
            const interviewerObjectId = new mongoose_1.Types.ObjectId(interviewerId);
            const slotRuleDoc = await SlotRuleModel_1.SlotRuleModel.findOne({ interviewerId: interviewerObjectId });
            if (!slotRuleDoc) {
                return null;
            }
            return new SlotRule_1.SlotRule(slotRuleDoc._id.toString(), slotRuleDoc.interviewerId.toString(), slotRuleDoc.slotRules, slotRuleDoc.blockedDates, slotRuleDoc.excludedSlotsByDate instanceof Map
                ? Object.fromEntries(slotRuleDoc.excludedSlotsByDate)
                : slotRuleDoc.excludedSlotsByDate || {}, slotRuleDoc.createdAt, slotRuleDoc.updatedAt);
        }
        catch (error) {
            if (error.name === 'CastError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid interviewer ID', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to get slot rule', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async deleteSlotRule(interviewerId) {
        try {
            const interviewerObjectId = new mongoose_1.Types.ObjectId(interviewerId);
            const result = await SlotRuleModel_1.SlotRuleModel.deleteOne({ interviewerId: interviewerObjectId });
            if (result.deletedCount === 0) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, 'Slot rule not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
            }
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            if (error.name === 'CastError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid interviewer ID', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to delete slot rule', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.SlotRuleRepository = SlotRuleRepository;
