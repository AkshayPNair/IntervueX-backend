import mongoose,{Schema, Document, Types} from "mongoose";

export interface IInterviewerDocument extends Document{
    userId: Types.ObjectId;
    profilePic?: string;
    jobTitle?:string;
    yearsOfExperience?: number;
    professionalBio?: string;
    technicalSkills?: string[];
    resume?: string;
    hourlyRate?:number
}

const interviewerSchema = new Schema<IInterviewerDocument>({
    userId:{type: Schema.Types.ObjectId, ref:'User', required: true},
    profilePic: String,
    jobTitle: String,
    yearsOfExperience: Number,
    professionalBio: String,
    technicalSkills: [String],
    resume: String,
    hourlyRate:Number,
    
},{timestamps: true})

export const InterviewerModel=mongoose.model<IInterviewerDocument>('Interviewer', interviewerSchema);