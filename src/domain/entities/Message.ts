export class Message{
    constructor(
        public conversationId:string,
        public senderId:string,
        public recipientId:string,
        public text:string,
        public readAt:Date|null=null,
        public id?:string,
        public createdAt?:Date,
        public updatedAt?:Date
    ){}
}