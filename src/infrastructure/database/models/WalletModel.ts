import mongoose, { Document, Schema } from "mongoose";

export type WalletUserRole = 'admin' | 'interviewer' | 'user';
export type TransactionType = 'credit' | 'debit';

export interface IWalletDocument extends Document {
    userId: string;
    role: WalletUserRole;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
}

const walletSchema = new Schema<IWalletDocument>({
    userId: {
        type: String,
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ['admin', 'interviewer', 'user'],
        required: true,
        index: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
})

walletSchema.index({
    userId: 1,
    role: 1
}, { unique: true })

export const WalletModel = mongoose.model<IWalletDocument>('Wallet', walletSchema);

export interface IWalletTransactionDocument extends Document {
    walletId: string;
    userId: string;
    role: WalletUserRole;
    type: TransactionType;
    amount: number;
    reason: string;
    bookingId?: string;
    interviewerFee?: number;
    adminFee?: number;
    userName?: string;
    createdAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransactionDocument>({
    walletId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ['admin', 'interviewer', 'user'],
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    bookingId: {
        type: String
    },
    interviewerFee: {
        type: Number
    },
    adminFee: {
        type: Number
    },
    userName: {
        type: String
    }
}, {
    timestamps: {
        createdAt: true,
        updatedAt: false
    }
})

export const WalletTransactionModel = mongoose.model<IWalletTransactionDocument>('WalletTransaction', walletTransactionSchema);
