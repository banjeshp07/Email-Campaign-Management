# Email Campaign Management API

A robust REST API built with Node.js, Express, and Sequelize ORM (MySQL) for managing email campaigns, adding recipients, scheduling, simulating dispatches, and tracking real-time statistics. It includes secure JWT-based authentication and automated testing support.

---

## Tech Stack
* Runtime: Node.js
* Framework: Express.js
* Database: MySQL
* ORM: Sequelize
* Testing: Jest & Supertest
* Security: bcryptjs & JSON Web Tokens (JWT)

---

## Project Structure
email-campaign-management/
├── src/
│   ├── config/          # Database configuration and connection
│   ├── controllers/     # Application business logic (Auth & Campaigns)
│   ├── middlewares/     # Auth verification and global error handling
│   ├── models/          # Sequelize Models (Campaign, Recipient, User)
│   ├── routes/          # API route endpoints
│   └── app.js           # Main application entry point
├── tests/               # Automated test suites
├── schema.sql           # Database schema & manual migration reference
├── .env.example         # Sample environment variables file
├── postman_collection.json # Postman collection for API testing
└── package.json

---

## Setup & Installation Instructions

1. Clone the repository:
   git clone https://github.com/banjeshp07/Email-Campaign-Management
   cd email-campaign-management

2. Install dependencies:
   npm install

3. Configure Environment Variables:
   Create a .env file in the root directory and update it with your configuration (use .env.example as a reference):
   
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=email_campaigns
   JWT_SECRET=your_jwt_secret_key

4. Initialize Database & Start Application:
   * The application uses Sequelize sync, so running npm start will automatically create the required tables (users, campaigns, recipients).
   * Alternatively, you can run the SQL script provided in schema.sql inside your MySQL Workbench.
   
   npm start

---

## Running Automated Tests

To run the automated Jest test suite and verify core business logic:
npm test

---

## Authentication Instructions

Protected routes require a valid JWT token. Follow these steps to authenticate:
1. Register a User: POST /api/campaigns/register (Body: username, password)
2. Login: POST /api/campaigns/login (Body: username, password) to receive a JWT token.
3. Authorize Requests: Pass the token in the headers of protected requests:
   * Header Key: Authorization
   * Header Value: Bearer <your_jwt_token>

---

## API Endpoints Documentation

### Auth Routes (Public)
* POST /api/campaigns/register - Register a new user
* POST /api/campaigns/login - Authenticate and receive a JWT token

### Campaign Routes (Protected - Requires Bearer Token)
* POST /api/campaigns - Create a new campaign (Default status: draft)
* POST /api/campaigns/:campaignId/recipients - Add multiple recipients with email validation & duplicate protection
* POST /api/campaigns/:campaignId/schedule - Schedule a draft campaign (Validates future time & recipient count)
* POST /api/campaigns/process - Background simulation process for scheduled campaign deliveries
* GET /api/campaigns - List campaigns with support for pagination, status filtering, and name search
* GET /api/campaigns/:campaignId - Retrieve details of a specific campaign
* GET /api/campaigns/:campaignId/statistics - Fetch real-time delivery statistics and recipient counts

---

## Design Choices & Assumptions
* ORM Strategy: Utilized Sequelize ORM to maintain clean, object-oriented data modeling while bundling a schema.sql file to satisfy manual database migration requirements.
* Data Integrity & Concurrency: Implemented unique database constraints and checks to intrinsically prevent duplicate recipients within the same campaign safely across concurrent requests.
* Simulation Mechanics: Designed the processing endpoint to simulate asynchronous email dispatch, randomly allocating delivered or failed statuses before transitioning campaigns to a completed state.
* Security: Secured all core campaign management endpoints using JSON Web Tokens (JWT) to ensure authorized access.

## Production Improvements
If scaling this application for production use:
1. Queueing System: Replace the HTTP-polling process endpoint with a robust message broker like Redis + BullMQ for true background queueing.
2. Real SMTP Transmission: Integrate Nodemailer with services like AWS SES or SendGrid for real-world email delivery instead of simulation.
3. Database Indexing: Add composite indexing on high-traffic filter and search columns to enhance performance at scale.