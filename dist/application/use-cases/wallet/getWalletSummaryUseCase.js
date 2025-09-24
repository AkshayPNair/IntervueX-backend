"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWalletSummaryUseCase = void 0;
const walletMapper_1 = require("../../../application/mappers/walletMapper");
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class GetWalletSummaryUseCase {
    constructor(_walletRepository) {
        this._walletRepository = _walletRepository;
    }
    async execute(userId, role) {
        try {
            const summary = await this._walletRepository.getSummary(userId, role);
            return (0, walletMapper_1.toWalletSummaryDTO)(summary);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Failed to get user bookings', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.GetWalletSummaryUseCase = GetWalletSummaryUseCase;
