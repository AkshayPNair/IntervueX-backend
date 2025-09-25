import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { compare } from "bcryptjs";
import { signJwt } from "../../../infrastructure/external/services/jwtService";
import { LoginDTO } from "../../../domain/dtos/user.dto";
import { ILoginService } from "../../../domain/interfaces/ILoginService";
import {HttpStatusCode} from '../../../utils/HttpStatusCode'

export class LoginUseCase implements ILoginService{
    constructor(private _userRepository: IUserRepository) {}

    async execute(loginDto:LoginDTO) {
        const user = await this._userRepository.findUserByEmail(loginDto.email);
        if (!user || !user.isVerified ) {
          throw new AppError(ErrorCode.NOT_FOUND, 'User not registered', HttpStatusCode.UNAUTHORIZED);
        }

        if(user.isBlocked){
          throw new AppError(ErrorCode.UNAUTHORIZED, 'User is blocked by admin', HttpStatusCode.UNAUTHORIZED);
        }

        const isMatch = await compare(loginDto.password, user.password);
        if (!isMatch) {
          throw new AppError(ErrorCode.INVALID_CREDENTIALS, 'Invalid credentials', HttpStatusCode.UNAUTHORIZED);
        }
        // Generate JWT
        const token = signJwt({
          id: user.id,
          role: user.role,
          email: user.email,
        },user.role);
        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved,
            isBlocked:user.isBlocked,
          },
          token
        };
      }
}















