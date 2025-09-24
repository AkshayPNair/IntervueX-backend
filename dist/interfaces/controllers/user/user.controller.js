"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const AppError_1 = require("../../../application/error/AppError");
const userMapper_1 = require("../../../application/mappers/userMapper");
const bookingMapper_1 = require("../../../application/mappers/bookingMapper");
const Booking_1 = require("../../../domain/entities/Booking");
const notificationPublisher_1 = require("../../../interfaces/socket/notificationPublisher");
class UserController {
    constructor(_getUserProfileService, _updateUserProfileService, _getAllInterviewersService, _getInterviewerByIdService, _generateAvailableSlotsService, _createBookingService, _getUserBookingsService, _createRazorpayOrderService, _cancelBookingService, _getWalletSummaryService, _listWalletTransactionsService, _completeBookingService, _listFeedbacksService, _getFeedbackByIdService, _getInterviewerProfileService, _submitInterviewerRatingService, _getInterviewerRatingByBookingIdService, _getUserPaymentHistoryService, _getUserDashboardService, _changePasswordService, _deleteAccountService, _notificationPublisher) {
        this._getUserProfileService = _getUserProfileService;
        this._updateUserProfileService = _updateUserProfileService;
        this._getAllInterviewersService = _getAllInterviewersService;
        this._getInterviewerByIdService = _getInterviewerByIdService;
        this._generateAvailableSlotsService = _generateAvailableSlotsService;
        this._createBookingService = _createBookingService;
        this._getUserBookingsService = _getUserBookingsService;
        this._createRazorpayOrderService = _createRazorpayOrderService;
        this._cancelBookingService = _cancelBookingService;
        this._getWalletSummaryService = _getWalletSummaryService;
        this._listWalletTransactionsService = _listWalletTransactionsService;
        this._completeBookingService = _completeBookingService;
        this._listFeedbacksService = _listFeedbacksService;
        this._getFeedbackByIdService = _getFeedbackByIdService;
        this._getInterviewerProfileService = _getInterviewerProfileService;
        this._submitInterviewerRatingService = _submitInterviewerRatingService;
        this._getInterviewerRatingByBookingIdService = _getInterviewerRatingByBookingIdService;
        this._getUserPaymentHistoryService = _getUserPaymentHistoryService;
        this._getUserDashboardService = _getUserDashboardService;
        this._changePasswordService = _changePasswordService;
        this._deleteAccountService = _deleteAccountService;
        this._notificationPublisher = _notificationPublisher;
    }
    async getProfile(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const result = await this._getUserProfileService.execute(userId);
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
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const body = req.body;
            if (!body.currentPassword || !body.newPassword) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, "currentPassword and newPassword are required", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const dto = {
                currentPassword: body.currentPassword,
                newPassword: body.newPassword,
            };
            await this._changePasswordService.execute(userId, dto);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json({ message: "Password changed successfully" });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status,
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
    async updateProfile(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const files = req.files;
            const rawUpdateData = {
                name: req.body.name,
                profilePicture: req.body.profilePic || req.body.profilePicture,
                resume: req.body.resume || req.body.resumeUrl,
                skills: Array.isArray(req.body.skills)
                    ? req.body.skills
                    : (req.body.skills ? JSON.parse(req.body.skills) : undefined),
            };
            const updateData = (0, userMapper_1.toUpdateUserProfileDTO)(rawUpdateData);
            const result = await this._updateUserProfileService.execute(userId, updateData);
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
    async getAllInterviewers(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const result = await this._getAllInterviewersService.execute();
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
    async getInterviewerById(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const { id } = req.params;
            if (!id) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.BAD_REQUEST, 'Interviewer ID is required', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const result = await this._getInterviewerByIdService.execute(id);
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
    async getAvailableSlots(req, res) {
        try {
            const { id: interviewerId } = req.params;
            const { selectedDate } = req.query;
            if (!interviewerId || !selectedDate) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, "InterviewerId and selectedDate are required", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const data = {
                interviewerId: interviewerId,
                selectedDate: selectedDate
            };
            const result = await this._generateAvailableSlotsService.execute(data);
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
    async createBooking(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'User not Authenticated', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const rawBookingData = req.body;
            if (!rawBookingData.interviewerId || !rawBookingData.date ||
                !rawBookingData.startTime || !rawBookingData.endTime ||
                !rawBookingData.amount || !rawBookingData.paymentMethod) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Missing required booking information', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const bookingData = (0, bookingMapper_1.toCreateBookingDTO)(rawBookingData);
            const result = await this._createBookingService.execute(userId, bookingData);
            const userProfile = await this._getUserProfileService.execute(userId);
            const interviewerProfile = await this._getInterviewerProfileService.execute(result.interviewerId);
            this._notificationPublisher.toInterviewer(result.interviewerId, notificationPublisher_1.NotifyEvents.SessionBooked, {
                bookingId: result.id,
                userId: result.userId,
                userName: userProfile.name,
                interviewerId: result.interviewerId,
                date: result.date,
                startTime: result.startTime,
                endTime: result.endTime,
                amount: result.amount,
                createdAt: result.createdAt,
            });
            if (result.paymentMethod === Booking_1.PaymentMethod.WALLET) {
                // User debit
                this._notificationPublisher.toUser(result.userId, notificationPublisher_1.NotifyEvents.WalletDebit, {
                    bookingId: result.id,
                    amount: result.amount,
                    interviewerId: result.interviewerId,
                    interviewerName: interviewerProfile.user.name,
                    timestamp: new Date().toISOString(),
                });
            }
            // Interviewer credit
            this._notificationPublisher.toInterviewer(result.interviewerId, notificationPublisher_1.NotifyEvents.WalletCredit, {
                bookingId: result.id,
                amount: result.amount,
                interviewerAmount: result.interviewerAmount,
                adminFee: result.adminFee,
                userId: result.userId,
                userName: userProfile.name,
                timestamp: new Date().toISOString(),
            });
            // Admin credit
            this._notificationPublisher.toAdmin(notificationPublisher_1.NotifyEvents.WalletCredit, {
                bookingId: result.id,
                role: 'admin',
                amount: result.amount,
                interviewerAmount: result.interviewerAmount,
                adminFee: result.adminFee,
                userId: result.userId,
                userName: userProfile.name,
                interviewerId: result.interviewerId,
                interviewerName: interviewerProfile.user.name,
                timestamp: new Date().toISOString(),
            });
            res.status(HttpStatusCode_1.HttpStatusCode.CREATED).json(result);
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
    async getUserBookings(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const result = await this._getUserBookingsService.execute(userId);
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
    async createRazorpayOrder(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const { amount, currency = 'INR' } = req.body;
            if (!amount) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, "Amount is required", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const orderData = {
                amount: Number(amount),
                currency,
                receipt: `receipt_${Date.now()}`,
            };
            const result = await this._createRazorpayOrderService.execute(orderData);
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
    async cancelBooking(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const { bookingId, reason } = req.body;
            if (!bookingId || !reason) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Booking ID and reason are required', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const cancelData = {
                bookingId,
                reason
            };
            await this._cancelBookingService.execute(userId, cancelData);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json({ message: 'Booking cancelled successfully' });
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
    async getWalletSummary(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const role = 'user';
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
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
    async getWalletTransactions(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const role = 'user';
            const data = await this._listWalletTransactionsService.execute(userId, role);
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
    async completeBooking(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const data = { bookingId: req.body.bookingId };
            if (!data.bookingId) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, "Booking ID is required", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            await this._completeBookingService.execute(userId, data);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json({ message: "Booking marked as completed" });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
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
    async listFeedbacks(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const data = await this._listFeedbacksService.execute(userId);
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
            const userId = req.user.id;
            const { id } = req.params;
            const data = await this._getFeedbackByIdService.execute(userId, id);
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
    async submitInterviewerRating(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const body = req.body;
            if (!body?.bookingId || !body?.rating) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'BookingId and rating are required', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const result = await this._submitInterviewerRatingService.execute(userId, body);
            const userProfile = await this._getUserProfileService.execute(userId);
            // Notify interviewer when user submits a rating
            this._notificationPublisher.toInterviewer(result.interviewerId, notificationPublisher_1.NotifyEvents.RatingSubmitted, {
                bookingId: result.bookingId,
                interviewerId: result.interviewerId,
                userId: result.userId,
                userName: userProfile.name,
                rating: result.rating,
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
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }
    async getInterviewerRatingByBookingId(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const { bookingId } = req.params;
            const result = await this._getInterviewerRatingByBookingIdService.execute(userId, bookingId);
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
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }
    async getPaymentHistory(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const result = await this._getUserPaymentHistoryService.execute(userId);
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
    async getDashboard(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const result = await this._getUserDashboardService.execute(req.user.id);
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
    async deleteAccount(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            await this._deleteAccountService.execute(userId);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json({ message: "Account deleted successfully" });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status,
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
}
exports.UserController = UserController;
