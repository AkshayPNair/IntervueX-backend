"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListWalletTransactionsUseCase = void 0;
const walletMapper_1 = require("../../../application/mappers/walletMapper");
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class ListWalletTransactionsUseCase {
    constructor(_walletRepository) {
        this._walletRepository = _walletRepository;
    }
    async execute(userId, role) {
        try {
            const tnx = await this._walletRepository.listTransactions(userId, role);
            return tnx.map(walletMapper_1.toWalletTransactionDTO);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Failed to get user bookings', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.ListWalletTransactionsUseCase = ListWalletTransactionsUseCase;
