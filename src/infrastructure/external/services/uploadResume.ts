import multer from 'multer';
import multerS3 from 'multer-s3-v3';
import { s3 } from '../../aws/s3Client';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

const resumeUpload = multer({
  storage: multerS3({
    s3: s3,
   bucket: process.env.AWS_BUCKET_NAME!,
   key: function (req: Request, file: Express.Multer.File, cb: (error: any, key?: string) => void) {
      const fileName = `resumes/${uuidv4()}-${file.originalname}`;
     cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
   // Allow only PDF and DOC/DOCX files
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
     cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed!'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export { resumeUpload };