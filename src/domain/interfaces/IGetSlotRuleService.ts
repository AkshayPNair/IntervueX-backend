import { SlotRuleResponseDTO } from "../dtos/slotRule.dto";

export interface IGetSlotRuleService{
    execute(interviewerId:string):Promise<SlotRuleResponseDTO>
}