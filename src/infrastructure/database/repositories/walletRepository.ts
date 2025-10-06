import { Types } from "mongoose";
import { BaseRepository } from "./baseRepository";
import { IWalletRepository, CreateTransaction, WalletSummary } from "../../../domain/interfaces/IWalletRepository";
import { Wallet, WalletTransaction } from '../../../domain/entities/Wallet'
import { IWalletDocument, IWalletTransactionDocument, WalletModel, WalletTransactionModel } from "../models/WalletModel";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";

export class WalletRepository extends BaseRepository<IWalletDocument> implements IWalletRepository {
    constructor() {
        super(WalletModel)
    }

    async getOrCreateWallet(userId: string, role: "admin" | "interviewer" | "user"): Promise<Wallet> {
        try {
            const existing = await this.findOne({ userId, role })
            if (existing) {
                return new Wallet(
                    (existing._id as Types.ObjectId).toString(),
                    existing.userId,
                    existing.role,
                    existing.balance,
                    existing.createdAt,
                    existing.updatedAt
                )
            }

            const created = await this.create({ userId, role, balance: 0 } as Partial<IWalletDocument>);
            return new Wallet(
                (created._id as Types.ObjectId).toString(),
                created.userId,
                created.role,
                created.balance,
                created.createdAt,
                created.updatedAt
            )

        } catch (error) {
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to get or create wallet',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }

    async createTransaction(data: CreateTransaction): Promise<WalletTransaction> {
        try {

            const wallet = await this.getOrCreateWallet(data.userId, data.role);

            const tnxDoc = await WalletTransactionModel.create({
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

            })

            const inc = data.type === 'credit' ? data.amount : -data.amount;
            const updated = await WalletModel.findByIdAndUpdate(
                wallet.id,
                { $inc: { balance: inc } },
                { new: true }
            ).exec()

            if (!updated) {
                throw new AppError(
                    ErrorCode.NOT_FOUND,
                    'Wallet not found while updating balance',
                    HttpStatusCode.NOT_FOUND
                );
            }

            return new WalletTransaction(
                (tnxDoc._id as Types.ObjectId).toString(),
                tnxDoc.walletId,
                tnxDoc.userId,
                tnxDoc.role,
                tnxDoc.type,
                tnxDoc.amount,
                tnxDoc.reason,
                tnxDoc.bookingId,
                tnxDoc.interviewerFee,
                tnxDoc.adminFee,
                tnxDoc.userName,
                tnxDoc.createdAt
            );

        } catch (error) {
            if (error instanceof AppError) {
                throw error
            }
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to create transaction',
                HttpStatusCode.INTERNAL_SERVER
            )
        }
    }

    async listTransactions(userId: string, role: "admin" | "interviewer" | "user", searchQuery?: string): Promise<WalletTransaction[]> {
        try {

            const walletDoc = await this.findOne({ userId, role })
            if (!walletDoc) {
                return []
            }

            let query = { walletId: (walletDoc._id as Types.ObjectId).toString() };
            if (searchQuery) {
                query = {
                    ...query,
                    $or: [
                        { userName: { $regex: searchQuery, $options: 'i' } },
                        { reason: { $regex: searchQuery, $options: 'i' } },
                        { bookingId: { $regex: searchQuery, $options: 'i' } }
                    ]
                } as any;
            }

            const docs: IWalletTransactionDocument[] = await WalletTransactionModel.find(query)
                .sort({ createdAt: -1 })
                .exec()

            return docs.map((doc) => new WalletTransaction(
                (doc._id as Types.ObjectId).toString(),
                doc.walletId,
                doc.userId,
                doc.role,
                doc.type,
                doc.amount,
                doc.reason,
                doc.bookingId,
                doc.interviewerFee,
                doc.adminFee,
                doc.userName,
                doc.createdAt
            ))

        } catch (error) {
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to list transactions',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }

    async getSummary(userId: string, role: "admin" | "interviewer" | "user"): Promise<WalletSummary> {
        try {

            const walletDoc = await this.findOne({ userId, role });
            if (!walletDoc) {
                return { balance: 0, totalCredits: 0, totalDebits: 0 };
            }

            const walletId = (walletDoc._id as Types.ObjectId).toString();
            const agg: { _id: 'credit' | 'debit'; total: number }[] = await WalletTransactionModel.aggregate([
                { $match: { walletId } },
                { $group: { _id: '$type', total: { $sum: '$amount' } } },
            ]).exec();

            let totalCredits = 0;
            let totalDebits = 0;
            for (const row of agg) {
                if (row._id === 'credit') totalCredits = row.total;
                if (row._id === 'debit') totalDebits = row.total;
            }

            return {
                balance: walletDoc.balance,
                totalCredits,
                totalDebits,
            };

        } catch (error) {
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to get wallet summary',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }

}