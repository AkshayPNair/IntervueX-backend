import { InterviewerModel , IInterviewerDocument } from '../models/InterviewerModel';
import { Interviewer } from '../../../domain/entities/Interviewer';
import { IInterviewerRepository } from '../../../domain/interfaces/IInterviewerRepository';
import { BaseRepository } from './baseRepository';
import { SignupInterviewerDTO } from '../../../domain/dtos/interviewer.dto';

function mapDocToInterviewer(doc: IInterviewerDocument): Interviewer {
  return new Interviewer(
    doc.userId.toString(),
    doc.profilePic,
    doc.jobTitle,
    doc.yearsOfExperience,
    doc.professionalBio,
    doc.technicalSkills,
    doc.resume,
    doc.hourlyRate
  )
}

export class InterviewerRepository extends BaseRepository<IInterviewerDocument> implements IInterviewerRepository {
  constructor(){
    super(InterviewerModel)
  }

  async createInterviewer(interviewer: Interviewer): Promise<Interviewer> {
    await InterviewerModel.create({
      userId: interviewer.userId,
      profilePic: interviewer.profilePic,
      jobTitle: interviewer.jobTitle,
      yearsOfExperience: interviewer.yearsOfExperience,
      professionalBio: interviewer.professionalBio,
      technicalSkills: interviewer.technicalSkills,
      resume: interviewer.resume,
      hourlyRate: interviewer.hourlyRate,
    });
    return interviewer;
  }

  async createInterviewerProfile(interviewer: {userId:string} & SignupInterviewerDTO): Promise<Interviewer>{
    const result=await InterviewerModel.create(interviewer)
    return mapDocToInterviewer(result)
  }

  async findInterviewerById(id: string): Promise<Interviewer | null> {
    const result=await this.model.findById(id)
    return result ? mapDocToInterviewer(result):null
  }

  async findByUserId(userId: string): Promise<Interviewer | null> {
    const result = await this.model.findOne({ userId });
    return result ? mapDocToInterviewer(result) : null;
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
    return result ? mapDocToInterviewer(result):null
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.model.deleteOne({ userId }).exec();
  }

}