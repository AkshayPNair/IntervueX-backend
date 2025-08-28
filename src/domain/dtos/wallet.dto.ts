import { WalletUserRole, TransactionType } from "../entities/Wallet";

export interface WalletDTO{
    id:string;
    userId:string;
    role:WalletUserRole;
    balance:number;
    createdAt:Date;
    updatedAt:Date;
}

export interface WalletTransactionDTO{
    id:string;
    walletId:string;
    userId:string;
    role:WalletUserRole;
    type:TransactionType;
    amount:number;
    reason:string;
    bookingId?:string;
    interviewerFee?:number;
    adminFee?:number;
    userName?:string;
    createdAt:Date;
}

export interface CreateWalletTransactionDTO{
    userId:string;
    role:WalletUserRole;
    type:TransactionType;
    amount:number;
    reason:string;
    bookingId?:string;
    interviewerFee?:number;
    adminFee?:number;
    userName?:string;
}

export interface WalletSummaryDTO{
    balance:number;
    totalCredits:number;
    totalDebits:number;
}