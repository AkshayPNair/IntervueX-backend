"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: 'src/config/.env' });
const logger_1 = require("../../../utils/logger");
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
            debug: true,
        });
    }
    async sendEmail(to, message) {
        const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #4B0082;">IntervueX – OTP Verification</h2>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) for verification is:</p>
        <div style="font-size: 24px; font-weight: bold; color: #333; background: #e8e8e8; padding: 10px 15px; border-radius: 8px; text-align: center;">
          ${message}
        </div>
        <p>This OTP is valid for the next 2 minutes. Please do not share it with anyone.</p>
        <br/>
        <p style="font-size: 14px; color: #888;">– Team IntervueX</p>
      </div>
    `;
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to,
            subject: 'Your OTP Verification Code',
            text: message,
            html: htmlMessage
        };
        try {
            await this.transporter.sendMail(mailOptions);
            logger_1.logger.info(`OTP email sent to ${to}`);
        }
        catch (err) {
            logger_1.logger.error('Error sending OTP email', { error: err });
            throw new Error('Failed to send OTP email');
        }
    }
    async sendApprovalEmail(to, userName) {
        const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 30px; border-radius: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
          <h2 style="color: #e8e8e8; margin: 10px 0; font-size: 24px;">Your Interviewer Application Has Been Approved</h2>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 10px; margin: 20px 0;">
          <p style="font-size: 18px; margin: 0 0 15px 0;">Dear ${userName},</p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
            We are excited to inform you that your interviewer application has been <strong>approved</strong>! 
            Welcome to the IntervueX interviewer community.
          </p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
            You now have full access to all interviewer features and can start conducting interviews on our platform.
          </p>
        </div>

        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #e8e8e8; margin: 0 0 15px 0;">What's Next?</h3>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Log in to your interviewer dashboard</li>
            <li>Complete your profile setup</li>
            <li>Start accepting interview requests</li>
            <li>Explore our interviewer resources and guidelines</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/interviewer/dashboard" 
             style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Access Your Dashboard
          </a>
        </div>

        <p style="font-size: 14px; color: #e8e8e8; text-align: center; margin-top: 30px;">
          If you have any questions, feel free to contact us at 
          <a href="mailto:support@intervuex.com" style="color: #87CEEB;">support@intervuex.com</a>
        </p>
        
        <p style="font-size: 14px; color: #e8e8e8; text-align: center; margin: 20px 0 0 0;">
          – Team IntervueX
        </p>
      </div>
    `;
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to,
            subject: '🎉 Your IntervueX Interviewer Application Has Been Approved!',
            html: htmlMessage
        };
        try {
            await this.transporter.sendMail(mailOptions);
            logger_1.logger.info(`Approval email sent to ${to}`);
        }
        catch (err) {
            logger_1.logger.error('Error sending approval email', { error: err });
            throw new Error('Failed to send approval email');
        }
    }
    async sendRejectionEmail(to, userName, rejectionReason) {
        const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 30px; border-radius: 15px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Application Update</h1>
          <h2 style="color: #ffe8e8; margin: 10px 0; font-size: 24px;">Regarding Your Interviewer Application</h2>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 10px; margin: 20px 0;">
          <p style="font-size: 18px; margin: 0 0 15px 0;">Dear ${userName},</p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
            Thank you for your interest in becoming an interviewer on IntervueX. 
            After careful review, we regret to inform you that your application has not been approved at this time.
          </p>
        </div>

        <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ffcccb;">
          <h3 style="color: #ffe8e8; margin: 0 0 15px 0;">📋 Feedback:</h3>
          <p style="font-size: 16px; line-height: 1.6; margin: 0; background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
            ${rejectionReason}
          </p>
        </div>

        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #ffe8e8; margin: 0 0 15px 0;">💡 What You Can Do:</h3>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Review and address the feedback provided above</li>
            <li>Enhance your profile and qualifications</li>
            <li>Gain additional relevant experience</li>
            <li>Reapply after making the necessary improvements</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/interviewer/verification" 
             style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Submit New Application
          </a>
        </div>

        <p style="font-size: 16px; line-height: 1.6; margin: 20px 0; text-align: center;">
          We encourage you to reapply once you've addressed the feedback. 
          We appreciate your interest in joining our platform and look forward to potentially working with you in the future.
        </p>

        <p style="font-size: 14px; color: #ffe8e8; text-align: center; margin-top: 30px;">
          If you have any questions about this decision or need clarification, please contact us at 
          <a href="mailto:support@intervuex.com" style="color: #ffcccb;">support@intervuex.com</a>
        </p>
        
        <p style="font-size: 14px; color: #ffe8e8; text-align: center; margin: 20px 0 0 0;">
          – Team IntervueX
        </p>
      </div>
    `;
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to,
            subject: 'IntervueX Interviewer Application Update',
            html: htmlMessage
        };
        try {
            await this.transporter.sendMail(mailOptions);
            logger_1.logger.info(`Rejection email sent to ${to}`);
        }
        catch (err) {
            logger_1.logger.error('Error sending rejection email', { error: err });
            throw new Error('Failed to send rejection email');
        }
    }
    async sendSessionReminderEmail(params) {
        const { to, recipientName, counterpartName, date, startTime, minutesLeft, role, joinUrl } = params;
        const subject = `Reminder: Interview starts in ${minutesLeft} minutes`;
        const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 24px; border-radius: 12px; background:#fff;">
        <h2 style="margin:0 0 12px;color:#111">Your interview starts in ${minutesLeft} minutes</h2>
        <p style="margin:0 0 12px;color:#333">Hi ${recipientName},</p>
        <p style="margin:0 0 12px;color:#333">This is a reminder that your session with ${counterpartName} starts at <b>${startTime}</b> on <b>${date}</b>.</p>
        <p style="margin:16px 0 0;color:#555">Role: ${role}</p>
        <p style="margin:8px 0 0;color:#777;font-size:12px">Please ensure your internet, microphone, and camera are working.</p>
        <p style="margin:16px 0 0;color:#999;font-size:12px">– Team IntervueX</p>
      </div>
    `;
        try {
            await this.transporter.sendMail({ from: process.env.EMAIL_USERNAME, to, subject, html: htmlMessage });
            logger_1.logger.info(`Reminder (${minutesLeft}m) email sent to ${to}`);
        }
        catch (err) {
            logger_1.logger.error('Error sending session reminder email', { error: err });
            throw new Error('Failed to send session reminder email');
        }
    }
}
exports.EmailService = EmailService;
