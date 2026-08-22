-- Dayflow HRMS - Database Initialization Script
-- Runs automatically when PostgreSQL container is initialized for the first time

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Timezone setting
SET timezone = 'UTC';
