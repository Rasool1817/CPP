# Warranty Tracker - Cloud Platform Programming

A cloud-native warranty and product tracking application built on AWS serverless architecture.

## Overview

This application enables users to register products, manage warranty information, upload supporting documents, track service history, and receive automated reminders for expiring warranties. Built entirely on Amazon Web Services using a serverless architecture.

## AWS Services Used (6)

| Service | Purpose |
|---------|---------|
| AWS Lambda | Serverless compute for 13 API handlers (Python 3.11) |
| Amazon DynamoDB | NoSQL database (Products, Warranties, Service History) |
| Amazon S3 | Frontend static website hosting + document storage |
| Amazon API Gateway | REST API routing with Cognito authorizer |
| Amazon Cognito | User authentication (signup, login, JWT tokens) |
| Amazon CloudWatch | Logging + daily scheduled warranty expiry checks |

## Tech Stack

- **Frontend:** React 18, Tailwind CSS, Vite, React Router, Axios
- **Backend:** Python 3.11, AWS Lambda, Serverless Framework
- **Database:** DynamoDB (3 tables with GSIs)
- **Auth:** Amazon Cognito User Pool
- **CI/CD:** GitHub Actions (test → deploy backend → deploy frontend)
- **Library:** Custom Python package `warranty-tracker-nci` (PyPI)

## Project Structure

```
├── backend/
│   ├── handlers/          # Lambda function handlers
│   │   ├── products.py    # Products CRUD
│   │   ├── warranties.py  # Warranties CRUD
│   │   ├── service_history.py
│   │   ├── documents.py   # S3 presigned URL operations
│   │   └── reminders.py   # Scheduled warranty expiry checks
│   ├── utils/             # Shared utilities (db, auth, response)
│   └── serverless.yml     # Infrastructure as Code
├── frontend/
│   └── src/
│       ├── pages/         # 11 page components
│       ├── components/    # 5 reusable UI components
│       ├── services/      # API client and auth service
│       └── context/       # React AuthContext
├── warranty-tracker-lib/  # Custom PyPI library
│   ├── warranty_tracker/  # Core business logic
│   └── tests/             # Unit tests
├── doc/
│   └── main.tex           # LaTeX project report
└── .github/workflows/
    └── deploy.yml         # CI/CD pipeline
```

## CI/CD Pipeline

The GitHub Actions pipeline runs automatically on every push to `main`:

1. **Test Library** - Runs pytest on the custom library
2. **Deploy Backend** - Deploys Lambda functions via Serverless Framework
3. **Deploy Frontend** - Builds React app and syncs to S3

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |

> The pipeline automatically extracts API_URL, Cognito User Pool ID, and Client ID from CloudFormation outputs after backend deployment.

## Local Development

1. Copy `.env.example` to `.env` and fill in your AWS credentials
2. Backend: `cd backend && npm install && npx serverless deploy --stage dev`
3. Frontend: `cd frontend && npm install && npm run dev`

## Author

Rasool Basha Durbesula (x24205478) - MSc Cloud Computing, National College of Ireland
