export interface SubmitFeedbackDTO{
    bookingId:string;
    overallRating: number;
    technicalRating: number;
    communicationRating:number;
    problemSolvingRating:number;
    overallFeedback?:string;
    strengths?:string;
    improvements?:string;
}

export interface FeedbackResponseDTO {
  id: string;
  bookingId: string;
  interviewerId: string;
  userId: string;
  overallRating: number;
  technicalRating: number;
  communicationRating: number;
  problemSolvingRating: number;
  overallFeedback?: string;
  strengths?: string;
  improvements?: string;
  createdAt: Date;
}

export interface SubmitInterviewerFeedbackDTO{
  bookingId:string;
  rating:number;
  comment?:string;
}

export interface InterviewerFeedbackResponseDTO{
  id:string;
  bookingId:string;
  interviewerId:string;
  userId:string;
  rating:number;
  comment?:string;
  createdAt:Date;
}

export interface PaginatedFeedbackResponseDTO {
   data: FeedbackResponseDTO[];
   pagination: {
     currentPage: number;
     totalPages: number;
     totalItems: number;
     limit: number;
   };
 }