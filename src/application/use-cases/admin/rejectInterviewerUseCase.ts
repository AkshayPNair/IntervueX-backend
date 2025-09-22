import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { IEmailService } from "../../../domain/interfaces/IEmailService";
import { IRejectInterviewerService } from "../../../domain/interfaces/IRejectInterviewerService";
import { logger } from '../../../utils/logger';

export class RejectInterviewerUseCase implements IRejectInterviewerService {
  constructor(
    private _userRepository: IUserRepository,
    private _emailService: IEmailService
  ) { }

  async execute(interviewerId: string, rejectedReason?: string) {
    try {
      const user = await this._userRepository.findUserById(interviewerId);

      if (!user) {
        throw new AppError(ErrorCode.USER_NOT_FOUND, "Interviewer not found", HttpStatusCode.NOT_FOUND);
      }

      if (user.role !== "interviewer") {
        throw new AppError(ErrorCode.VALIDATION_ERROR, "User is not an interviewer", HttpStatusCode.BAD_REQUEST);
      }

      if (user.isApproved) {
        throw new AppError(ErrorCode.UNAUTHORIZED, "Cannot reject an already approved interviewer", HttpStatusCode.BAD_REQUEST);
      }

      const finalRejectionReason = rejectedReason || "Application did not meet requirements"

      await this._userRepository.updateUser(interviewerId, {
        isApproved: false,
        isRejected: true,
        rejectedReason: finalRejectionReason

      });

      try {
        await this._emailService.sendRejectionEmail(user.email, user.name, finalRejectionReason);
      } catch (emailError) {
        logger.error('Failed to send rejection email', { error: emailError });
      }

    } catch (error) {
      throw error
    }
  }
}