import { IDeleteAccountService } from '../../../domain/interfaces/IDeleteAccountService'
import { IUserRepository } from '../../../domain/interfaces/IUserRepository'
import { IInterviewerRepository } from '../../../domain/interfaces/IInterviewerRepository'
import { AppError } from '../../error/AppError'
import { ErrorCode } from '../../error/ErrorCode'
import { HttpStatusCode } from '../../../utils/HttpStatusCode'

export class DeleteAccountUseCase implements IDeleteAccountService {
  constructor(
    private _userRepository: IUserRepository,
    private _interviewerRepository: IInterviewerRepository
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this._userRepository.findUserById(userId)
    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, 'User not found', HttpStatusCode.NOT_FOUND)
    }

    // If interviewer, remove interviewer profile first
    if (user.role === 'interviewer') {
      await this._interviewerRepository.deleteByUserId(userId)
    }
    // Hard delete user
    await this._userRepository.deleteUserById(userId)
  }
}