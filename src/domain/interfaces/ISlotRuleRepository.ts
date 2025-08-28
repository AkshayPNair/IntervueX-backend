import { SlotRule } from "../entities/SlotRule";
import { SaveSlotRuleDTO } from "../dtos/slotRule.dto";

export interface ISlotRuleRepository{
    saveOrUpdateSlotRule(interviewerId:string,data:SaveSlotRuleDTO):Promise<SlotRule>;
    getSlotRuleByInterviewer(interviewerId:string):Promise<SlotRule|null>;
    deleteSlotRule(interviewerId:string):Promise<void>;
}         