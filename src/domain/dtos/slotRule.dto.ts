export interface DaySlotRuleDTO{
    day:string;
    startTime:string;
    endTime:string;
    bufferTime:number;
    enabled:boolean;
}

export interface ExcludedTimeSlotDTO{
    startTime:string;
    endTime:string;
}

export interface SaveSlotRuleDTO{
    slotRules:DaySlotRuleDTO[];
    blockedDates:string[];
    excludedSlotsByDate?: Record<string, ExcludedTimeSlotDTO[]>;
}

export interface SlotRuleResponseDTO{
    id:string;
    interviewerId:string;
    slotRules:DaySlotRuleDTO[];
    blockedDates:string[];
    excludedSlotsByDate?: Record<string, ExcludedTimeSlotDTO[]>;
    createdAt:Date;
    updatedAt:Date;
}

export interface GenerateAvailableSlotsDTO{
    interviewerId:string;
    selectedDate:string;
}

export interface TimeSlotDTO{
    startTime:string;
    endTime:string;
    available:boolean;
    isBooked:boolean
}

export interface AvailableSlotResponseDTO{
    date:string;
    weekday:string;
    slots:TimeSlotDTO[];
}