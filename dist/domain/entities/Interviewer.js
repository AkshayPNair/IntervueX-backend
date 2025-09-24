"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interviewer = void 0;
class Interviewer {
    constructor(userId, profilePic, jobTitle, yearsOfExperience, professionalBio, technicalSkills, resume, hourlyRate) {
        this.userId = userId;
        this.profilePic = profilePic;
        this.jobTitle = jobTitle;
        this.yearsOfExperience = yearsOfExperience;
        this.professionalBio = professionalBio;
        this.technicalSkills = technicalSkills;
        this.resume = resume;
        this.hourlyRate = hourlyRate;
    }
}
exports.Interviewer = Interviewer;
