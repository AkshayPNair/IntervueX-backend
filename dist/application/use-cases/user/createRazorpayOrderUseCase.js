"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRazorpayOrderUseCase = void 0;
const razorpayService_1 = require("../../../infrastructure/external/services/razorpayService");
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const logger_1 = require("../../../utils/logger");
class CreateRazorpayOrderUseCase {
    async execute(data) {
        try {
            const options = {
                amount: Number(data.amount) * 100,
                currency: data.currency,
                receipt: data.receipt
            };
            const order = await razorpayService_1.razorpayInstance.orders.create(options);
            return {
                id: order.id,
                amount: Number(order.amount) / 100,
                currency: order.currency,
                receipt: order.receipt || ''
            };
        }
        catch (error) {
            logger_1.logger.error('Razorpay order creation error', { error });
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.PAYMENT_ERROR, error.message || "Failed to create Razorpay order", HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.CreateRazorpayOrderUseCase = CreateRazorpayOrderUseCase;
