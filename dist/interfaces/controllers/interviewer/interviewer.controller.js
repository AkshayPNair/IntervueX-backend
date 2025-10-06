"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewerController = void 0;
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const interviewerMapper_1 = require("../../../application/mappers/interviewerMapper");
const notificationPublisher_1 = require("../../socket/notificationPublisher");
class InterviewerController {
    constructor(_submitVerificationService, _getVerificationStatusService, _getInterviewerProfileService, _updateInterviewerProfileService, _saveSlotRuleService, _getSlotRuleService, _getInterviewerBookingsService, _getWalletSummaryService, _listWalletTransactionsService, _submitFeedbackService, _listFeedbacksService, _getFeedbackByIdService, _getUserRatingByBookingIdService, _getInterviewerDashboardService, _changePasswordService, _deleteAccountService, _notificationPublisher) {
        this._submitVerificationService = _submitVerificationService;
        this._getVerificationStatusService = _getVerificationStatusService;
        this._getInterviewerProfileService = _getInterviewerProfileService;
        this._updateInterviewerProfileService = _updateInterviewerProfileService;
        this._saveSlotRuleService = _saveSlotRuleService;
        this._getSlotRuleService = _getSlotRuleService;
        this._getInterviewerBookingsService = _getInterviewerBookingsService;
        this._getWalletSummaryService = _getWalletSummaryService;
        this._listWalletTransactionsService = _listWalletTransactionsService;
        this._submitFeedbackService = _submitFeedbackService;
        this._listFeedbacksService = _listFeedbacksService;
        this._getFeedbackByIdService = _getFeedbackByIdService;
        this._getUserRatingByBookingIdService = _getUserRatingByBookingIdService;
        this._getInterviewerDashboardService = _getInterviewerDashboardService;
        this._changePasswordService = _changePasswordService;
        this._deleteAccountService = _deleteAccountService;
        this._notificationPublisher = _notificationPublisher;
    }
    async submitVerification(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const files = req.files;
            const interviewerData = {
                profilePic: files?.profilePic?.[0]?.location || req.body.profilePic,
                jobTitle: req.body.jobTitle,
                yearsOfExperience: parseInt(req.body.yearsOfExperience),
                professionalBio: req.body.professionalBio,
                technicalSkills: Array.isArray(req.body.technicalSkills)
                    ? req.body.technicalSkills
                    : JSON.parse(req.body.technicalSkills || '[]'),
                resume: files?.resume?.[0]?.location || req.body.resume,
            };
            const result = await this._submitVerificationService.execute(userId, interviewerData);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(result);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
    async getVerificationStatus(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const result = await this._getVerificationStatusService.execute(userId);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(result);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
    async getProfile(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const result = await this._getInterviewerProfileService.execute(userId);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(result);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
    async updateProfile(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const files = req.files;
            const rawUpdateData = {
                name: req.body.name,
                profilePic: files?.profilePic?.[0]?.location || req.body.profilePic,
                jobTitle: req.body.jobTitle,
                yearsOfExperience: req.body.yearsOfExperience ? parseInt(req.body.yearsOfExperience) : undefined,
                professionalBio: req.body.professionalBio,
                technicalSkills: Array.isArray(req.body.technicalSkills)
                    ? req.body.technicalSkills
                    : (req.body.technicalSkills ? JSON.parse(req.body.technicalSkills) : undefined),
                resume: files?.resume?.[0]?.location || req.body.resume,
                hourlyRate: req.body.hourlyRate ? parseFloat(req.body.hourlyRate) : undefined,
            };
            const updateData = (0, interviewerMapper_1.toUpdateInterviewerProfileDTO)(rawUpdateData);
            const result = await this._updateInterviewerProfileService.execute(userId, updateData);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(result);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
    async changePassword(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const body = req.body;
            if (!body.currentPassword || !body.newPassword) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'currentPassword and newPassword are required', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const dto = {
                currentPassword: body.currentPassword,
                newPassword: body.newPassword
            };
            await this._changePasswordService.execute(userId, dto);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json({ message: 'Password changed successfully' });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
    async saveSlotRule(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const slotRuleData = req.body;
            const result = await this._saveSlotRuleService.execute(userId, slotRuleData);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(result);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
    async getSlotRule(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const result = await this._getSlotRuleService.execute(userId);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(result);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
    async getBookings(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const search = req.query.search;
            const result = await this._getInterviewerBookingsService.execute(userId, search);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(result);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
    async getSummary(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const role = "interviewer";
            const data = await this._getWalletSummaryService.execute(userId, role);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(data);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }
    async getTransactions(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const role = "interviewer";
            const data = await this._listWalletTransactionsService.execute(userId, role);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(data);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }
    async submitFeedback(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const interviewerId = req.user.id;
            const payload = req.body;
            if (!payload?.bookingId) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'bookingId is required', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const result = await this._submitFeedbackService.execute(interviewerId, interviewerId, payload);
            const interviewerProfile = await this._getInterviewerProfileService.execute(interviewerId);
            this._notificationPublisher?.toUser(result.userId, notificationPublisher_1.NotifyEvents.FeedbackSubmitted, {
                bookingId: result.bookingId,
                interviewerId: result.interviewerId,
                interviewerName: interviewerProfile.user.name,
                userId: result.userId,
                createdAt: result.createdAt,
            });
            this._notificationPublisher?.toInterviewer(interviewerId, notificationPublisher_1.NotifyEvents.FeedbackSubmitted, {
                bookingId: result.bookingId,
                userId: result.userId,
                createdAt: result.createdAt,
            });
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(result);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : 'An unexpected error occurred',
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
    async listFeedbacks(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const interviewerId = req.user.id;
            const data = await this._listFeedbacksService.execute(interviewerId);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(data);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : 'An unexpected error occurred',
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
    async getFeedbackById(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const interviewerId = req.user.id;
            const { id } = req.params;
            const data = await this._getFeedbackByIdService.execute(interviewerId, id);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(data);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : 'An unexpected error occurred',
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
    async getUserRatingByBookingId(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const interviewerId = req.user.id;
            const { bookingId } = req.params;
            const data = await this._getUserRatingByBookingIdService.execute(interviewerId, bookingId);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(data);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : 'An unexpected error occurred',
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
    async getDashboard(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const interviewerId = req.user.id;
            const data = await this._getInterviewerDashboardService.execute(interviewerId);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(data);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
    async deleteAccount(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            await this._deleteAccountService.execute(userId);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json({ message: 'Account deleted successfully' });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : 'An unexpected error occurred',
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
}
exports.InterviewerController = InterviewerController;
