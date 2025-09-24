"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = exports.OtpGenerator = void 0;
const logger_1 = require("../utils/logger");
class OtpGenerator {
    static generate(length = 6) {
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += Math.floor(Math.random() * 10).toString();
        }
        logger_1.logger.info('OTP for verification :', { otp });
        return otp;
    }
}
exports.OtpGenerator = OtpGenerator;
exports.generateOtp = OtpGenerator.generate;
