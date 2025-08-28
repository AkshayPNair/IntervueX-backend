import { razorpayInstance } from "../../../infrastructure/external/services/razorpayService";
import { RazorpayOrderDTO, RazorpayOrderResponseDTO } from "../../../domain/dtos/booking.dto";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { ICreateRazorpayOrderService } from "../../../domain/interfaces/ICreateRazorpayOrderService";

export class CreateRazorpayOrderUseCase implements ICreateRazorpayOrderService{
    async execute(data: RazorpayOrderDTO): Promise<RazorpayOrderResponseDTO> {
        try {
            const options = {
                amount:Number(data.amount) * 100,
                currency: data.currency,
                receipt: data.receipt
            }

            const order = await razorpayInstance.orders.create(options)

            return {
                id: order.id,
                amount: Number(order.amount) / 100,
                currency: order.currency,
                receipt: order.receipt || ''
            }
        } catch (error: any) {
            console.error("Razorpay order creation error:", error);
            throw new AppError(
                ErrorCode.PAYMENT_ERROR,
                error.message || "Failed to create Razorpay order",
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }
}