import { Request, Response } from 'express';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';
import { ErrorCode } from '../../../application/error/ErrorCode';
import { AppError } from '../../../application/error/AppError';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { IGetUserProfileService } from '../../../domain/interfaces/IGetUserProfileService';
import { IGetAllInterviewersService } from '../../../domain/interfaces/IGetAllInterviewersService';
import { IGetInterviewerByIdService } from '../../../domain/interfaces/IGetInterviewerByIdService';
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
import { CreateBookingDTO, RazorpayOrderDTO, CancelBookingDTO, CompleteBookingDTO } from '../../../domain/dtos/booking.dto';
import { toUpdateUserProfileDTO } from '../../../application/mappers/userMapper';
import { toCreateBookingDTO } from '../../../application/mappers/bookingMapper';
import { ICompleteBookingService } from '../../../domain/interfaces/ICompleteBookingService';



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
        private _getWalletSummaryService:IGetWalletSummaryService,
        private _listWalletTransactionsService:IListWalletTransactionsService,
        private _completeBookingService:ICompleteBookingService
    ) { }

    async getProfile(req: AuthenticatedRequest, res: Response){
        try {
           
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }
            
            const userId=req.user.id
            const result=await this._getUserProfileService.execute(userId)
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

    async updateProfile(req:AuthenticatedRequest,res:Response){
        try {
            if(!req.user){
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                );
            }

            const userId=req.user.id
            const files=req.files as {[fieldName:string]:Express.MulterS3.File[]}

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

    async getAllInterviewers(req:AuthenticatedRequest,res:Response){
        try {
            if(!req.user){
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    'User not authenticated',
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const result=await this._getAllInterviewersService.execute()
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

    async getInterviewerById(req:AuthenticatedRequest,res:Response){
        try {
            if(!req.user){
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const {id}=req.params
            if(!id){
                throw new AppError(
                    ErrorCode.BAD_REQUEST,
                    'Interviewer ID is required',
                    HttpStatusCode.BAD_REQUEST
                )
            }

            const result=await this._getInterviewerByIdService.execute(id)
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

    async getAvailableSlots(req:Request,res:Response){
        try {
            const {id: interviewerId} = req.params
            const {selectedDate}= req.query

            if(!interviewerId || !selectedDate){
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    "InterviewerId and selectedDate are required",
                    HttpStatusCode.BAD_REQUEST
                )
            }

            const data:GenerateAvailableSlotsDTO={
                interviewerId:interviewerId as string,
                selectedDate:selectedDate as string
            }

            const result=await this._generateAvailableSlotsService.execute(data);
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

    async createBooking(req:AuthenticatedRequest,res:Response){
        try {
            if(!req.user){
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    'User not Authenticated',
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const userId=req.user.id
            const rawBookingData=req.body

            if(!rawBookingData.interviewerId || !rawBookingData.date ||
                !rawBookingData.startTime || !rawBookingData.endTime ||
                !rawBookingData.amount || !rawBookingData.paymentMethod){
                    throw new AppError(
                        ErrorCode.VALIDATION_ERROR,
                        'Missing required booking information',
                        HttpStatusCode.BAD_REQUEST
                    )
            }

            const bookingData: CreateBookingDTO = toCreateBookingDTO(rawBookingData)
            const result = await this._createBookingService.execute(userId,bookingData)

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

    async getUserBookings(req:AuthenticatedRequest,res:Response){
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

    async createRazorpayOrder(req:AuthenticatedRequest,res:Response){
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

    async cancelBooking(req:AuthenticatedRequest,res:Response){
        try {
            if(!req.user){
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    'User not authenticated',
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const userId=req.user.id
            const {bookingId,reason}=req.body

            if(!bookingId||!reason){
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Booking ID and reason are required',
                    HttpStatusCode.BAD_REQUEST
                )
            }

            const cancelData:CancelBookingDTO={
                bookingId,
                reason
            }

            await this._cancelBookingService.execute(userId,cancelData)

            res.status(HttpStatusCode.OK).json({message : 'Booking cancelled successfully'})
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

    async getWalletSummary(req:AuthenticatedRequest,res:Response){
        try {
            if(!req.user){
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    'User not authenticated',
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const userId=req.user.id
            const role='user'
            const data=await this._getWalletSummaryService.execute(userId,role)
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

    async getWalletTransactions(req:AuthenticatedRequest,res:Response){
        try {
            if(!req.user){
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    'User not authenticated',
                    HttpStatusCode.UNAUTHORIZED
                )
            }
            const userId=req.user.id
            const role='user'
            const data=await this._listWalletTransactionsService.execute(userId,role)
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

    async completeBooking(req:AuthenticatedRequest,res:Response){
        try {
            if (!req.user) {
                throw new AppError(ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode.UNAUTHORIZED);
              }
              const userId = req.user.id;
              const data: CompleteBookingDTO = { bookingId: req.body.bookingId };
          
              if (!data.bookingId) {
                throw new AppError(ErrorCode.VALIDATION_ERROR, "Booking ID is required", HttpStatusCode.BAD_REQUEST);
              }

              await this._completeBookingService.execute(userId,data)
              res.status(HttpStatusCode.OK).json({message:"Booking marked as completed"})
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

}