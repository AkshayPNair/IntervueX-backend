"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotRule = void 0;
class SlotRule {
    constructor(id, interviewerId, slotRules, blockedDates, excludedSlotsByDate = {}, createdAt, updatedAt) {
        this.id = id;
        this.interviewerId = interviewerId;
        this.slotRules = slotRules;
        this.blockedDates = blockedDates;
        this.excludedSlotsByDate = excludedSlotsByDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.SlotRule = SlotRule;
