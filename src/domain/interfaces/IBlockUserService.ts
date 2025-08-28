export interface IBlockUserService{
    execute(userId:string):Promise<void>
}