export interface ConversationDTO {
    id: string;
    userId: string;
    interviewerId: string;
    userName?:string;
    interviewerName?:string;
    lastMessage: string;
    unreadForUser: number;
    unreadForInterviewer: number;
    createdAt: string;
    updatedAt: string;
}

export interface StartConversationDTO {
    userId: string;
    interviewerId: string;
}