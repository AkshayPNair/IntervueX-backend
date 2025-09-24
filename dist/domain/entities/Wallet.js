"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletTransaction = exports.Wallet = void 0;
class Wallet {
    constructor(id, userId, role, balance, createdAt = new Date(), updatedAt = new Date()) {
        this.id = id;
        this.userId = userId;
        this.role = role;
        this.balance = balance;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.Wallet = Wallet;
class WalletTransaction {
    constructor(id, walletId, userId, role, type, amount, reason, bookingId, interviewerFee, adminFee, userName, createdAt = new Date()) {
        this.id = id;
        this.walletId = walletId;
        this.userId = userId;
        this.role = role;
        this.type = type;
        this.amount = amount;
        this.reason = reason;
        this.bookingId = bookingId;
        this.interviewerFee = interviewerFee;
        this.adminFee = adminFee;
        this.userName = userName;
        this.createdAt = createdAt;
    }
}
exports.WalletTransaction = WalletTransaction;
