import { ResetPasswordDTO } from "../dtos/user.dto";

export interface IResetPasswordService{
    execute(dto:ResetPasswordDTO):Promise<void>;
}