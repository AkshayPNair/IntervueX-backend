export interface IResendOtpService {
    execute(email: string): Promise<void>;
  }
  