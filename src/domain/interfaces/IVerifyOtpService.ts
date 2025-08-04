import { VerifyOtpDTO } from "../dtos/user.dto";

export interface IVerifyOtpService{
    execute(dto:VerifyOtpDTO):Promise<void>;
}