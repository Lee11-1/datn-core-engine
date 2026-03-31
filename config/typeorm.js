require('dotenv').config();
require('reflect-metadata');
const { AppDataSource } = require('./database');

let isInitialized = false;

async function initializeDatabase() {
  if (isInitialized) {
    console.log('✅ TypeORM database connection already initialized');
    return AppDataSource;
  }
  
  try {
    await AppDataSource.initialize();
    isInitialized = true;
    return AppDataSource;
  } catch (error) {
    console.error('❌ Error during TypeORM database initialization:', error);
    throw error;
  }
}

async function closeDatabase() {
  if (!isInitialized) {
    return;
  }

  try {
    await AppDataSource.destroy();
    isInitialized = false;
    console.log('✅ TypeORM database connection closed');
  } catch (error) {
    console.error('❌ Error closing TypeORM database connection:', error);
    throw error;
  }
}

function getRepository(entityName) {
  if (!isInitialized) {
    throw new Error('TypeORM database not initialized. Call initializeDatabase() first');
  }
  return AppDataSource.getRepository(entityName);
}

function getDataSource() {
  if (!isInitialized) {
    throw new Error('TypeORM database not initialized. Call initializeDatabase() first');
  }
  return AppDataSource;
}

function isConnected() {
  return isInitialized && AppDataSource.isInitialized;
}

module.exports = {
  AppDataSource,
  initializeDatabase,
  closeDatabase,
  getRepository,
  getDataSource,
  isConnected,
};
