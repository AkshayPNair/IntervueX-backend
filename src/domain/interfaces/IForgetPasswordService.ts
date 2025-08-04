import { ForgetPasswordDTO } from "../dtos/user.dto";

export interface IForgetPasswordService {
	execute(dto: ForgetPasswordDTO): Promise<void>;
}