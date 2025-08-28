import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { IEmailService } from "../../../domain/interfaces/IEmailService";
import { IApproveInterviewerService } from "../../../domain/interfaces/IApproveInterviewerService";

export class ApproveInterviewerUseCase implements IApproveInterviewerService{
    constructor(
      private _userRepository: IUserRepository,
      private _emailService:IEmailService
    ) { }

    async execute(interviewerId:string){
        try {
            const user=await this._userRepository.findUserById(interviewerId)

            if (!user) {
        throw new AppError(ErrorCode.USER_NOT_FOUND,"Interviewer not found", HttpStatusCode.NOT_FOUND);
      }

      if (user.role !== "interviewer") {
        throw new AppError(ErrorCode.VALIDATION_ERROR,"User is not an interviewer", HttpStatusCode.BAD_REQUEST);
      }

      if (user.isApproved) {
        throw new AppError(ErrorCode.UNAUTHORIZED,"Interviewer is already approved", HttpStatusCode.BAD_REQUEST);
      }

      await this._userRepository.updateUser(interviewerId, { isApproved: true ,isRejected:false,rejectedReason:undefined});

      try {
        await this._emailService.sendApprovalEmail(user.email, user.name);
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

        } catch (error) {
            throw error
        }
    }
}