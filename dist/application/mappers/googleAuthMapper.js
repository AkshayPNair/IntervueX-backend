"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toGoogleUserCreationDTO = exports.toGoogleAuthResponse = exports.toGoogleUserDomain = void 0;
const User_1 = require("../../domain/entities/User");
const toGoogleUserDomain = (dto) => {
    return new User_1.User(dto.name, dto.email, '', null, null, dto.isVerified, false, dto.role, undefined, false, 0, false, false, undefined, dto.profilePicture, undefined, [], undefined, undefined, dto.isGoogleUser, dto.googleId);
};
exports.toGoogleUserDomain = toGoogleUserDomain;
const toGoogleAuthResponse = (user, token, isNewUser, needsRoleSelection) => {
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            profilePicture: user.profilePicture,
            isNewUser
        },
        token,
        needsRoleSelection
    };
};
exports.toGoogleAuthResponse = toGoogleAuthResponse;
const toGoogleUserCreationDTO = (googleData, role = "user") => {
    return {
        name: googleData.name,
        email: googleData.email,
        profilePicture: googleData.profilePicture,
        googleId: googleData.googleId,
        role,
        isVerified: true,
        isGoogleUser: true,
    };
};
exports.toGoogleUserCreationDTO = toGoogleUserCreationDTO;
