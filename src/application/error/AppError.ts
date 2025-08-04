import { ErrorCode } from "./ErrorCode";

export class AppError extends Error{
    constructor(
        public code:ErrorCode,
        message: string,
        public status: number = 400
    ){
        super(message)
        this.name = 'AppError'
    }
}