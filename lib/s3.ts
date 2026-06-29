import { S3Client } from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION || 'ap-south-1';

export const s3Client = new S3Client({ region });

export const S3_BUCKET = process.env.UPLOADS_BUCKET_NAME || 'syntheon-uploads';
