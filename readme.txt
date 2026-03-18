=========================================================
  Digital Warranty & Product Tracker
  Cloud Platform Programming - NCI
  Student: Rasool Basha Durbesula (24205478)
=========================================================

OVERVIEW
--------
A cloud-based application that helps users register products,
upload warranty documents, set expiry reminders, and track
service history. Built entirely on AWS serverless services.

AWS SERVICES USED (6)
---------------------
1. S3              - Frontend hosting + warranty document storage
2. DynamoDB        - NoSQL database (products, warranties, service history)
3. Lambda          - Serverless backend (all API handlers)
4. API Gateway     - REST API with Cognito authorizer
5. Cognito         - User authentication (signup/login/JWT)
6. CloudWatch      - Scheduled daily warranty expiry checks + logs

CUSTOM LIBRARY
--------------
Package: warranty-tracker-lib (published to PyPI)
- WarrantyManager: expiry calculation, status classification
- ProductManager: product validation, categorization
- DocumentProcessor: file validation, S3 key generation
- ReminderScheduler: find expiring warranties, generate notifications

TECH STACK
----------
- Frontend:  React 18 + Tailwind CSS (Vite)
- Backend:   Python 3.11 AWS Lambda
- Database:  DynamoDB (3 tables)
- Auth:      AWS Cognito User Pool
- IaC:       Serverless Framework
- CI/CD:     GitHub Actions

PROJECT STRUCTURE
-----------------
Rassol/
  backend/
    handlers/         - Lambda function handlers
      products.py     - Products CRUD
      warranties.py   - Warranties CRUD
      service_history.py - Service history CRUD
      documents.py    - Document upload/download (S3 presigned URLs)
      reminders.py    - Scheduled warranty expiry checker
    utils/            - Shared utilities
      db.py           - DynamoDB helper functions
      auth.py         - Cognito token extraction
      response.py     - API response builders
    serverless.yml    - Infrastructure-as-Code
    requirements.txt  - Python dependencies
  warranty-tracker-lib/
    warranty_tracker/ - Custom PyPI library
      validators.py   - Input validation
      warranty.py     - WarrantyManager class
      product.py      - ProductManager class
      document.py     - DocumentProcessor class
      reminder.py     - ReminderScheduler class
    tests/            - Unit tests
    pyproject.toml    - Package configuration
  frontend/
    src/
      services/       - API and auth service modules
      context/        - React context (AuthContext)
      components/     - Reusable UI components
      pages/          - Application pages
    vite.config.js
    tailwind.config.js
  .github/workflows/
    deploy.yml        - CI/CD pipeline

DEPENDENCIES
------------
Backend:
  - boto3 >= 1.28.0
  - warranty-tracker-lib >= 1.0.0
  - serverless-python-requirements (plugin)

Frontend:
  - react 18
  - react-router-dom
  - axios
  - amazon-cognito-identity-js
  - tailwindcss
  - @heroicons/react
  - react-hot-toast

Library:
  - Python >= 3.9
  - No external runtime dependencies

DEPLOYMENT STEPS
----------------
1. Install Serverless Framework:
   npm install -g serverless

2. Deploy backend:
   cd backend
   npm install
   serverless deploy --stage prod

3. Update frontend config with API URL and Cognito IDs:
   Edit frontend/src/config.js

4. Build and deploy frontend:
   cd frontend
   npm install
   npm run build
   aws s3 sync dist/ s3://<frontend-bucket> --delete

5. Verify deployment is successful.

DEPLOYED URL
------------
http://warranty-tracker-frontend-prod.s3-website-eu-west-1.amazonaws.com
