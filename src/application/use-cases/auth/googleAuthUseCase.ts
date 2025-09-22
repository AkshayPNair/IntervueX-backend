import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { IInterviewerRepository } from "../../../domain/interfaces/IInterviewerRepository";
import { User } from "../../../domain/entities/User";
import { IGoogleAuthService } from "../../../domain/interfaces/IGoogleAuthService";
import { GoogleLoginDTO, GoogleUserCreationDTO, RoleSelectionDTO, GoogleAuthResponse } from "../../../domain/dtos/googleAuth.dto";
import { toGoogleAuthResponse,toGoogleUserCreationDTO,toGoogleUserDomain } from "../../../application/mappers/googleAuthMapper";
import { signJwt } from "../../../infrastructure/external/services/jwtService";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { logger } from '../../../utils/logger';

export class GoogleAuthUseCase implements IGoogleAuthService{
    constructor(
        private _userRepository:IUserRepository,
        private _interviewerRepository:IInterviewerRepository
    ){}

    async googleLogin(googleData:GoogleLoginDTO):Promise<GoogleAuthResponse>{
        try {
            logger.info('GoogleAuthUseCase: Starting Google login', { hasData: !!googleData });

            let existingUser=await this._userRepository.findUserByGoogleId(googleData.googleId)
            logger.debug?.('GoogleAuthUseCase: Found existing user by Google ID', { exists: !!existingUser });

            if(!existingUser){
                existingUser=await this._userRepository.findUserByEmail(googleData.email)
            }

            if(existingUser){
                if(!existingUser.isGoogleUser || !existingUser.googleId){
                    await this._userRepository.updateUser(existingUser.id!,{
                        isGoogleUser:true,
                        googleId:googleData.googleId,
                        profilePicture:googleData.profilePicture||existingUser.profilePicture
                    })
                    existingUser.isGoogleUser=true;
                    existingUser.googleId=googleData.googleId,
                    existingUser.profilePicture=googleData.profilePicture||existingUser.profilePicture
                }

                const token=signJwt({
                    userId:existingUser.id!,
                    email:existingUser.email,
                    role:existingUser.role
                },existingUser.role)

                return toGoogleAuthResponse(existingUser, token, false, false);
            }else{
                const userCreationData=toGoogleUserCreationDTO(googleData,'user')
                const newUser=toGoogleUserDomain(userCreationData)
                const createdUser=await this._userRepository.createUser(newUser)

                const token = signJwt({
                    userId: createdUser.id!,
                  email: createdUser.email,
                 role: createdUser.role
                },createdUser.role);

                return toGoogleAuthResponse(createdUser,token,true,true)
            }
        } catch (error) {
            logger.error('GoogleAuthUseCase: Error during Google login', { error });
            throw new AppError(ErrorCode.INVALID_TOKEN,'Google Authentication failed',HttpStatusCode.UNAUTHORIZED)
        }
    }

    async selectRole(userId:string,roleData:RoleSelectionDTO):Promise<GoogleAuthResponse>{
        try {
            const user=await this._userRepository.findUserById(userId)
            if(!user){
                throw new AppError(ErrorCode.NOT_FOUND,'User not found',HttpStatusCode.NOT_FOUND)
            }
            if(!user.isGoogleUser){
                throw new AppError(ErrorCode.UNAUTHORIZED,'Role selection is only available for google users',HttpStatusCode.UNAUTHORIZED)
            }

            await this._userRepository.updateUser(userId, {
                role: roleData.role
            });

            user.role = roleData.role;

            if (roleData.role === 'interviewer') {
                const existingInterviewer = await this._interviewerRepository.findByUserId(userId);
                if (!existingInterviewer) {
                    await this._interviewerRepository.createInterviewerProfile({
                        userId: userId,
                        profilePic: user.profilePicture,
                        jobTitle: undefined,
                        yearsOfExperience: undefined,
                        professionalBio: undefined,
                        technicalSkills: [],
                        resume: undefined
                    });
                }
            }

            // Generate new JWT token with updated role
            const token = signJwt({
                userId: user.id!,
                email: user.email,
                role: user.role
            },user.role);

            return toGoogleAuthResponse(user, token, false, false);
        } catch (error) {
            throw new AppError(ErrorCode.INTERNAL_ERROR,'Role selection failed',HttpStatusCode.INTERNAL_SERVER)
        }
    }
}


