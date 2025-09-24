"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(name, email, password = '', otp = null, otpExpiry = null, isVerified = false, isApproved = false, role = "user", id, isBlocked = false, totalSessions = 0, hasSubmittedVerification = false, isRejected = false, rejectedReason, profilePicture, resume, skills = [], createdAt, updatedAt, isGoogleUser = false, googleId) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.otp = otp;
        this.otpExpiry = otpExpiry;
        this.isVerified = isVerified;
        this.isApproved = isApproved;
        this.role = role;
        this.id = id;
        this.isBlocked = isBlocked;
        this.totalSessions = totalSessions;
        this.hasSubmittedVerification = hasSubmittedVerification;
        this.isRejected = isRejected;
        this.rejectedReason = rejectedReason;
        this.profilePicture = profilePicture;
        this.resume = resume;
        this.skills = skills;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isGoogleUser = isGoogleUser;
        this.googleId = googleId;
    }
}
exports.User = User;
