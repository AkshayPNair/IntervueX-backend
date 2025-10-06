"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllUsersUseCase = void 0;
const userMapper_1 = require("../../../application/mappers/userMapper");
class GetAllUsersUseCase {
    constructor(_userRepository) {
        this._userRepository = _userRepository;
    }
    async execute(searchQuery) {
        const users = await this._userRepository.getAllUsers(searchQuery);
        return (0, userMapper_1.toAdminUserListDTOs)(users);
    }
}
exports.GetAllUsersUseCase = GetAllUsersUseCase;
