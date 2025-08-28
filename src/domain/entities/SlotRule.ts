export interface DaySlotRule {
    day: string;
    startTime: string;
    endTime: string;
    bufferTime: number;
    enabled: boolean;
}

export class SlotRule {
    constructor(
        public id: string,
        public interviewerId: string,
        public slotRules: DaySlotRule[],
        public blockedDates: string[],
        public createdAt: Date,
        public updatedAt: Date
    ) { }
}