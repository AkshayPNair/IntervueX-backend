import { IWalletRepository } from "../../../domain/interfaces/IWalletRepository";
import { WalletTransactionDTO } from "../../../domain/dtos/wallet.dto";
import { toWalletTransactionDTO } from "../../../application/mappers/walletMapper";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { IListWalletTransactionsService } from "../../../domain/interfaces/IListWalletTransactionsService";

export class ListWalletTransactionsUseCase implements IListWalletTransactionsService{
    constructor(private _walletRepository: IWalletRepository) { }

    async execute(userId: string, role: 'admin' | 'interviewer' | 'user'): Promise<WalletTransactionDTO[]> {
        try {
            const tnx = await this._walletRepository.listTransactions(userId, role)
            return tnx.map(toWalletTransactionDTO)
        } catch (error) {
            if (error instanceof AppError) {
                throw error
            }
            throw new AppError(
                ErrorCode.INTERNAL_ERROR,
                'Failed to get user bookings',
                HttpStatusCode.INTERNAL_SERVER
            )

        }
    }
}