"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionReminderScheduler = void 0;
const logger_1 = require("../../utils/logger");
class SessionReminderScheduler {
    constructor(_sendSessionRemindersService) {
        this._sendSessionRemindersService = _sendSessionRemindersService;
        this.intervalId = null;
    }
    start() {
        this.tick(); // run immediately
        this.intervalId = setInterval(() => this.tick(), 60 * 1000); // every minute
        logger_1.logger.info('[SessionReminderScheduler] started');
    }
    stop() {
        if (this.intervalId)
            clearInterval(this.intervalId);
        this.intervalId = null;
        logger_1.logger.info('[SessionReminderScheduler] stopped');
    }
    async tick() {
        try {
            const { processed } = await this._sendSessionRemindersService.execute(new Date());
            if (processed > 0) {
                logger_1.logger.info(`[SessionReminderScheduler] processed: ${processed}`);
            }
        }
        catch (e) {
            logger_1.logger.error('[SessionReminderScheduler] tick error', { error: e });
        }
    }
}
exports.SessionReminderScheduler = SessionReminderScheduler;
