import { IInterviewerRepository } from "../../../domain/interfaces/IInterviewerRepository";
import { IGetInterviewerResumeUrlService } from "../../../domain/interfaces/IGetInterviewerResumeUrlService";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../../../infrastructure/aws/s3Client";
import { AppError } from "../../error/AppError";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { ErrorCode } from "../../../application/error/ErrorCode";

export class GetInterviewerResumeUrlUseCase implements IGetInterviewerResumeUrlService {
    constructor(
        private _interviewerRepository: IInterviewerRepository
    ) {}

    async execute(userId: string): Promise<string> {
        try {
            const interviewer = await this._interviewerRepository.findByUserId(userId);
            if (!interviewer || !interviewer.resume) {
                throw new AppError(ErrorCode.NOT_FOUND, "INTERVIEWER_RESUME_NOT_FOUND", HttpStatusCode.NOT_FOUND);
            }

            // Extract the key from the full S3 URL
            const url = new URL(interviewer.resume);
            const key = decodeURIComponent(url.pathname.substring(1));

            const command = new GetObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: key,
            });

            // Generate presigned URL valid for 1 hour
            const signedUrl = await getSignedUrl(s3, command, { expiresIn:  3600});

            return signedUrl;
        } catch (error) {
            throw error;
        }
    }
}