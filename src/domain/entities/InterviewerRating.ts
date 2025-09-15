export class InterviewerRating{
    constructor(
        public id:string,
        public bookingId:string,
        public interviewerId:string,
        public userId:string,
        public rating:number,
        public comment?:string,
        public createdAt:Date=new Date()
    ){}
}