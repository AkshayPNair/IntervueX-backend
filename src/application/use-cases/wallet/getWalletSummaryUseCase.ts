import { IWalletRepository } from "../../../domain/interfaces/IWalletRepository";
import { WalletSummaryDTO } from "../../../domain/dtos/wallet.dto";
import { toWalletSummaryDTO } from "../../../application/mappers/walletMapper";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { IGetWalletSummaryService } from "../../../domain/interfaces/IGetWalletSummaryService";

export class GetWalletSummaryUseCase implements IGetWalletSummaryService{
    constructor(private _walletRepository: IWalletRepository) { }

    async execute(userId: string, role: "admin" | "interviewer" | "user"): Promise<WalletSummaryDTO> {
        try {
            const summary = await this._walletRepository.getSummary(userId, role)
            return toWalletSummaryDTO(summary)

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

