import { Types } from 'mongoose';
import { ISlotRuleRepository } from '../../../domain/interfaces/ISlotRuleRepository';
import { SlotRule } from '../../../domain/entities/SlotRule';
import { SaveSlotRuleDTO } from '../../../domain/dtos/slotRule.dto';
import { SlotRuleModel } from '../models/SlotRuleModel';
import { AppError } from '../../../application/error/AppError';
import { ErrorCode } from '../../../application/error/ErrorCode';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';

export class SlotRuleRepository implements ISlotRuleRepository {

    async saveOrUpdateSlotRule(interviewerId: string, data: SaveSlotRuleDTO): Promise<SlotRule> {
        try {
            const interviewerObjectId = new Types.ObjectId(interviewerId);

            const updatedDoc = await SlotRuleModel.findOneAndUpdate(
                { interviewerId: interviewerObjectId },
                {
                    interviewerId: interviewerObjectId,
                    slotRules: data.slotRules,
                    blockedDates: data.blockedDates,
                    updatedAt: new Date()
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true
                }
            );

            if (!updatedDoc) {
                throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to save or update slot rule', HttpStatusCode.INTERNAL_SERVER);
            }

            return new SlotRule(
                (updatedDoc._id as Types.ObjectId).toString(),
                updatedDoc.interviewerId.toString(),
                updatedDoc.slotRules,
                updatedDoc.blockedDates,
                updatedDoc.createdAt,
                updatedDoc.updatedAt
            );

        } catch (error: any) {
            if (error.name === 'ValidationError') {
                throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid slot rule data', HttpStatusCode.BAD_REQUEST);
            }
            if (error.name === 'CastError') {
                throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid interviewer ID', HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError(ErrorCode.DATABASE_ERROR, 'Failed to save slot rule', HttpStatusCode.INTERNAL_SERVER);
        }
    }

    async getSlotRuleByInterviewer(interviewerId: string): Promise<SlotRule | null> {
        try {

            const interviewerObjectId = new Types.ObjectId(interviewerId)

            const slotRuleDoc = await SlotRuleModel.findOne({ interviewerId: interviewerObjectId })

            if (!slotRuleDoc) {
                return null
            }

            return new SlotRule(
                (slotRuleDoc._id as Types.ObjectId).toString(),
                slotRuleDoc.interviewerId.toString(),
                slotRuleDoc.slotRules,
                slotRuleDoc.blockedDates,
                slotRuleDoc.createdAt,
                slotRuleDoc.updatedAt
            );

        } catch (error: any) {
            if (error.name === 'CastError') {
                throw new AppError( ErrorCode.VALIDATION_ERROR,'Invalid interviewer ID', HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError(ErrorCode.DATABASE_ERROR,'Failed to get slot rule',  HttpStatusCode.INTERNAL_SERVER);
        }
    }

    async deleteSlotRule(interviewerId: string): Promise<void> {
        try {
            const interviewerObjectId=new Types.ObjectId(interviewerId)

            const result=await SlotRuleModel.deleteOne({interviewerId:interviewerObjectId})

            if(result.deletedCount===0){
                throw new AppError(ErrorCode.NOT_FOUND,'Slot rule not found',HttpStatusCode.NOT_FOUND)
            }
        } catch (error:any) {
            if (error instanceof AppError) {
        throw error;
      }
      if (error.name === 'CastError') {
        throw new AppError(ErrorCode.VALIDATION_ERROR,'Invalid interviewer ID',HttpStatusCode.BAD_REQUEST);
      }
      throw new AppError( ErrorCode.DATABASE_ERROR,'Failed to delete slot rule', HttpStatusCode.INTERNAL_SERVER);
        }
    }

}

