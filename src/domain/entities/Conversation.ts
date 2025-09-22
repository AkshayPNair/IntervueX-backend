export class Conversation{
    constructor(
        public userId:string,
        public interviewerId:string,
        public lastMessage:string = '',
        public unreadForUser:number = 0,
        public unreadForInterviewer:number = 0,
        public id?:string,
        public createdAt?:Date,
        public updatedAt?:Date
    ){}
}

