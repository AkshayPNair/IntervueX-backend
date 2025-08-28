export type WalletUserRole= 'admin'|'interviewer'|'user';

export class Wallet{
    constructor(
        public id:string,
        public userId:string,
        public role:WalletUserRole,
        public balance:number,
        public createdAt:Date=new Date(),
        public updatedAt:Date=new Date()
    ) {}
}

export type TransactionType = 'credit'|'debit'

export class WalletTransaction{
    constructor(
        public id:string,
        public walletId:string,
        public userId:string,
        public role:WalletUserRole,
        public type:TransactionType,
        public amount:number,
        public reason:string,
        public bookingId?:string,
         public interviewerFee?:number,
        public adminFee?:number,
        public userName?:string,
        public createdAt:Date=new Date()
    ){}
}