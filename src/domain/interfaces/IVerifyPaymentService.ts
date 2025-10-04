import { VerifyPaymentDTO } from "../dtos/booking.dto";

export interface IVerifyPaymentService {
    execute(data: VerifyPaymentDTO,userId: string): Promise<void>;
}