import {LoginDTO} from '../dtos/user.dto'

export interface ILoginService{
    execute(loginDto: LoginDTO): Promise<{
        token: string;
        user:{
            id?:string;
            name:string;
            email:string;
            role:string;
            isApproved?:boolean;
        }
    }>
}
