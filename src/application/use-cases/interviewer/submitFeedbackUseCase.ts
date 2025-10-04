import { ISubmitFeedbackService } from "../../../domain/interfaces/ISubmitFeedbackService";
import { IFeedbackRepository } from "../../../domain/interfaces/IFeedbackRepository";
import { IBookingRepository } from "../../../domain/interfaces/IBookingRepository";
import { SubmitFeedbackDTO, FeedbackResponseDTO } from "../../../domain/dtos/feedback.dto";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";

export class SubmitFeedbackUseCase implements ISubmitFeedbackService {
    constructor(
        private _feedbackRepository: IFeedbackRepository,
        private _bookingRepository: IBookingRepository
    ) { }

    async execute(interviewerId: string, userId: string, data: SubmitFeedbackDTO): Promise<FeedbackResponseDTO> {
        const errors: string[] = [];
        const addError = (message: string) => {
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

        const ratingValidations: Array<{ label: string; value: number }> = [
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

        const sanitizedTexts: Record<'overallFeedback' | 'strengths' | 'improvements', string> = {
            overallFeedback: '',
            strengths: '',
            improvements: ''
        };

        const textValidations: Array<{ field: keyof typeof sanitizedTexts; value: unknown; label: string }> = [
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
            throw new AppError(
                ErrorCode.VALIDATION_ERROR,
                errors.join(', '),
                HttpStatusCode.BAD_REQUEST
            );
        }

        const dataPayload: SubmitFeedbackDTO = {
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
            const booking = await this._bookingRepository.getBookingById(dataPayload.bookingId)
            if (!booking) {
                throw new AppError(ErrorCode.NOT_FOUND, "Booking not found", HttpStatusCode.NOT_FOUND);
            }
            if (booking.interviewerId !== interviewerId) {
                throw new AppError(
                    ErrorCode.FORBIDDEN,
                    "Only the assigned interviewer can submit feedback",
                    HttpStatusCode.FORBIDDEN
                )
            }

            const existing = await this._feedbackRepository.findByBookingId(dataPayload.bookingId)
            if (existing) {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    "Feedback already submitted for this booking",
                    HttpStatusCode.BAD_REQUEST
                )
            }

            const feedback = await this._feedbackRepository.createFeedback(interviewerId, booking.userId, dataPayload)

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
            }
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to submit feedback', HttpStatusCode.INTERNAL_SERVER);
        }
    }
}