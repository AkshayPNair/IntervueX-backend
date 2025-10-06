import { Request, Response } from 'express';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';
import { ErrorCode } from '../../../application/error/ErrorCode';
import { AppError } from '../../../application/error/AppError';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { IGetUserProfileService } from '../../../domain/interfaces/IGetUserProfileService';
import { IGetAllInterviewersService } from '../../../domain/interfaces/IGetAllInterviewersService';
import { IGetInterviewerByIdService } from '../../../domain/interfaces/IGetInterviewerByIdService';
import { IGetInterviewerProfileService } from '../../../domain/interfaces/IGetInterviewerProfileService';
import { IUpdateUserProfileService } from '../../../domain/interfaces/IUpdateUserProfileService';
import { IGenerateAvailableSlotsService } from '../../../domain/interfaces/IGenerateAvailableSlotsService';
import { ICreateBookingService } from '../../../domain/interfaces/ICreateBookingService';
import { IGetUserBookingsService } from '../../../domain/interfaces/IGetUserBookingsService';
import { ICreateRazorpayOrderService } from '../../../domain/interfaces/ICreateRazorpayOrderService';
import { ICancelBookingService } from '../../../domain/interfaces/ICancelBookingService';
import { IGetWalletSummaryService } from '../../../domain/interfaces/IGetWalletSummaryService';
import { IListWalletTransactionsService } from '../../../domain/interfaces/IListWalletTransactionsService';
import { UpdateUserProfileDTO } from '../../../domain/dtos/user.dto';
import { GenerateAvailableSlotsDTO } from '../../../domain/dtos/slotRule.dto';
import { CreateBookingDTO, RazorpayOrderDTO, CancelBookingDTO, CompleteBookingDTO, VerifyPaymentDTO } from '../../../domain/dtos/booking.dto';
import { toUpdateUserProfileDTO } from '../../../application/mappers/userMapper';
import { toCreateBookingDTO } from '../../../application/mappers/bookingMapper';
import { ICompleteBookingService } from '../../../domain/interfaces/ICompleteBookingService';
import { IListUserFeedbacksService } from '../../../domain/interfaces/IListUserFeedbacksService';
import { IListInterviewerRatingsService } from '../../../domain/interfaces/IListInterviewerRatingsService';
import { IGetUserFeedbackByIdService } from '../../../domain/interfaces/IGetUserFeedbackByIdService';
import { ISubmitInterviewerRatingService } from '../../../domain/interfaces/ISubmitInterviewerRatingService';
import { IGetInterviewerRatingByBookingIdService } from '../../../domain/interfaces/IGetInterviewerRatingByBookingIdService';
import { SubmitInterviewerFeedbackDTO } from '../../../domain/dtos/feedback.dto';
import { IGetUserPaymentHistoryService } from '../../../domain/interfaces/IGetUserPaymentHistoryService';
import { IGetUserDashboardService } from '../../../domain/interfaces/IGetUserDashboardService';
import { IChangePasswordService } from '../../../domain/interfaces/IChangePasswordService';
import { ChangePasswordDTO } from '../../../domain/dtos/user.dto';
import { IDeleteAccountService } from '../../../domain/interfaces/IDeleteAccountService';
import { IVerifyPaymentService } from '../../../domain/interfaces/IVerifyPaymentService';
import { PaymentMethod,BookingStatus} from '../../../domain/entities/Booking';
import { INotificationPublisher } from '../../../domain/interfaces/INotificationPublisher';
import { NotifyEvents } from '../../../interfaces/socket/notificationPublisher';

