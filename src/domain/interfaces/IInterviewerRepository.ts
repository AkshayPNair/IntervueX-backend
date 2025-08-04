import { SignupInterviewerDTO } from "../dtos/interviewer.dto";
import { Interviewer } from "../entities/Interviewer";

export interface IInterviewerRepository {
  createInterviewer(interviewer: Interviewer): Promise<Interviewer>;
  createInterviewerProfile(interviewer:{userId:string} & SignupInterviewerDTO):Promise<Interviewer>;
  findByUserId(userId: string): Promise<Interviewer | null>;
  updateInterviewer(userId: string, update: Partial<Interviewer>): Promise<void>;
  updateByUserId(userId:string,data:Partial<SignupInterviewerDTO>):Promise<Interviewer|null>;
  findInterviewerById(id:string):Promise<Interviewer|null>;
}