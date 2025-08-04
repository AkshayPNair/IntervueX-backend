import { SignupUserDTO } from "../dtos/user.dto";
import { SignupInterviewerDTO } from "../dtos/interviewer.dto";
export interface ISignupService{
    execute(userDto: SignupUserDTO, interviewerDto?: SignupInterviewerDTO):Promise<void>;
}