import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { IUnblockUserService } from "../../../domain/interfaces/IUnblockUserService";
import { INotificationPublisher } from "../../../domain/interfaces/INotificationPublisher";
import { NotifyEvents } from "../../../interfaces/socket/notificationPublisher";

export class UnblockUserUseCase implements IUnblockUserService{
  constructor(
    private _userRepository: IUserRepository,
    private _notificationPublisher: INotificationPublisher
  ) {}

  async execute(userId: string) {
    try {
      await this._userRepository.unblockUserById(userId);
      // Notify the user that they have been unblocked
      this._notificationPublisher.toUser(userId, NotifyEvents.UserUnblocked, {
        message: "Your account has been unblocked by an administrator."
      });
    } catch (error) {
      let message = "Failed to unblock user";
      if (error instanceof Error) {
        message = error.message;
      }
      throw new AppError(ErrorCode.INTERNAL_ERROR, message, 500);
    }
  }
}