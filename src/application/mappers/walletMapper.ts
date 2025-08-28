import { Wallet, WalletTransaction, WalletUserRole, TransactionType } from "../../domain/entities/Wallet";
import { WalletDTO, WalletSummaryDTO, CreateWalletTransactionDTO, WalletTransactionDTO } from "../../domain/dtos/wallet.dto";

export const toWalletDTO=(wallet:Wallet):WalletDTO=>({
    id:wallet.id,
    userId:wallet.userId,
    role:wallet.role,
    balance:wallet.balance,
    createdAt:wallet.createdAt,
    updatedAt:wallet.updatedAt
})

export const toWalletTransactionDTO=(tnx:WalletTransaction):WalletTransactionDTO=>({
    id:tnx.id,
    walletId:tnx.walletId,
    userId:tnx.userId ?? "",
    role:tnx.role as WalletUserRole,
    type:tnx.type as TransactionType,
    amount:tnx.amount,
    reason:tnx.reason,
    bookingId:tnx.bookingId,
    interviewerFee:tnx.interviewerFee,
    adminFee:tnx.adminFee,
    userName:tnx.userName,
    createdAt:tnx.createdAt
})

export const toCreateWalletTransactionDTO=(data:{
    userId:string,
    role:WalletUserRole,
    type:TransactionType,
    amount:number,
    reason:string,
    bookingId?:string;
    interviewerFee?:number;
    adminFee?:number;
    userName?:string;
}):CreateWalletTransactionDTO=>({
    userId:data.userId,
    role:data.role,
    type:data.type,
    amount:data.amount,
    reason:data.reason,
    bookingId:data.bookingId,
    interviewerFee:data.interviewerFee,
    adminFee:data.adminFee,
    userName:data.userName
})

export const toWalletSummaryDTO=(summary:{
    balance:number;
    totalCredits:number;
    totalDebits:number;
}):WalletSummaryDTO=>({
    balance:summary.balance,
    totalCredits:summary.totalCredits,
    totalDebits:summary.totalDebits
})