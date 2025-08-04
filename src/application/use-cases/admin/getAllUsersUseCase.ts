import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { AdminUserListDTO } from "../../../domain/dtos/user.dto";
import { toAdminUserListDTOs } from "../../../application/mappers/userMapper";

export class GetAllUsersUseCase{
    constructor(private _userRepository: IUserRepository){}

    async execute():Promise<AdminUserListDTO[]>{
        const users=await this._userRepository.getAllUsers();
        return toAdminUserListDTOs(users)
    }
}