"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./interfaces/routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./interfaces/routes/admin.routes"));
const interviewer_routes_1 = __importDefault(require("./interfaces/routes/interviewer.routes"));
const user_routes_1 = __importDefault(require("./interfaces/routes/user.routes"));
const chat_routes_1 = __importDefault(require("./interfaces/routes/chat.routes"));
const compiler_routes_1 = __importDefault(require("./interfaces/routes/compiler.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://dbacb5b29269.ngrok-free.app', 'https://intervuex.akshaypnair.space'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH ', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
}));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: "20mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "20mb" }));
app.use((0, cookie_parser_1.default)());
//Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/interviewer', interviewer_routes_1.default);
app.use('/api/user', user_routes_1.default);
app.use('/api/chat', chat_routes_1.default);
app.use('/api/compiler', compiler_routes_1.default);
// Test endpoint
app.get('/', (_req, res) => {
    res.send(' API is running!');
});
exports.default = app;
