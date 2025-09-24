"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultSlotRuleResponseDTO = exports.toSlotRuleResponseDTO = void 0;
const toSlotRuleResponseDTO = (slotRule) => {
    return {
        id: slotRule.id,
        interviewerId: slotRule.interviewerId,
        slotRules: slotRule.slotRules,
        blockedDates: slotRule.blockedDates,
        excludedSlotsByDate: slotRule.excludedSlotsByDate,
        createdAt: slotRule.createdAt,
        updatedAt: slotRule.updatedAt
    };
};
exports.toSlotRuleResponseDTO = toSlotRuleResponseDTO;
const getDefaultSlotRuleResponseDTO = (interviewerId) => {
    const defaultSlotRules = [
        { day: "Sun", startTime: '', endTime: '', bufferTime: 15, enabled: false },
        { day: 'Mon', startTime: '', endTime: '', bufferTime: 15, enabled: false },
        { day: 'Tue', startTime: '', endTime: '', bufferTime: 15, enabled: false },
        { day: 'Wed', startTime: '', endTime: '', bufferTime: 15, enabled: false },
        { day: 'Thu', startTime: '', endTime: '', bufferTime: 15, enabled: false },
        { day: 'Fri', startTime: '', endTime: '', bufferTime: 15, enabled: false },
        { day: 'Sat', startTime: '', endTime: '', bufferTime: 15, enabled: false }
    ];
    return {
        id: '',
        interviewerId,
        slotRules: defaultSlotRules,
        blockedDates: [],
        excludedSlotsByDate: {},
        createdAt: new Date(),
        updatedAt: new Date()
    };
};
exports.getDefaultSlotRuleResponseDTO = getDefaultSlotRuleResponseDTO;
