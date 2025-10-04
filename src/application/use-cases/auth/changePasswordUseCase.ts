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

        if (!dto.currentPassword || dto.currentPassword.trim().length === 0) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Current password is required',
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (!dto.newPassword || dto.newPassword.trim().length === 0) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'New password is required',
        HttpStatusCode.BAD_REQUEST
      );
    }

    const sanitizedNewPassword = dto.newPassword.trim();

    const passwordChecks = [
      { valid: sanitizedNewPassword.length >= 8, message: 'At least 8 characters' },
      { valid: /[A-Z]/.test(sanitizedNewPassword), message: 'One uppercase letter' },
      { valid: /[a-z]/.test(sanitizedNewPassword), message: 'One lowercase letter' },
      { valid: /\d/.test(sanitizedNewPassword), message: 'One number' },
      { valid: /[!@#$%^&*(),.?":{}|<>]/.test(sanitizedNewPassword), message: 'One special character' },
    ];

    const failedChecks = passwordChecks
      .filter((check) => !check.valid)
      .map((check) => check.message);

    if (failedChecks.length > 0) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        `New password doesn't meet requirements: ${failedChecks.join(', ')}`,
        HttpStatusCode.BAD_REQUEST
      );
    }

    
    const isMatch = await compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new AppError(
        ErrorCode.INVALID_CREDENTIALS,
        'Current password is incorrect',
        HttpStatusCode.UNAUTHORIZED
      );
    }

    
    const sameAsCurrent = await compare(sanitizedNewPassword, user.password);
    if (sameAsCurrent) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'New password must be different from current password',
        HttpStatusCode.BAD_REQUEST
      );
    }

    const newHashed = await hashPassword(sanitizedNewPassword);
    await this._userRepository.updateUser(user.id!, { password: newHashed });
  }
}