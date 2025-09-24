"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const UserModel_1 = require("../models/UserModel");
const User_1 = require("../../../domain/entities/User");
const baseRepository_1 = require("./baseRepository");
const mongoose_1 = require("mongoose");
const logger_1 = require("../../../utils/logger");
function mapDocToUser(doc) {
    return new User_1.User(doc.name, doc.email, doc.password ?? '', doc.otp ?? null, doc.otpExpiry ?? null, doc.isVerified, doc.isApproved, doc.role, doc._id?.toString(), doc.isBlocked, doc.totalSessions ?? 0, doc.hasSubmittedVerification, doc.isRejected, doc.rejectedReason ?? undefined, doc.profilePicture ?? undefined, doc.resume ?? undefined, doc.skills ?? [], doc.createdAt, doc.updatedAt, doc.isGoogleUser, doc.googleId ?? undefined);
}
class UserRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(UserModel_1.UserModel);
    }
    async createUser(user) {
        const created = await UserModel_1.UserModel.create({
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
    async findUserByEmail(email) {
        const result = await this.model.findOne({ email });
        return result ? mapDocToUser(result) : null;
    }
    async findUserById(userId) {
        const result = await this.findById(userId);
        return result ? mapDocToUser(result) : null;
    }
    async findUserByGoogleId(googleId) {
        const result = await this.model.findOne({ googleId });
        return result ? mapDocToUser(result) : null;
    }
    async deleteUserByEmail(email) {
        await this.model.deleteOne({ email, isVerified: false });
    }
    async verifyOtp(email, otp) {
        const result = await this.model.findOne({ email, otp, otpExpiry: { $gt: new Date() } });
        if (!result)
            return null;
        logger_1.logger.debug?.("Finding user with:", email);
        logger_1.logger.debug?.("OTP for verification:", otp);
        logger_1.logger.debug?.("Current Time:", new Date());
        return mapDocToUser(result);
    }
    async updateOtp(email, otp, otpExpiry) {
        await this.model.updateOne({ email }, { $set: { otp, otpExpiry } });
    }
    async updateUserVerification(email) {
        await this.model.updateOne({ email }, { $set: { isVerified: true, otp: null, otpExpiry: null } });
    }
    async getAllUsers() {
        const results = await this.model.find({ role: { $in: ['user', 'interviewer'] } });
        return results.map(mapDocToUser);
    }
    async blockUserById(userId) {
        await this.model.updateOne({ _id: userId }, { $set: { isBlocked: true } });
    }
    async unblockUserById(userId) {
        await this.model.updateOne({ _id: userId }, { $set: { isBlocked: false } });
    }
    async updatePassword(email, newPassword) {
        await this.model.updateOne({ email }, { $set: { password: newPassword } });
    }
    async findPendingInterviewers() {
        const results = await this.model.find({
            role: 'interviewer',
            isVerified: true,
            isApproved: false,
            isRejected: { $ne: true }
        });
        return results.map(mapDocToUser);
    }
    async updateUser(userId, update) {
        await this.model.updateOne({ _id: userId }, { $set: update });
    }
    async deleteUserById(userId) {
        await this.model.findByIdAndDelete(userId).exec();
    }
    async updateUserProfile(userId, profileData) {
        const result = await this.model.findByIdAndUpdate(userId, { $set: profileData }, { new: true });
        return result ? mapDocToUser(result) : null;
    }
    async findApprovedInterviewersWithProfiles() {
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
                    "interviewerProfile.hourlyRate": 1,
                }
            }
        ]);
        return results;
    }
    async findApprovedInterviewerById(interviewerId) {
        const results = await this.model.aggregate([
            {
                $match: {
                    _id: new mongoose_1.Types.ObjectId(interviewerId),
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
                    "interviewerProfile.hourlyRate": 1,
                }
            }
        ]);
        return results.length > 0 ? results[0] : null;
    }
    async findAdmin() {
        const admin = await this.model.findOne({ role: 'admin' }).exec();
        return admin ? mapDocToUser(admin) : null;
    }
}
exports.UserRepository = UserRepository;
