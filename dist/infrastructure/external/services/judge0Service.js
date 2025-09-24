"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Judge0Service = void 0;
const axios_1 = __importStar(require("axios"));
class Judge0Service {
    constructor() {
        const baseUrl = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
        const apiKey = process.env.JUDGE0_KEY;
        const apiHost = process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com';
        const headers = { 'Content-Type': 'application/json' };
        if (apiKey) {
            headers['X-RapidAPI-Key'] = apiKey;
        }
        if (apiHost) {
            headers['X-RapidAPI-Host'] = apiHost;
        }
        this._client = axios_1.default.create({
            baseURL: baseUrl,
            headers,
            timeout: 30000,
        });
    }
    async runCode(payload) {
        try {
            //create submission
            const createResponse = await this._client.post('/submissions', {
                source_code: payload.source,
                language_id: payload.languageId,
                stdin: payload.stdin ?? '',
                cpu_time_limit: payload.cpuTimeLimit ?? 3,
                memory_limit: payload.memoryLimit ?? 128000,
            }, { params: { base64_encoded: false, wait: false } });
            const { token } = createResponse.data;
            // Poll for result
            for (;;) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const resultResponse = await this._client.get(`/submissions/${token}`, {
                    params: { base64_encoded: false },
                });
                const data = resultResponse.data;
                if (data.status && data.status.id >= 3) {
                    return data;
                }
            }
        }
        catch (error) {
            if ((0, axios_1.isAxiosError)(error)) {
                const status = error.response?.status ?? 'Unknown';
                const data = error.response?.data ?? error.message;
                throw new Error(`Judge0 request failed: ${status} ${JSON.stringify(data)}`);
            }
            throw error;
        }
    }
    async listLanguages() {
        try {
            const res = await this._client.get('/languages');
            return Array.isArray(res.data) ? res.data : [];
        }
        catch (error) {
            if ((0, axios_1.isAxiosError)(error)) {
                const status = error.response?.status ?? 'Unknown';
                const data = error.response?.data ?? error.message;
                throw new Error(`Judge0 request failed: ${status} ${JSON.stringify(data)}`);
            }
            throw error;
        }
    }
}
exports.Judge0Service = Judge0Service;
