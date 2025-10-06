"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPendingInterviewersUseCase = void 0;
now;
class GetPendingInterviewersUseCase {
    constructor(_userRepository, _interviewerRepository) {
        this._userRepository = _userRepository;
        this._interviewerRepository = _interviewerRepository;
    }
    async execute(searchQuery) {
        try {
            const pendingInterviewers = await this._userRepository.findPendingInterviewers(searchQuery);
            const interviewersWithProfiles = await Promise.all(pendingInterviewers.filter(user => user.id).map(async (user) => {
                const interviewerProfile = await this._interviewerRepository.findByUserId(user.id);
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                    profile: interviewerProfile
                };
            }));
            return {
                success: true,
                interviewers: interviewersWithProfiles
            };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.GetPendingInterviewersUseCase = GetPendingInterviewersUseCase;
