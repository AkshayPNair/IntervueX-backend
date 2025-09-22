import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import cloudinary from '../../utils/cloudinary';
import { s3 } from '../../infrastructure/aws/s3Client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';

// Configure multer for handling multiple fields
export const uploadFields = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profilePic') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for profile picture!'));
      }
    } else if (file.fieldname === 'resume') {
      if (file.mimetype === 'application/pdf' || 
          file.mimetype === 'application/msword' || 
          file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF, DOC, and DOCX files are allowed for resume!'));
      }
    } else {
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
export const handleCombinedUploads = async (req: any, res: Response, next: NextFunction) => {
  try {
    const uploadPromises: Promise<void>[] = [];

    // Handle profile picture upload to Cloudinary
    if (req.files?.profilePic && req.files.profilePic[0]) {
      const profilePicPromise = new Promise<void>((resolve, reject) => {
        const file = req.files.profilePic[0];
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            folder: 'intervuex/images',
            resource_type: 'image'
          },
          (error: any, result: any) => {
            if (error) {
              reject(new Error(`Profile picture upload failed: ${error.message}`));
            } else {
              req.body.profilePic = result.secure_url;
              resolve();
            }
          }
        );
        uploadStream.end(file.buffer);       
      });
      uploadPromises.push(profilePicPromise);
    }

    // Handle resume upload to S3
     if (req.files?.resume && req.files.resume[0]) {
      const resumePromise = new Promise<void>(async (resolve, reject) => {
        try {
          const file = req.files.resume[0];
          const fileName = `resumes/${uuidv4()}-${file.originalname}`;
          
          const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
          };
          
          const command = new PutObjectCommand(uploadParams);
          await s3.send(command);
          
          req.body.resume = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
          resolve();
        } catch (error: any) {
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
  } catch (error) {
    logger.error('Upload error', { error });
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Upload failed',
      code: 'UPLOAD_ERROR'
    });
  }
};