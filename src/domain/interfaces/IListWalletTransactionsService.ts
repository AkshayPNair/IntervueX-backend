import { WalletTransactionDTO } from "../dtos/wallet.dto";

export interface IListWalletTransactionsService{
    execute(userId:string,role:"admin"|"interviewer"|"user", searchQuery?:string):Promise<WalletTransactionDTO[]>
}