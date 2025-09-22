export interface DaySlotRule {
    day: string;
    startTime: string;
    endTime: string;
    bufferTime: number;
    enabled: boolean;
}

export interface ExcludedTimeSlot{
    startTime:string;
    endTime:string;
}

export class SlotRule {
    constructor(
        public id: string,
        public interviewerId: string,
        public slotRules: DaySlotRule[],
        public blockedDates: string[],
        public excludedSlotsByDate: Record<string, ExcludedTimeSlot[]> = {},
        public createdAt: Date,
        public updatedAt: Date
    ) { }
}