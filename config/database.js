require('dotenv').config();
const { DataSource } = require('typeorm');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const AWS = require('aws-sdk');
const path = require('path');

const createPostgresConfig = () => {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const isCloudDB = databaseUrl?.match(/(render|railway|neon|supabase)\./) || process.env.DB_SSL === 'true';

  return databaseUrl
    ? { type: 'postgres', url: databaseUrl, ssl: isCloudDB ? { rejectUnauthorized: false } : false }
    : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'sales_management',
        ssl: isCloudDB ? { rejectUnauthorized: false } : false,
      };
};

const entityFiles = [
  'User', 'RefreshToken', 'Zone', 'GeoDataUpdate', 'Warehouse',
  'Category', 'Product', 'Inventory', 'Customer', 'Schedule',
  'SellingSession', 'Order', 'OrderItem', 'Commission', 'ActivityLog'
].map(name => path.join(__dirname, '..', 'models', `${name}.js`));

const AppDataSource = new DataSource({
  ...createPostgresConfig(),
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  entities: entityFiles,
  migrations: [],
  subscribers: [],
  maxQueryExecutionTime: 1000,
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  },
});

mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));


const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: process.env.REDIS_DB || 1,
  password: process.env.REDIS_PASSWORD,
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('ready', () => console.log('✅ Redis ready'));
redis.on('error', err => console.error('❌ Redis error:', err.message));


AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-southeast-1',
});

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  signatureVersion: 'v4',
});

const S3_BUCKET = process.env.S3_BUCKET_NAME;

// S3 Helper functions
const s3Helper = {
  /**
   * Upload file to S3
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - File name
   * @param {string} folder - Folder in S3 (e.g., 'users', 'products')
   * @param {string} contentType - MIME type
   * @returns {Promise<string>} - S3 URL
   */
  async uploadFile(fileBuffer, fileName, folder = 'uploads', contentType = 'application/octet-stream') {
    const key = `${folder}/${Date.now()}-${fileName}`;
    const params = {
      Bucket: S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      ACL: 'public-read',
    };

    const result = await s3.upload(params).promise();
    return result.Location;
  },

  /**
   * Get signed URL for private files
   * @param {string} key - S3 object key
   * @param {number} expires - Expiration time in seconds
   * @returns {string} - Signed URL
   */
  getSignedUrl(key, expires = 3600) {
    return s3.getSignedUrl('getObject', {
      Bucket: S3_BUCKET,
      Key: key,
      Expires: expires,
    });
  },

  /**
   * Delete file from S3
   * @param {string} fileUrl - Full S3 URL or key
   * @returns {Promise<void>}
   */
  async deleteFile(fileUrl) {
    const key = fileUrl.includes('amazonaws.com') 
      ? fileUrl.split('.com/')[1] 
      : fileUrl;

    await s3.deleteObject({
      Bucket: S3_BUCKET,
      Key: key,
    }).promise();
  },

  /**
   * Check if file exists
   * @param {string} key - S3 object key
   * @returns {Promise<boolean>}
   */
  async fileExists(key) {
    try {
      await s3.headObject({ Bucket: S3_BUCKET, Key: key }).promise();
      return true;
    } catch (error) {
      return false;
    }
  },
};

// ============================================================
// Export
// ============================================================
module.exports = {
  AppDataSource,
  mongoose,
  redis,
  s3,
  s3Helper,
  S3_BUCKET,
};
