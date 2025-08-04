declare module 'multer-s3-v3' {
    import { S3Client } from '@aws-sdk/client-s3';
    import { Request } from 'express';
    import { StorageEngine } from 'multer';
  
    interface MulterS3Options {
      s3: S3Client;
      bucket: string | ((req: Request, file: Express.Multer.File, callback: (error: any, bucket?: string) => void) => void);
      key?: (req: Request, file: Express.Multer.File, callback: (error: any, key?: string) => void) => void;
      acl?: string | ((req: Request, file: Express.Multer.File, callback: (error: any, acl?: string) => void) => void);
      contentType?: any;
      contentDisposition?: string | ((req: Request, file: Express.Multer.File, callback: (error: any, contentDisposition?: string) => void) => void);
      contentEncoding?: string | ((req: Request, file: Express.Multer.File, callback: (error: any, contentEncoding?: string) => void) => void);
      metadata?: (req: Request, file: Express.Multer.File, callback: (error: any, metadata?: any) => void) => void;
      cacheControl?: string | ((req: Request, file: Express.Multer.File, callback: (error: any, cacheControl?: string) => void) => void);
      serverSideEncryption?: string;
      storageClass?: string;
    }
  
    function multerS3(options: MulterS3Options): StorageEngine;
  
    namespace multerS3 {
      const AUTO_CONTENT_TYPE: any;
      const DEFAULT_CONTENT_TYPE: any;
    }
  
    export = multerS3;
  }