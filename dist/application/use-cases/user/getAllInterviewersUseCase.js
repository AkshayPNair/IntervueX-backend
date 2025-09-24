"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllInterviewerUseCase = void 0;
const userMapper_1 = require("../../mappers/userMapper");
class GetAllInterviewerUseCase {
    constructor(_userRepository) {
        this._userRepository = _userRepository;
    }
    async execute() {
        const interviewers = await this._userRepository.findApprovedInterviewersWithProfiles();
        return interviewers.map(interviewer => (0, userMapper_1.toInterviewerProfileDTO)(interviewer));
    }
}
exports.GetAllInterviewerUseCase = GetAllInterviewerUseCase;
