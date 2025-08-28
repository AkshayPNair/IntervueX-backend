import { GenerateAvailableSlotsDTO, AvailableSlotResponseDTO } from "../dtos/slotRule.dto";

export interface IGenerateAvailableSlotsService{
    execute(data:GenerateAvailableSlotsDTO):Promise<AvailableSlotResponseDTO>
}