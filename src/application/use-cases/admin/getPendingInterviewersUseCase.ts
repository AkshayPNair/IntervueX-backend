import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { IInterviewerRepository } from "../../../domain/interfaces/IInterviewerRepository";
import { IGetPendingInterviewersService } from "../../../domain/interfaces/IGetPendingInterviewersService";

export class GetPendingInterviewersUseCase implements IGetPendingInterviewersService{
    constructor(
        private _userRepository: IUserRepository,
        private _interviewerRepository:IInterviewerRepository
    ){}

    async execute(){
        try {
            const pendingInterviewers= await this._userRepository.findPendingInterviewers();

            const interviewersWithProfiles=await Promise.all(
                pendingInterviewers.filter(user => user.id).map(async (user)=>{
                    const interviewerProfile=await this._interviewerRepository.findByUserId(user.id!)
                    return{
                        id:user.id!,
                        name:user.name,
                        email:user.email,
                        createdAt:user.createdAt,
                        profile:interviewerProfile
                    }
                })
            )

            return {
                success:true,
                interviewers: interviewersWithProfiles
            }
        } catch (error) {
            throw error
        }
    }
}