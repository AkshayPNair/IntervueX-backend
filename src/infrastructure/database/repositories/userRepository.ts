import { IUserDocument, UserModel } from '../models/UserModel';
import { User, UserDatabaseResult } from '../../../domain/entities/User';
import { toUserPersistence, toUserDomain } from '../../../application/mappers/userMapper';
import { IUserRepository ,UserWithInterviewerProfile} from '../../../domain/interfaces/IUserRepository';
import { BaseRepository } from './baseRepository';
import { Types } from "mongoose";

function toUserDatabaseResult(doc:IUserDocument):UserDatabaseResult{
    return{
        ...doc.toObject(),
        _id: doc._id?.toString(),
    }
}

export class UserRepository extends BaseRepository<IUserDocument> implements IUserRepository {
  constructor() {
    super(UserModel);
  }
  
  async createUser(user: User): Promise<User> {
    const created = await UserModel.create(toUserPersistence(user));
    return toUserDomain(toUserDatabaseResult(created));
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const result = await this.model.findOne({ email });
    return result ? toUserDomain(toUserDatabaseResult(result)) : null;
  }

  async findUserById(userId: string): Promise<User | null> {
    const result = await this.findById(userId);
    return result ? toUserDomain(toUserDatabaseResult(result)) : null;
  }

  async findUserByGoogleId(googleId: string): Promise<User | null> {
    const result = await this.model.findOne({ googleId });
    return result ? toUserDomain(toUserDatabaseResult(result)) : null;
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

    return toUserDomain(toUserDatabaseResult(result));
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
    return results.map(toUserDatabaseResult).map(toUserDomain)
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
    return results.map(toUserDatabaseResult).map(toUserDomain);
  }

  async updateUser(userId: string, update: Partial<User>): Promise<void> {
    await this.model.updateOne({ _id: userId }, { $set: update });
  }

  async updateUserProfile(userId: string, profileData: { name?: string; profilePicture?: string; resume?: string; skills?: string[]; }): Promise<User | null> {
    const result=await this.model.findByIdAndUpdate(
      userId,
      {$set:profileData},
      {new:true}
    )
    return result?toUserDomain(toUserDatabaseResult(result)):null
  }

  async findApprovedInterviewersWithProfiles(): Promise<UserWithInterviewerProfile[]> {
    const results = await this.model.aggregate([
      {
        $match: {
          role: "interviewer",
          isVerified: true,
          isApproved: true,
          isBlocked: false
        }
      },
      {
        $lookup: {
          from: "interviewers",
          localField: "_id",
          foreignField: "userId",
          as: "interviewerProfile"
        }
      },
      {
        $unwind: {
          path: "$interviewerProfile",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          profilePicture: 1,
          skills: 1,
          "interviewerProfile.profilePic": 1,
          "interviewerProfile.jobTitle": 1,
          "interviewerProfile.yearsOfExperience": 1,
          "interviewerProfile.professionalBio": 1,
          "interviewerProfile.technicalSkills": 1,
          "interviewerProfile.hourlyRate":1,
        }
      }
    ]);
    return results;
  }

  async findApprovedInterviewerById(interviewerId: string): Promise<UserWithInterviewerProfile | null> {
    const results = await this.model.aggregate([
      {
        $match: {
          _id:  new Types.ObjectId(interviewerId),
          role: "interviewer",
          isVerified: true,
          isApproved: true,
          isBlocked: false
        }
      },
      {
        $lookup: {
          from: "interviewers",
          localField: "_id",
          foreignField: "userId",
          as: "interviewerProfile"
        }
      },
      {
        $unwind: {
          path: "$interviewerProfile",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          profilePicture: 1,
          skills: 1,
          "interviewerProfile.profilePic": 1,
          "interviewerProfile.jobTitle": 1,
          "interviewerProfile.yearsOfExperience": 1,
          "interviewerProfile.professionalBio": 1,
          "interviewerProfile.technicalSkills": 1,
          "interviewerProfile.hourlyRate":1,
        }
      }
    ]);
    return results.length > 0 ? results[0] : null;
  }
 
}


