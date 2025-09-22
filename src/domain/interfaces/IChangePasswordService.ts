import { ChangePasswordDTO } from "../dtos/user.dto";

export interface IChangePasswordService {
  execute(userId: string, dto: ChangePasswordDTO): Promise<void>;
}