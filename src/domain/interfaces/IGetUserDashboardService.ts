import { UserDashboardDTO } from "../dtos/dashboard.dto";

export interface IGetUserDashboardService{
    execute(userId:string):Promise<UserDashboardDTO>
}