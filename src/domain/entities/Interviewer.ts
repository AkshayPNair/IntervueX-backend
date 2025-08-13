export class Interviewer {
    constructor(
      public userId: string,
      public profilePic?: string,
      public jobTitle?: string,
      public yearsOfExperience?: number,
      public professionalBio?: string,
      public technicalSkills?: string[],
      public resume?: string,
      public hourlyRate?:number
    ) {}
  }