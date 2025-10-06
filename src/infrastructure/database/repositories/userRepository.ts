import { IUserDocument, UserModel } from '../models/UserModel';
import { User } from '../../../domain/entities/User';
import { IUserRepository ,UserWithInterviewerProfile} from '../../../domain/interfaces/IUserRepository';
import { BaseRepository } from './baseRepository';
import { Types } from "mongoose";
import { logger } from '../../../utils/logger';

function mapDocToUser(doc: IUserDocument): User {
  return new User(
    doc.name,
    doc.email,
    doc.password ?? '',
    doc.otp ?? null,
    doc.otpExpiry ?? null,
    doc.isVerified,
    doc.isApproved,
    doc.role,
    (doc._id as Types.ObjectId)?.toString(),
    doc.isBlocked,
    doc.totalSessions ?? 0,
    doc.hasSubmittedVerification,
    doc.isRejected,
    doc.rejectedReason ?? undefined,
    doc.profilePicture ?? undefined,
    doc.resume ?? undefined,
    doc.skills ?? [],
    doc.createdAt,
    doc.updatedAt,
    doc.isGoogleUser,
    doc.googleId ?? undefined
  );
}

export class UserRepository extends BaseRepository<IUserDocument> implements IUserRepository {
  constructor() {
    super(UserModel);
  }
  
  async createUser(user: User): Promise<User> {
    const created = await UserModel.create({
      name: user.name,
      email: user.email,
      password: user.password,
      otp: user.otp,
      otpExpiry: user.otpExpiry,
      isVerified: user.isVerified,
      isApproved: user.isApproved,
      role: user.role,
      isBlocked: user.isBlocked,
      totalSessions: user.totalSessions,
      hasSubmittedVerification: user.hasSubmittedVerification,
      isRejected: user.isRejected,
      rejectedReason: user.rejectedReason,
      profilePicture: user.profilePicture,
      resume: user.resume,
      skills: user.skills,
      isGoogleUser: user.isGoogleUser,
      googleId: user.googleId,
      ...(user.id && { _id: user.id })
    });
    return mapDocToUser(created);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const result = await this.model.findOne({ email });
    return result ? mapDocToUser(result) : null;
  }

  async findUserById(userId: string): Promise<User | null> {
    const result = await this.findById(userId);
    return result ? mapDocToUser(result) : null;
  }

  async findUserByGoogleId(googleId: string): Promise<User | null> {
    const result = await this.model.findOne({ googleId });
    return result ? mapDocToUser(result) : null;
  }
  

  async deleteUserByEmail(email: string): Promise<void> {
    await this.model.deleteOne({ email, isVerified: false });
  }

  async verifyOtp(email: string, otp: string): Promise<User | null> {
    const result = await this.model.findOne({ email, otp, otpExpiry: { $gt: new Date() } });
    if (!result) return null;

    logger.debug?.("Finding user with:", email);
    logger.debug?.("OTP for verification:", otp);
    logger.debug?.("Current Time:", new Date());

    return mapDocToUser(result);
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

  async getAllUsers(searchQuery?: string, role?: string, status?: string, page?: number, pageSize?: number): Promise<{ users: User[], total: number }> {
    const query: any = { role: { $in: ['user', 'interviewer'] } };

    if (searchQuery && searchQuery.trim()) {
      const searchRegex = new RegExp(searchQuery.trim(), 'i');
      query.$or = [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } }
      ];
    }

    if (role && role !== 'All') {
      if (role === 'Candidate') {
        query.role = 'user';
      } else {
        query.role = role.toLowerCase();
      }
    }

    if (status && status !== 'All') {
      query.isBlocked = status === 'Blocked';
    }

    const skip = page && pageSize ? (page - 1) * pageSize : 0;
    const limit = pageSize || 0;

    const total = await this.model.countDocuments(query);
    const results = await this.model.find(query).skip(skip).limit(limit);
    return { users: results.map(mapDocToUser), total };
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

  async findPendingInterviewers(searchQuery?: string): Promise<User[]> {
    const query: any = {
      role: 'interviewer',
      isVerified: true,
      isApproved: false,
      isRejected: { $ne: true }
    };

    if (searchQuery && searchQuery.trim()) {
      const searchRegex = new RegExp(searchQuery.trim(), 'i');
      query.$or = [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } }
      ];
    }

    const results = await this.model.find(query);
    return results.map(mapDocToUser);
  }

  async updateUser(userId: string, update: Partial<User>): Promise<void> {
    await this.model.updateOne({ _id: userId }, { $set: update });
  }
  
  async deleteUserById(userId: string): Promise<void> {
    await this.model.findByIdAndDelete(userId).exec();
  }

  async updateUserProfile(userId: string, profileData: { name?: string; profilePicture?: string; resume?: string; skills?: string[]; }): Promise<User | null> {
    const result=await this.model.findByIdAndUpdate(
      userId,
      {$set:profileData},
      {new:true}
    )
    return result ? mapDocToUser(result) : null
  }

  async findApprovedInterviewersWithProfiles(searchQuery?: string): Promise<UserWithInterviewerProfile[]> {
    const pipeline: any[] = [
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
    ];

    if (searchQuery && searchQuery.trim()) {
      const searchRegex = new RegExp(searchQuery.trim(), 'i');
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: searchRegex } },
            { "interviewerProfile.jobTitle": { $regex: searchRegex } },
            { "interviewerProfile.professionalBio": { $regex: searchRegex } },
            { "interviewerProfile.technicalSkills": { $elemMatch: { $regex: searchRegex } } },
            { skills: { $elemMatch: { $regex: searchRegex } } }
          ]
        }
      });
    }

    const results = await this.model.aggregate(pipeline);
    return results
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

  async findAdmin(): Promise<User | null> {
    const admin = await this.model.findOne({ role: 'admin' }).exec();
    return admin ? mapDocToUser(admin) : null;
  }

}