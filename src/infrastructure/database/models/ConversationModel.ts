import mongoose, { Schema, Document } from 'mongoose';

export interface IConversationDocument extends Document {
  userId: string;
  interviewerId: string;
  lastMessage?: string;
  unreadForUser: number;
  unreadForInterviewer: number;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversationDocument>({
  userId: { type: String, required: true, index: true },
  interviewerId: { type: String, required: true, index: true },
  lastMessage: { type: String, default: '' },
  unreadForUser: { type: Number, default: 0 },
  unreadForInterviewer: { type: Number, default: 0 },
}, { timestamps: true });

conversationSchema.index({ userId: 1, interviewerId: 1 }, { unique: true });

export const ConversationModel = mongoose.model<IConversationDocument>('Conversation', conversationSchema);