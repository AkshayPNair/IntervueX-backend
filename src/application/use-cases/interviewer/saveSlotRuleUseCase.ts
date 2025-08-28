import { ISlotRuleRepository } from '../../../domain/interfaces/ISlotRuleRepository';
import { SaveSlotRuleDTO, SlotRuleResponseDTO } from '../../../domain/dtos/slotRule.dto';
import { toSlotRuleResponseDTO } from '../../mappers/slotRuleMapper';
import { AppError } from '../../error/AppError';
import { ErrorCode } from '../../error/ErrorCode';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';
import { ISaveSlotRuleService } from '../../../domain/interfaces/ISaveSlotRuleService';

export class SaveSlotRuleUseCase implements ISaveSlotRuleService{
    constructor(private _slotRuleRepository: ISlotRuleRepository) { }

    async execute(interviewerId: string, data: SaveSlotRuleDTO): Promise<SlotRuleResponseDTO> {

        this._validateSlotRuleData(data)

        try {
            const slotRule = await this._slotRuleRepository.saveOrUpdateSlotRule(interviewerId, data)

            return toSlotRuleResponseDTO(slotRule)
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to save slot rule', HttpStatusCode.INTERNAL_SERVER);
        }
    }

    private _validateSlotRuleData(data: SaveSlotRuleDTO): void {

        for (const daySlotRule of data.slotRules) {
            if (daySlotRule.enabled) {

                if (!this._isValidTimeFormat(daySlotRule.startTime) || !this._isValidTimeFormat(daySlotRule.endTime)) {
                    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid time format. Use HH:MM format', HttpStatusCode.BAD_REQUEST);
                }

                if (!daySlotRule.startTime || !daySlotRule.endTime) {
                    throw new AppError(ErrorCode.VALIDATION_ERROR, `Start time and end time are required for enabled days`, HttpStatusCode.BAD_REQUEST);
                }

                if (daySlotRule.bufferTime < 0 || daySlotRule.bufferTime > 60) {
                    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Buffer time must be between 0 and 60 minutes', HttpStatusCode.BAD_REQUEST)
                }
            }
        }

        if (data.blockedDates && Array.isArray(data.blockedDates)) {
            for (const date of data.blockedDates) {
                if (!this._isValidDateFormat(date)) {
                    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid date format. Use YYYY-MM-DD format', HttpStatusCode.BAD_REQUEST);
                }
            }
        }
    }

    private _isValidTimeFormat(time: string): boolean {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    private _isValidDateFormat(date: string): boolean {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) return false;

        // Check if it's a valid date
        const parsedDate = new Date(date);
        return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
    }
}