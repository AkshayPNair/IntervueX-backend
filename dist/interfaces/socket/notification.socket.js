"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerNotifications = registerNotifications;
const notificationGateway_1 = require("./notificationGateway");
const notificationPublisher_1 = require("./notificationPublisher");
function registerNotifications(io) {
    // Initialize gateway
    const gateway = new notificationGateway_1.NotificationGateway(io);
    gateway.register();
    // Bootstrap publisher singleton
    (0, notificationPublisher_1.setNotificationPublisher)(io);
}
