"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletRepository = void 0;
const baseRepository_1 = require("./baseRepository");
const Wallet_1 = require("../../../domain/entities/Wallet");
const WalletModel_1 = require("../models/WalletModel");
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class WalletRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(WalletModel_1.WalletModel);
    }
    async getOrCreateWallet(userId, role) {
        try {
            const existing = await this.findOne({ userId, role });
            if (existing) {
                return new Wallet_1.Wallet(existing._id.toString(), existing.userId, existing.role, existing.balance, existing.createdAt, existing.updatedAt);
            }
            const created = await this.create({ userId, role, balance: 0 });
            return new Wallet_1.Wallet(created._id.toString(), created.userId, created.role, created.balance, created.createdAt, created.updatedAt);
        }
        catch (error) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to get or create wallet', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async createTransaction(data) {
        try {
            const wallet = await this.getOrCreateWallet(data.userId, data.role);
            const tnxDoc = await WalletModel_1.WalletTransactionModel.create({
                walletId: wallet.id,
                userId: data.userId,
                role: data.role,
                type: data.type,
                amount: data.amount,
                reason: data.reason,
                bookingId: data.bookingId,
                interviewerFee: data.interviewerFee,
                adminFee: data.adminFee,
                userName: data.userName
            });
            const inc = data.type === 'credit' ? data.amount : -data.amount;
            const updated = await WalletModel_1.WalletModel.findByIdAndUpdate(wallet.id, { $inc: { balance: inc } }, { new: true }).exec();
            if (!updated) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, 'Wallet not found while updating balance', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
            }
            return new Wallet_1.WalletTransaction(tnxDoc._id.toString(), tnxDoc.walletId, tnxDoc.userId, tnxDoc.role, tnxDoc.type, tnxDoc.amount, tnxDoc.reason, tnxDoc.bookingId, tnxDoc.interviewerFee, tnxDoc.adminFee, tnxDoc.userName, tnxDoc.createdAt);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to create transaction', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async listTransactions(userId, role) {
        try {
            const walletDoc = await this.findOne({ userId, role });
            if (!walletDoc) {
                return [];
            }
            const docs = await WalletModel_1.WalletTransactionModel.find({ walletId: walletDoc._id.toString() })
                .sort({ createdAt: -1 })
                .exec();
            return docs.map((doc) => new Wallet_1.WalletTransaction(doc._id.toString(), doc.walletId, doc.userId, doc.role, doc.type, doc.amount, doc.reason, doc.bookingId, doc.interviewerFee, doc.adminFee, doc.userName, doc.createdAt));
        }
        catch (error) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to list transactions', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async getSummary(userId, role) {
        try {
            const walletDoc = await this.findOne({ userId, role });
            if (!walletDoc) {
                return { balance: 0, totalCredits: 0, totalDebits: 0 };
            }
            const walletId = walletDoc._id.toString();
            const agg = await WalletModel_1.WalletTransactionModel.aggregate([
                { $match: { walletId } },
                { $group: { _id: '$type', total: { $sum: '$amount' } } },
            ]).exec();
            let totalCredits = 0;
            let totalDebits = 0;
            for (const row of agg) {
                if (row._id === 'credit')
                    totalCredits = row.total;
                if (row._id === 'debit')
                    totalDebits = row.total;
            }
            return {
                balance: walletDoc.balance,
                totalCredits,
                totalDebits,
            };
        }
        catch (error) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to get wallet summary', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.WalletRepository = WalletRepository;
