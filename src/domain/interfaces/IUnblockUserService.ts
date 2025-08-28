export interface IUnblockUserService{
    execute(userId:string):Promise<void>
}