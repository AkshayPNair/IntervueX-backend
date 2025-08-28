import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import {AppError} from "../../error/AppError";
import { ErrorCode } from '../../error/ErrorCode'
import { IBlockUserService } from "../../../domain/interfaces/IBlockUserService";

export class BlockUserUseCase implements IBlockUserService{
    constructor(private _userRepository:IUserRepository){}

    async execute(userId: string) {
        try {
            await this._userRepository.blockUserById(userId);
        } catch (error) {
          let message = "Failed to block user";
          if (error instanceof Error) {
            message = error.message;
          }
          throw new AppError(ErrorCode.INTERNAL_ERROR, message, 500);
        }
      }
}