import { WalletTransactionDTO } from "../dtos/wallet.dto";

export interface IListWalletTransactionsService{
    execute(userId:string,role:"admin"|"interviewer"|"user"):Promise<WalletTransactionDTO[]>
}