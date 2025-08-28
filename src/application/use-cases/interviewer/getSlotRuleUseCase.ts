import { ISlotRuleRepository } from '../../../domain/interfaces/ISlotRuleRepository';
import { SlotRuleResponseDTO } from '../../../domain/dtos/slotRule.dto';
import { toSlotRuleResponseDTO, getDefaultSlotRuleResponseDTO } from '../../mappers/slotRuleMapper';
import { AppError } from '../../error/AppError';
import { ErrorCode } from '../../error/ErrorCode';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';
import { IGetSlotRuleService } from '../../../domain/interfaces/IGetSlotRuleService';

export class GetSlotRuleUseCase implements IGetSlotRuleService{
    constructor(private _slotRuleRepository:ISlotRuleRepository){}

    async execute(interviewerId:string):Promise<SlotRuleResponseDTO>{
        try {
            const slotRule=await this._slotRuleRepository.getSlotRuleByInterviewer(interviewerId)

            if(!slotRule){
                return getDefaultSlotRuleResponseDTO(interviewerId)
            }

            return toSlotRuleResponseDTO(slotRule)
        } catch (error) {
                  if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to get slot rule', HttpStatusCode.INTERNAL_SERVER);
        }
    }
}