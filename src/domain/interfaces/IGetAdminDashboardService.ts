import { AdminDashboardDTO } from "../dtos/dashboard.dto";

export interface IGetAdminDashboardService {
    execute(): Promise<AdminDashboardDTO>;
}