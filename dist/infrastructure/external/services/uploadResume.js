"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_s3_v3_1 = __importDefault(require("multer-s3-v3"));
const s3Client_1 = require("../../aws/s3Client");
const uuid_1 = require("uuid");
const resumeUpload = (0, multer_1.default)({
    storage: (0, multer_s3_v3_1.default)({
        s3: s3Client_1.s3,
        bucket: process.env.AWS_BUCKET_NAME,
        key: function (req, file, cb) {
            const fileName = `resumes/${(0, uuid_1.v4)()}-${file.originalname}`;
            cb(null, fileName);
        },
        contentType: multer_s3_v3_1.default.AUTO_CONTENT_TYPE,
    }),
    fileFilter: (req, file, cb) => {
        // Allow only PDF and DOC/DOCX files
        if (file.mimetype === 'application/pdf' ||
            file.mimetype === 'application/msword' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF, DOC, and DOCX files are allowed!'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
exports.resumeUpload = resumeUpload;
