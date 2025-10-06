import { AdminUserListDTO } from "../dtos/user.dto";

export interface IGetAllUsersService{
    execute(searchQuery?: string, role?: string, status?: string, page?: number, pageSize?: number):Promise<{ users: AdminUserListDTO[], total: number }>
}