export interface IDeleteAccountService {
    execute(userId: string): Promise<void>
}