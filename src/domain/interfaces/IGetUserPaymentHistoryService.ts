import { PaymentHistoryDTO } from "../dtos/payment.dto";

export interface IGetUserPaymentHistoryService{
    execute(userId:string):Promise<PaymentHistoryDTO>
}