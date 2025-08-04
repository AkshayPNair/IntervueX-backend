import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";

export class UnblockUserUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute(userId: string) {
    try {
      await this._userRepository.unblockUserById(userId);
    } catch (error) {
      let message = "Failed to unblock user";
      if (error instanceof Error) {
        message = error.message;
      }
      throw new AppError(ErrorCode.INTERNAL_ERROR, message, 500);
    }
  }
}