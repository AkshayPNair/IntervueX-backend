import { Wallet,WalletTransaction } from "../entities/Wallet";

export interface CreateTransaction{
    userId:string;
    role:'admin'|'interviewer'|'user';
    type:'credit'|'debit';
    amount:number;
    reason:string;
    bookingId?:string;
    interviewerFee?:number;
    adminFee?:number;
    userName?:string;
}

export interface WalletSummary{
    balance:number;
    totalCredits:number;
    totalDebits:number;
}

export interface IWalletRepository{
    getOrCreateWallet(userId:string, role:'admin'|'interviewer'|'user'):Promise<Wallet>;
    createTransaction(data:CreateTransaction):Promise<WalletTransaction>;
    listTransactions(userId:string,role:'admin'|'interviewer'|'user', searchQuery?:string):Promise<WalletTransaction[]>;
    getSummary(userId:string,role:'admin'|'interviewer'|'user'):Promise<WalletSummary>
}