import { WalletSummaryDTO } from "../dtos/wallet.dto";

export interface IGetWalletSummaryService{
    execute(userId:string,role:"admin"|"interviewer"|"user"):Promise<WalletSummaryDTO>
}