import { IChangePasswordService } from '../../../domain/interfaces/IChangePasswordService';
import { ChangePasswordDTO } from '../../../domain/dtos/user.dto';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { AppError } from '../../error/AppError';
import { ErrorCode } from '../../error/ErrorCode';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';
import { compare } from 'bcryptjs';
import { hashPassword } from '../../../utils/hashPassword';

export class ChangePasswordUseCase implements IChangePasswordService {
  constructor(private _userRepository: IUserRepository) {}

  async execute(userId: string, dto: ChangePasswordDTO): Promise<void> {
    const user = await this._userRepository.findUserById(userId);

    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, 'User not found', HttpStatusCode.NOT_FOUND);
    }

    
    const isMatch = await compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new AppError(
        ErrorCode.INVALID_CREDENTIALS,
        'Current password is incorrect',
        HttpStatusCode.UNAUTHORIZED
      );
    }

    
    const sameAsCurrent = await compare(dto.newPassword, user.password);
    if (sameAsCurrent) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'New password must be different from current password',
        HttpStatusCode.BAD_REQUEST
      );
    }

    const newHashed = await hashPassword(dto.newPassword);
    await this._userRepository.updateUser(user.id!, { password: newHashed });
  }
}