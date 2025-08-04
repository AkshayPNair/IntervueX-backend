import { InterviewerModel , IInterviewerDocument } from '../models/InterviewerModel';
import { Interviewer } from '../../../domain/entities/Interviewer';
import { toInterviewerPersistence, toInterviewerDomain } from '../../../application/mappers/interviewerMapper';
import { IInterviewerRepository } from '../../../domain/interfaces/IInterviewerRepository';
import { BaseRepository } from './baseRepository';
import { SignupInterviewerDTO } from '../../../domain/dtos/interviewer.dto';

export class InterviewerRepository extends BaseRepository<IInterviewerDocument> implements IInterviewerRepository {
  constructor(){
    super(InterviewerModel)
  }

  async createInterviewer(interviewer: Interviewer): Promise<Interviewer> {
    await InterviewerModel.create(toInterviewerPersistence(interviewer));
    return interviewer;
  }

  async createInterviewerProfile(interviewer: {userId:string} & SignupInterviewerDTO): Promise<Interviewer>{
    const result=await InterviewerModel.create(interviewer)
    return toInterviewerDomain(result,result.userId.toString())
  }

  async findInterviewerById(id: string): Promise<Interviewer | null> {
    const result=await this.model.findById(id)
    return result ? toInterviewerDomain(result,result.userId.toString()):null
  }

  async findByUserId(userId: string): Promise<Interviewer | null> {
    const result = await this.model.findOne({ userId });
    return result ? toInterviewerDomain(result, result.userId.toString()) : null;
  }

  async updateInterviewer(userId: string, update: Partial<Interviewer>): Promise<void> {
    await this.model.updateOne({ userId }, { $set: update });
  }

  async updateByUserId(userId: string, data: Partial<SignupInterviewerDTO>): Promise<Interviewer | null> {
    const result=await this.model.findOneAndUpdate(
      {userId},
      {$set:data},
      {new:true}
    )
    return result ? toInterviewerDomain(result,result.userId.toString()):null
  }

}