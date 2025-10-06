import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { AdminUserListDTO } from "../../../domain/dtos/user.dto";
import { toAdminUserListDTOs } from "../../../application/mappers/userMapper";
import { IGetAllUsersService } from "../../../domain/interfaces/IGetAllUsersService";

export class GetAllUsersUseCase implements IGetAllUsersService{
    constructor(private _userRepository: IUserRepository){}

    async execute(searchQuery?: string, role?: string, status?: string, page?: number, pageSize?: number):Promise<{ users: AdminUserListDTO[], total: number }>{
        const { users, total }=await this._userRepository.getAllUsers(searchQuery, role, status, page, pageSize);
        return { users: toAdminUserListDTOs(users), total }
    }
}