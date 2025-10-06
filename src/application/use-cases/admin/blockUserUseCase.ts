import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import {AppError} from "../../error/AppError";
import { ErrorCode } from '../../error/ErrorCode'
import { IBlockUserService } from "../../../domain/interfaces/IBlockUserService";
import { INotificationPublisher } from "../../../domain/interfaces/INotificationPublisher";
import { NotifyEvents } from "../../../interfaces/socket/notificationPublisher";

export class BlockUserUseCase implements IBlockUserService{
    constructor(
      private _userRepository:IUserRepository,
      private _notificationPublisher: INotificationPublisher
    ){}

    async execute(userId: string) {
        try {
            await this._userRepository.blockUserById(userId);
                        // Notify the user that they have been blocked
            this._notificationPublisher.toUser(userId, NotifyEvents.UserBlocked, {
                message: "Your account has been blocked by an administrator."
            });
        } catch (error) {
          let message = "Failed to block user";
          if (error instanceof Error) {
            message = error.message;
          }
          throw new AppError(ErrorCode.INTERNAL_ERROR, message, 500);
        }
      }
}