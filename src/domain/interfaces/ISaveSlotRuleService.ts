import { SaveSlotRuleDTO, SlotRuleResponseDTO } from "../dtos/slotRule.dto";

export interface ISaveSlotRuleService{
    execute(interviewerId:string,data:SaveSlotRuleDTO):Promise<SlotRuleResponseDTO>
}