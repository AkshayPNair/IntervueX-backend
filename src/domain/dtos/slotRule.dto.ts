export interface DaySlotRuleDTO{
    day:string;
    startTime:string;
    endTime:string;
    bufferTime:number;
    enabled:boolean;
}

export interface SaveSlotRuleDTO{
    slotRules:DaySlotRuleDTO[];
    blockedDates:string[];
}

export interface SlotRuleResponseDTO{
    id:string;
    interviewerId:string;
    slotRules:DaySlotRuleDTO[];
    blockedDates:string[];
    createdAt:Date;
    updatedAt:Date;
}
