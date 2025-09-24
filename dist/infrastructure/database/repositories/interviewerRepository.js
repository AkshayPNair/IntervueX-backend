"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewerRepository = void 0;
const InterviewerModel_1 = require("../models/InterviewerModel");
const Interviewer_1 = require("../../../domain/entities/Interviewer");
const baseRepository_1 = require("./baseRepository");
function mapDocToInterviewer(doc) {
    return new Interviewer_1.Interviewer(doc.userId.toString(), doc.profilePic, doc.jobTitle, doc.yearsOfExperience, doc.professionalBio, doc.technicalSkills, doc.resume, doc.hourlyRate);
}
class InterviewerRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(InterviewerModel_1.InterviewerModel);
    }
    async createInterviewer(interviewer) {
        await InterviewerModel_1.InterviewerModel.create({
            userId: interviewer.userId,
            profilePic: interviewer.profilePic,
            jobTitle: interviewer.jobTitle,
            yearsOfExperience: interviewer.yearsOfExperience,
            professionalBio: interviewer.professionalBio,
            technicalSkills: interviewer.technicalSkills,
            resume: interviewer.resume,
            hourlyRate: interviewer.hourlyRate,
        });
        return interviewer;
    }
    async createInterviewerProfile(interviewer) {
        const result = await InterviewerModel_1.InterviewerModel.create(interviewer);
        return mapDocToInterviewer(result);
    }
    async findInterviewerById(id) {
        const result = await this.model.findById(id);
        return result ? mapDocToInterviewer(result) : null;
    }
    async findByUserId(userId) {
        const result = await this.model.findOne({ userId });
        return result ? mapDocToInterviewer(result) : null;
    }
    async updateInterviewer(userId, update) {
        await this.model.updateOne({ userId }, { $set: update });
    }
    async updateByUserId(userId, data) {
        const result = await this.model.findOneAndUpdate({ userId }, { $set: data }, { new: true });
        return result ? mapDocToInterviewer(result) : null;
    }
    async deleteByUserId(userId) {
        await this.model.deleteOne({ userId }).exec();
    }
}
exports.InterviewerRepository = InterviewerRepository;
