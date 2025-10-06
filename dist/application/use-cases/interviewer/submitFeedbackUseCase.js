"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitFeedbackUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class SubmitFeedbackUseCase {
    constructor(_feedbackRepository, _bookingRepository) {
        this._feedbackRepository = _feedbackRepository;
        this._bookingRepository = _bookingRepository;
    }
    async execute(interviewerId, userId, data) {
        const errors = [];
        const addError = (message) => {
            if (!errors.includes(message)) {
                errors.push(message);
            }
        };
        const bookingId = typeof data.bookingId === 'string'
            ? data.bookingId.trim()
            : data.bookingId ? String(data.bookingId).trim() : '';
        const overallRating = typeof data.overallRating === 'number'
            ? data.overallRating
            : Number(data.overallRating);
        const technicalRating = typeof data.technicalRating === 'number'
            ? data.technicalRating
            : Number(data.technicalRating);
        const communicationRating = typeof data.communicationRating === 'number'
            ? data.communicationRating
            : Number(data.communicationRating);
        const problemSolvingRating = typeof data.problemSolvingRating === 'number'
            ? data.problemSolvingRating
            : Number(data.problemSolvingRating);
        const ratingValidations = [
            { label: 'Overall Performance', value: overallRating },
            { label: 'Technical Skills', value: technicalRating },
            { label: 'Communication', value: communicationRating },
            { label: 'Problem Solving', value: problemSolvingRating },
        ];
        ratingValidations.forEach(({ label, value }) => {
            if (Number.isNaN(value) || value <= 0) {
                addError(`${label} rating is required`);
            }
        });
        const sanitizedTexts = {
            overallFeedback: '',
            strengths: '',
            improvements: ''
        };
        const textValidations = [
            { field: 'overallFeedback', value: data.overallFeedback, label: 'General Comments' },
            { field: 'strengths', value: data.strengths, label: 'Key Strengths' },
            { field: 'improvements', value: data.improvements, label: 'Areas for Improvement' },
        ];
        textValidations.forEach(({ field, value, label }) => {
            const stringValue = typeof value === 'string' ? value : value ? String(value) : '';
            const trimmed = stringValue.trim();
            if (!trimmed) {
                addError(`${label} is required`);
                return;
            }
            if (trimmed.length < 20) {
                addError(`${label} must be at least 20 characters`);
                return;
            }
            if (/^\d+$/.test(trimmed)) {
                addError(`${label} cannot contain only numbers`);
                return;
            }
            if (/^[^a-zA-Z]+$/.test(trimmed)) {
                addError(`${label} must include at least one letter`);
                return;
            }
            if (/[^a-zA-Z\s0-9]/.test(trimmed)) {
                addError(`${label} cannot contain special characters`);
                return;
            }
            sanitizedTexts[field] = trimmed;
        });
        if (!bookingId) {
            addError('Booking ID is required');
        }
        if (errors.length > 0) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, errors.join(', '), HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
        const dataPayload = {
            bookingId,
            overallRating,
            technicalRating,
            communicationRating,
            problemSolvingRating,
            overallFeedback: sanitizedTexts.overallFeedback,
            strengths: sanitizedTexts.strengths,
            improvements: sanitizedTexts.improvements,
        };
        try {
            const booking = await this._bookingRepository.getBookingById(dataPayload.bookingId);
            if (!booking) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, "Booking not found", HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
            }
            if (booking.interviewerId !== interviewerId) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.FORBIDDEN, "Only the assigned interviewer can submit feedback", HttpStatusCode_1.HttpStatusCode.FORBIDDEN);
            }
            const existing = await this._feedbackRepository.findByBookingId(dataPayload.bookingId);
            if (existing) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, "Feedback already submitted for this booking", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const feedback = await this._feedbackRepository.createFeedback(interviewerId, booking.userId, dataPayload);
            return {
                id: feedback.id,
                bookingId: feedback.bookingId,
                interviewerId: feedback.interviewerId,
                userId: feedback.userId,
                overallRating: feedback.overallRating,
                technicalRating: feedback.technicalRating,
                communicationRating: feedback.communicationRating,
                problemSolvingRating: feedback.problemSolvingRating,
                overallFeedback: feedback.overallFeedback,
                strengths: feedback.strengths,
                improvements: feedback.improvements,
                createdAt: feedback.createdAt,
            };
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Failed to submit feedback', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.SubmitFeedbackUseCase = SubmitFeedbackUseCase;
