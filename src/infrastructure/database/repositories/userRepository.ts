import { IUserDocument, UserModel } from '../models/UserModel';
import { User, UserDatabaseResult } from '../../../domain/entities/User';
import { toUserPersistence, toUserDomain } from '../../../application/mappers/userMapper';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { BaseRepository } from './baseRepository';

export class UserRepository extends BaseRepository<IUserDocument> implements IUserRepository {
  constructor() {
    super(UserModel);
  }
  async createUser(user: User): Promise<User> {
    const created = await UserModel.create(toUserPersistence(user));
    return toUserDomain(created);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const result = await this.model.findOne({ email });
    return result ? toUserDomain(result) : null;
  }

  async findUserById(userId: string): Promise<User | null> {
    const result = await this.findById(userId);
    return result ? toUserDomain(result) : null;
  }

  async deleteUserByEmail(email: string): Promise<void> {
    await this.model.deleteOne({ email, isVerified: false });
  }

  async verifyOtp(email: string, otp: string): Promise<User | null> {
    const result = await this.model.findOne({ email, otp, otpExpiry: { $gt: new Date() } });
    if (!result) return null;

    console.log("Finding user with:", email);
    console.log("OTP for verification:", otp);
    console.log("Current Time:", new Date());

    return toUserDomain(result);
  }

  async updateOtp(email: string, otp: string | null, otpExpiry: Date | null): Promise<void> {
    await this.model.updateOne(
      { email },
      { $set: { otp, otpExpiry } }
    );
  }

  async updateUserVerification(email: string): Promise<void> {
    await this.model.updateOne(
      { email },
      { $set: { isVerified: true, otp: null, otpExpiry: null } }
    );
  }

  async getAllUsers(): Promise<User[]> {
    const results = await this.model.find({ role: { $in: ['user', 'interviewer'] } })
    return results.map(toUserDomain)
  }

  async blockUserById(userId: string): Promise<void> {
    await this.model.updateOne({ _id: userId }, { $set: { isBlocked: true } });
  }

  async unblockUserById(userId: string): Promise<void> {
    await this.model.updateOne({ _id: userId }, { $set: { isBlocked: false } });
  }

  async updatePassword(email: string, newPassword: string): Promise<void> {
    await this.model.updateOne({ email }, { $set: { password: newPassword } })
  }

  async findPendingInterviewers(): Promise<User[]> {
    const results = await this.model.find({ 
      role: 'interviewer', 
      isVerified: true, 
      isApproved: false,
      isRejected:{$ne:true}
    });
    return results.map(toUserDomain);
  }

  async updateUser(userId: string, update: Partial<User>): Promise<void> {
    await this.model.updateOne({ _id: userId }, { $set: update });
  }

 
}


