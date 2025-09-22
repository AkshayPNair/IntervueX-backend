import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  otp?: string;
  otpExpiry?: Date;
  isVerified: boolean;
  isApproved: boolean;
  role: "user" | "interviewer" | "admin";
  isBlocked:boolean;
  totalSessions?: number;
  hasSubmittedVerification:boolean;
  isRejected:boolean;
  rejectedReason?:string;
  profilePicture?: string;
  resume?: string;
  skills: string[];
  isGoogleUser:boolean;
  googleId?:string;
  createdAt:Date;
  updatedAt:Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { 
      type: String, 
      required: function(this:IUserDocument){
        return !this.isGoogleUser
      }
    },
    otp: { type: String , default:null },
    otpExpiry: { type: Date , default:null },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'interviewer', 'admin'], required: true },
    isBlocked: { type: Boolean, default: false },
    totalSessions: { type: Number, default: 0 },
    hasSubmittedVerification:{type:Boolean,default:false},
    isRejected:{type:Boolean,default:false},
    rejectedReason:{type:String,default:null},
    profilePicture: { type: String, default: null },
    resume: { type: String, default: null },
    skills: { type: [String], default: [] },
    isGoogleUser:{type:Boolean,default:false},
    googleId:{type:String,default:null}
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>('User', userSchema);
