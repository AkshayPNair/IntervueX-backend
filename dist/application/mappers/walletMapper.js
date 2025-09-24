"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toWalletSummaryDTO = exports.toCreateWalletTransactionDTO = exports.toWalletTransactionDTO = exports.toWalletDTO = void 0;
const toWalletDTO = (wallet) => ({
    id: wallet.id,
    userId: wallet.userId,
    role: wallet.role,
    balance: wallet.balance,
    createdAt: wallet.createdAt,
    updatedAt: wallet.updatedAt
});
exports.toWalletDTO = toWalletDTO;
const toWalletTransactionDTO = (tnx) => ({
    id: tnx.id,
    walletId: tnx.walletId,
    userId: tnx.userId ?? "",
    role: tnx.role,
    type: tnx.type,
    amount: tnx.amount,
    reason: tnx.reason,
    bookingId: tnx.bookingId,
    interviewerFee: tnx.interviewerFee,
    adminFee: tnx.adminFee,
    userName: tnx.userName,
    createdAt: tnx.createdAt
});
exports.toWalletTransactionDTO = toWalletTransactionDTO;
const toCreateWalletTransactionDTO = (data) => ({
    userId: data.userId,
    role: data.role,
    type: data.type,
    amount: data.amount,
    reason: data.reason,
    bookingId: data.bookingId,
    interviewerFee: data.interviewerFee,
    adminFee: data.adminFee,
    userName: data.userName
});
exports.toCreateWalletTransactionDTO = toCreateWalletTransactionDTO;
const toWalletSummaryDTO = (summary) => ({
    balance: summary.balance,
    totalCredits: summary.totalCredits,
    totalDebits: summary.totalDebits
});
exports.toWalletSummaryDTO = toWalletSummaryDTO;
