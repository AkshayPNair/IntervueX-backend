export class Feedback {
    constructor(
        public id: string,
        public bookingId: string,
        public interviewerId: string,
        public userId: string,
        public overallRating: number,
        public technicalRating: number,
        public communicationRating: number,
        public problemSolvingRating: number,
        public overallFeedback?: string,
        public strengths?: string,
        public improvements?: string,
        public createdAt: Date = new Date()
    ) { }
}