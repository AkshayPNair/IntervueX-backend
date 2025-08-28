import { ISlotRuleRepository } from "../../../domain/interfaces/ISlotRuleRepository";
import { AvailableSlotResponseDTO, GenerateAvailableSlotsDTO ,TimeSlotDTO} from "../../../domain/dtos/slotRule.dto";
import { IBookingRepository } from "../../../domain/interfaces/IBookingRepository";
import { SlotRule,DaySlotRule } from "../../../domain/entities/SlotRule";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { IGenerateAvailableSlotsService } from "../../../domain/interfaces/IGenerateAvailableSlotsService";


export class GenerateAvailableSlotsUseCase implements IGenerateAvailableSlotsService{
    constructor(
        private _slotRuleRepository:ISlotRuleRepository,
        private _bookingRepository:IBookingRepository
    ){}

    async execute(data:GenerateAvailableSlotsDTO):Promise<AvailableSlotResponseDTO>{
        try {
            if(!this.isValidDateFormat(data.selectedDate)){
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Invalid date format. Please use YYYY-MM-DD format',
                    HttpStatusCode.BAD_REQUEST
                )
            }

            const selectedDate=new Date(data.selectedDate)
            const today=new Date()
            today.setHours(0,0,0,0)
            selectedDate.setHours(0,0,0,0)

            if(selectedDate<today){
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Cannot generate slots for past dates',
                    HttpStatusCode.BAD_REQUEST
                );
            }

            const slotRule=await this._slotRuleRepository.getSlotRuleByInterviewer(data.interviewerId);

            if(!slotRule){
                const weekday=this.getWeekdayName(selectedDate.getDay())
                return {
                    date:data.selectedDate,
                    weekday,
                    slots:[],
                }
            }

            return await this.generateAvailableSlots(slotRule,data.selectedDate,data.interviewerId)

        } catch (error) {
            if(error instanceof AppError){
                throw error
            }
            throw new AppError(
                ErrorCode.INTERNAL_ERROR,
                'Failed to generate available slots',
                HttpStatusCode.INTERNAL_SERVER
            )
        }
    }

    private async generateAvailableSlots(slotRule:SlotRule,selectedDate:string,interviewerId:string):Promise<AvailableSlotResponseDTO>{
        const date=new Date(selectedDate)
        const weekday=this.getWeekdayName(date.getDay())

        if(slotRule.blockedDates.includes(selectedDate)){
            return{
                date:selectedDate,
                weekday,
                slots:[],
            }
        }

        const daySlotRule=slotRule.slotRules.find(rule=>rule.day===weekday)

        if(!daySlotRule){
            return{
                date:selectedDate,
                weekday,
                slots:[],
            }
        }

        if (daySlotRule.startTime === '00:00' && daySlotRule.endTime === '00:00') {
            return {
                date: selectedDate,
                weekday,
                slots: [],
            };
        }

        const slots=await this.generateTimeSlots(daySlotRule,selectedDate,interviewerId)

        const availableSlots=slots.filter(slot=>!slot.isBooked)

        return {
            date:selectedDate,
            weekday,
            slots:availableSlots
        }
    }

    private async generateTimeSlots(daySlotRule:DaySlotRule,selectedDate:string,interviewerId:string):Promise<TimeSlotDTO[]>{
        const slots:TimeSlotDTO[]=[]

        const startMinutes=this.timeToMinutes(daySlotRule.startTime);
        const endMinutes=this.timeToMinutes(daySlotRule.endTime)

        const slotDuration=60

        let currentMinutes=startMinutes

        while(currentMinutes+slotDuration<=endMinutes){
            const slotStartTime=this.minutesToTime(currentMinutes);
            const slotEndTime=this.minutesToTime(currentMinutes+slotDuration)

            const isSlotAvailable=await this._bookingRepository.checkSlotAvailability(
                interviewerId,
                selectedDate,
                slotStartTime,
                slotEndTime
            )

            slots.push({
                startTime:slotStartTime,
                endTime:slotEndTime,
                available:daySlotRule.enabled,
                isBooked:!isSlotAvailable
            })

            currentMinutes+=slotDuration+daySlotRule.bufferTime
        }

        return slots

    }

    private isValidDateFormat(date: string): boolean {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) return false;
        
        const parsedDate = new Date(date);
        return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
    }

    private getWeekdayName(dayIndex: number): string {
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return weekdays[dayIndex];
    }
    
    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
    
    private minutesToTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

}