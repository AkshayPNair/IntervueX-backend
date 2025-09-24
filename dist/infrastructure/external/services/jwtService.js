"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signJwt = signJwt;
exports.verifyJwt = verifyJwt;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function signJwt(payload, role) {
    const secret = getSecretByRole(role);
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '7d' });
}
function verifyJwt(token, role) {
    const secret = getSecretByRole(role);
    return jsonwebtoken_1.default.verify(token, secret);
}
function getSecretByRole(role) {
    switch (role) {
        case 'admin':
            return process.env.ADMIN_JWT_SECRET;
        case 'interviewer':
            return process.env.INTERVIEWER_JWT_SECRET;
        case 'user':
            return process.env.USER_JWT_SECRET;
        default:
            return process.env.USER_JWT_SECRET;
    }
}
