"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCombinedUploads = exports.uploadFields = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("../../utils/cloudinary"));
const s3Client_1 = require("../../infrastructure/aws/s3Client");
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const logger_1 = require("../../utils/logger");
// Configure multer for handling multiple fields
exports.uploadFields = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'profilePic') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            }
            else {
                cb(new Error('Only image files are allowed for profile picture!'));
            }
        }
        else if (file.fieldname === 'resume') {
            if (file.mimetype === 'application/pdf' ||
                file.mimetype === 'application/msword' ||
                file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                cb(null, true);
            }
            else {
                cb(new Error('Only PDF, DOC, and DOCX files are allowed for resume!'));
            }
        }
        else {
            cb(new Error('Invalid field name!'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
}).fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
]);
// Enhanced middleware to handle both Cloudinary and S3 uploads
const handleCombinedUploads = async (req, res, next) => {
    try {
        const uploadPromises = [];
        // Handle profile picture upload to Cloudinary
        if (req.files?.profilePic && req.files.profilePic[0]) {
            const profilePicPromise = new Promise((resolve, reject) => {
                const file = req.files.profilePic[0];
                const uploadStream = cloudinary_1.default.uploader.upload_stream({
                    folder: 'intervuex/images',
                    resource_type: 'image'
                }, (error, result) => {
                    if (error) {
                        reject(new Error(`Profile picture upload failed: ${error.message}`));
                    }
                    else {
                        req.body.profilePic = result.secure_url;
                        resolve();
                    }
                });
                uploadStream.end(file.buffer);
            });
            uploadPromises.push(profilePicPromise);
        }
        // Handle resume upload to S3
        if (req.files?.resume && req.files.resume[0]) {
            const resumePromise = new Promise(async (resolve, reject) => {
                try {
                    const file = req.files.resume[0];
                    const fileName = `resumes/${(0, uuid_1.v4)()}-${file.originalname}`;
                    const uploadParams = {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: fileName,
                        Body: file.buffer,
                        ContentType: file.mimetype,
                    };
                    const command = new client_s3_1.PutObjectCommand(uploadParams);
                    await s3Client_1.s3.send(command);
                    req.body.resume = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
                    resolve();
                }
                catch (error) {
                    reject(new Error(`Resume upload failed: ${error.message}`));
                }
            });
            uploadPromises.push(resumePromise);
        }
        // Wait for all uploads to complete
        if (uploadPromises.length > 0) {
            await Promise.all(uploadPromises);
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Upload error', { error });
        res.status(400).json({
            error: error instanceof Error ? error.message : 'Upload failed',
            code: 'UPLOAD_ERROR'
        });
    }
};
exports.handleCombinedUploads = handleCombinedUploads;