export class UserController {
    constructor(
        private _getUserProfileService: IGetUserProfileService,
        private _updateUserProfileService: IUpdateUserProfileService,
        private _getAllInterviewersService: IGetAllInterviewersService,
        private _getInterviewerByIdService: IGetInterviewerByIdService,
        private _generateAvailableSlotsService: IGenerateAvailableSlotsService,
        private _createBookingService: ICreateBookingService,
        private _getUserBookingsService: IGetUserBookingsService,
        private _createRazorpayOrderService: ICreateRazorpayOrderService,
        private _cancelBookingService: ICancelBookingService,
        private _getWalletSummaryService: IGetWalletSummaryService,
        private _listWalletTransactionsService: IListWalletTransactionsService,
        private _completeBookingService: ICompleteBookingService,
        private _listFeedbacksService: IListUserFeedbacksService,
        private _getFeedbackByIdService: IGetUserFeedbackByIdService,
        private _getInterviewerProfileService: IGetInterviewerProfileService,
        private _listInterviewerRatingsService: IListInterviewerRatingsService,
        private _submitInterviewerRatingService: ISubmitInterviewerRatingService,
        private _getInterviewerRatingByBookingIdService: IGetInterviewerRatingByBookingIdService,
        private _getUserPaymentHistoryService: IGetUserPaymentHistoryService,
        private _getUserDashboardService: IGetUserDashboardService,
        private _changePasswordService: IChangePasswordService,
        private _deleteAccountService: IDeleteAccountService,
        private _verifyPaymentService: IVerifyPaymentService,
        private _notificationPublisher: INotificationPublisher
    ) { }

    async getProfile(req: AuthenticatedRequest, res: Response) {
        try {

            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const userId = req.user.id
            const result = await this._getUserProfileService.execute(userId)
            res.status(HttpStatusCode.OK).json(result)

        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

    async changePassword(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                );
            }

            const userId = req.user.id;
            const body = req.body as Partial<ChangePasswordDTO>;

            if (!body.currentPassword || !body.newPassword) {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    "currentPassword and newPassword are required",
                    HttpStatusCode.BAD_REQUEST
                );
            }

            const dto: ChangePasswordDTO = {
                currentPassword: body.currentPassword,
                newPassword: body.newPassword,
            };

