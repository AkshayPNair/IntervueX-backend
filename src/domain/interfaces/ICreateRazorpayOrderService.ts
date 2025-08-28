import { RazorpayOrderDTO,RazorpayOrderResponseDTO } from "../dtos/booking.dto";

export interface ICreateRazorpayOrderService{
    execute(data:RazorpayOrderDTO):Promise<RazorpayOrderResponseDTO>
}