import { AdminUserListDTO } from "../dtos/user.dto";

export interface IGetAllUsersService{
    execute():Promise<AdminUserListDTO[]>
}