            await this._changePasswordService.execute(userId, dto);
            res.status(HttpStatusCode.OK).json({ message: "Password changed successfully" });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status,
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }

    async updateProfile(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                );
            }

            const userId = req.user.id
            const files = req.files as { [fieldName: string]: Express.MulterS3.File[] }

            const rawUpdateData = {
                name: req.body.name,
                profilePicture: req.body.profilePic || req.body.profilePicture,
                resume: req.body.resume || req.body.resumeUrl,
                skills: Array.isArray(req.body.skills)
                    ? req.body.skills
                    : (req.body.skills ? JSON.parse(req.body.skills) : undefined),
            };

            const updateData: UpdateUserProfileDTO = toUpdateUserProfileDTO(rawUpdateData);

            const result = await this._updateUserProfileService.execute(userId, updateData);
            res.status(HttpStatusCode.OK).json(result);

        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

    async getAllInterviewers(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    'User not authenticated',
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const searchQuery = req.query.search as string;
            const result = await this._getAllInterviewersService.execute(searchQuery)
            res.status(HttpStatusCode.OK).json(result)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

    async getInterviewerById(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const { id } = req.params
            if (!id) {
                throw new AppError(
                    ErrorCode.BAD_REQUEST,
                    'Interviewer ID is required',
                    HttpStatusCode.BAD_REQUEST
                )
            }

            const result = await this._getInterviewerByIdService.execute(id)
            res.status(HttpStatusCode.OK).json(result)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }

        }
    }

    async listInterviewerRatings(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const { id } = req.params
            if (!id) {
                throw new AppError(
                    ErrorCode.BAD_REQUEST,
                    'Interviewer ID is required',
                    HttpStatusCode.BAD_REQUEST
                )
            }

            const ratings = await this._listInterviewerRatingsService.execute(id)
            res.status(HttpStatusCode.OK).json(ratings)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

    async getAvailableSlots(req: Request, res: Response) {
        try {
            const { id: interviewerId } = req.params
            const { selectedDate } = req.query

            if (!interviewerId || !selectedDate) {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    "InterviewerId and selectedDate are required",
                    HttpStatusCode.BAD_REQUEST
                )
            }

            const data: GenerateAvailableSlotsDTO = {
                interviewerId: interviewerId as string,
                selectedDate: selectedDate as string
            }

            const result = await this._generateAvailableSlotsService.execute(data);
            res.status(HttpStatusCode.OK).json(result)

        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

    async createBooking(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    'User not Authenticated',
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const userId = req.user.id
            const rawBookingData = req.body

            if (!rawBookingData.interviewerId || !rawBookingData.date ||
                !rawBookingData.startTime || !rawBookingData.endTime ||
                !rawBookingData.amount || !rawBookingData.paymentMethod) {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Missing required booking information',
                    HttpStatusCode.BAD_REQUEST
                )
            }

            const bookingData: CreateBookingDTO = toCreateBookingDTO(rawBookingData)
            const result = await this._createBookingService.execute(userId, bookingData)

            const userProfile = await this._getUserProfileService.execute(userId)
            const interviewerProfile = await this._getInterviewerProfileService.execute(result.interviewerId)

            if (result.status === BookingStatus.CONFIRMED) {
                const userProfile = await this._getUserProfileService.execute(userId)
                const interviewerProfile = await this._getInterviewerProfileService.execute(result.interviewerId)

                this._notificationPublisher.toInterviewer(result.interviewerId, NotifyEvents.SessionBooked, {
                    bookingId: result.id,
                    userId: result.userId,
                    userName: userProfile.name,
                    interviewerId: result.interviewerId,
                    date: result.date,
                    startTime: result.startTime,
                    endTime: result.endTime,
                    amount: result.amount,
                    createdAt: result.createdAt,
                })
            }

            if (result.paymentMethod === PaymentMethod.WALLET) {
                // User debit
                this._notificationPublisher.toUser(result.userId, NotifyEvents.WalletDebit, {
                    bookingId: result.id,
                    amount: result.amount,
                    interviewerId: result.interviewerId,
                    interviewerName: interviewerProfile.user.name,
                    timestamp: new Date().toISOString(),
                })
            }
            // Interviewer credit
            this._notificationPublisher.toInterviewer(result.interviewerId, NotifyEvents.WalletCredit, {
                bookingId: result.id,
                amount: result.amount,
                interviewerAmount: result.interviewerAmount,
                adminFee: result.adminFee,
                userId: result.userId,
                userName: userProfile.name,
                timestamp: new Date().toISOString(),
            })
            // Admin credit
            this._notificationPublisher.toAdmin(NotifyEvents.WalletCredit, {
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
            })

            res.status(HttpStatusCode.CREATED).json(result)


        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

    async getUserBookings(req: AuthenticatedRequest, res: Response) {
        try {

            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                );
            }

            const userId = req.user.id;
            const result = await this._getUserBookingsService.execute(userId);

            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

    async createRazorpayOrder(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                );
            }

            const { amount, currency = 'INR' } = req.body;

            if (!amount) {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    "Amount is required",
                    HttpStatusCode.BAD_REQUEST
                );
            }

            const orderData: RazorpayOrderDTO = {
                amount: Number(amount),
                currency,
                receipt: `receipt_${Date.now()}`,
            };

            const result = await this._createRazorpayOrderService.execute(orderData);

            res.status(HttpStatusCode.OK).json(result);

        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

    async cancelBooking(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    'User not authenticated',
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const userId = req.user.id
            const { bookingId, reason } = req.body

            if (!bookingId || !reason) {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Booking ID and reason are required',
                    HttpStatusCode.BAD_REQUEST
                )
            }

            const cancelData: CancelBookingDTO = {
                bookingId,
                reason
            }

            await this._cancelBookingService.execute(userId, cancelData)

            res.status(HttpStatusCode.OK).json({ message: 'Booking cancelled successfully' })
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }

        }
    }

    async getWalletSummary(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    'User not authenticated',
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const userId = req.user.id
            const role = 'user'
            const data = await this._getWalletSummaryService.execute(userId, role)
            res.status(HttpStatusCode.OK).json(data)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

    async getWalletTransactions(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    'User not authenticated',
                    HttpStatusCode.UNAUTHORIZED
                )
            }
            const userId = req.user.id
            const role = 'user'
            const data = await this._listWalletTransactionsService.execute(userId, role)
            res.status(HttpStatusCode.OK).json(data)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

    async completeBooking(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const data: CompleteBookingDTO = { bookingId: req.body.bookingId };

            if (!data.bookingId) {
                throw new AppError(ErrorCode.VALIDATION_ERROR, "Booking ID is required", HttpStatusCode.BAD_REQUEST);
            }

            await this._completeBookingService.execute(userId, data)
            res.status(HttpStatusCode.OK).json({ message: "Booking marked as completed" })
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

    async listFeedbacks(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    'User not authenticated',
                    HttpStatusCode.UNAUTHORIZED
                )
            }
            const userId = req.user.id
            const data = await this._listFeedbacksService.execute(userId)
            res.status(HttpStatusCode.OK).json(data)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : 'An unexpected error occurred',
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                })
            }
        }
    }

    async getFeedbackById(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    'User not authenticated',
                    HttpStatusCode.UNAUTHORIZED
                )
            }
            const userId = req.user.id
            const { id } = req.params as { id: string }
            const data = await this._getFeedbackByIdService.execute(userId, id)
            res.status(HttpStatusCode.OK).json(data)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : 'An unexpected error occurred',
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                })
            }
        }
    }

    async submitInterviewerRating(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    'User not authenticated',
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const userId = req.user.id;
            const body = req.body as SubmitInterviewerFeedbackDTO

            if (!body?.bookingId || !body?.rating) {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'BookingId and rating are required',
                    HttpStatusCode.BAD_REQUEST
                );
            }
            const result = await this._submitInterviewerRatingService.execute(userId, body);
           
            const userProfile = await this._getUserProfileService.execute(userId)
            // Notify interviewer when user submits a rating
            this._notificationPublisher.toInterviewer(result.interviewerId, NotifyEvents.RatingSubmitted, {
                bookingId: result.bookingId,
                interviewerId: result.interviewerId,
                userId: result.userId,
                userName: userProfile.name,
                rating: result.rating,
                createdAt: result.createdAt,
            })

            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : 'An unexpected error occurred',
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }

    async getInterviewerRatingByBookingId(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    'User not authenticated',
                    HttpStatusCode.UNAUTHORIZED
                )
            }
            const userId = req.user.id
            const { bookingId } = req.params as { bookingId: string }
            const result = await this._getInterviewerRatingByBookingIdService.execute(userId, bookingId)
            res.status(HttpStatusCode.OK).json(result)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : 'An unexpected error occurred',
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }

    async getPaymentHistory(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                );
            }
            const userId = req.user.id
            const result = await this._getUserPaymentHistoryService.execute(userId)
            res.status(HttpStatusCode.OK).json(result)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }

    }

    async getDashboard(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                );
            }
            const result = await this._getUserDashboardService.execute(req.user.id)
            res.status(HttpStatusCode.OK).json(result)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

    async deleteAccount(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                );
            }
            const userId = req.user.id;
            await this._deleteAccountService.execute(userId);
            res.status(HttpStatusCode.OK).json({ message: "Account deleted successfully" });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status,
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }

     async verifyPayment(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                );
            }

            const userId = req.user.id;
            const body = req.body as VerifyPaymentDTO;

            if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature || !body.bookingId) {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    "razorpay_order_id, razorpay_payment_id, razorpay_signature, and bookingId are required",
                    HttpStatusCode.BAD_REQUEST
                );
            }

            await this._verifyPaymentService.execute(body, userId);

            res.status(HttpStatusCode.OK).json({ message: "Payment verified successfully" });

        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

}