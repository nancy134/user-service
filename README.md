# Build
sudo docker-compose build
sudo docker-compose up

# Migration
npx sequelize db:migrate

# Recreate database
npx sequelize db:drop
npx sequelize db:create
npx sequelize db:migrate

# Port
49161

# Environment variables
DATABASE_URL
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_SQS_NEW_USER_QUEUE
NODE_ENV

# Database Tables
User

# SQS
Listen for new-user message

# API
GET /users (Administrative access)
GET /user/me (User access)
PUT /user/me (User access)

# Run unit tests
nyc npm test
