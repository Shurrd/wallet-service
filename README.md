# 💰 Wallet Management Service

A production-ready wallet management system built with NestJS that provides secure wallet operations, fund transfers, and transaction management with JWT authentication.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Security](#-security)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Production Considerations](#-production-considerations)

## ✨ Features

### Core Functionality

- ✅ **User Authentication** - JWT-based registration and login with bcrypt password hashing
- ✅ **Wallet Operations** - Create, fund, withdraw, and query wallets
- ✅ **Secure Transfers** - Atomic wallet-to-wallet transfers with pessimistic locking
- ✅ **Transaction History** - Complete audit trail with balance tracking
- ✅ **Idempotency** - Prevent duplicate operations using unique keys
- ✅ **Input Validation** - Comprehensive request validation using class-validator
- ✅ **Error Handling** - Meaningful error responses with proper HTTP status codes

### Security Features

- 🔐 JWT token-based authentication
- 🔒 Password hashing with bcrypt (10 salt rounds)
- 🛡️ Route guards protecting wallet endpoints
- 🔑 User-based wallet ownership validation
- 🚫 SQL injection prevention via TypeORM
- 🔍 Input sanitization and validation

### Advanced Features

- 💾 Pessimistic locking for concurrent operations
- 🔄 Database transactions for atomic operations
- 📊 Comprehensive transaction auditing
- 🎯 One wallet per currency per user constraint
- 📝 Auto-generated transaction references
- 🔔 Balance tracking before and after operations

## 🛠️ Technology Stack

| Technology            | Purpose                             |
| --------------------- | ----------------------------------- |
| **NestJS**            | Backend framework with TypeScript   |
| **TypeORM**           | Database ORM with entity management |
| **MySQL**             | Primary relational database         |
| **JWT**               | Secure authentication tokens        |
| **Passport.js**       | Authentication middleware           |
| **bcrypt**            | Password hashing algorithm          |
| **class-validator**   | DTO validation                      |
| **class-transformer** | Object transformation               |
| **Swagger**           | API documentation                   |

## 🏗️ Architecture

### Project Structure

```
src/
├── auth/                           # Authentication module
│   ├── dto/
│   │   ├── register.dto.ts        # Registration validation
│   │   └── login.dto.ts           # Login validation
│   ├── strategies/
│   │   └── jwt.strategy.ts        # JWT validation strategy
│   ├── guards/
│   │   └── jwt-auth.guard.ts      # Route protection
│   ├── decorators/
│   │   └── get-user.decorator.ts  # Extract user from request
│   ├── auth.service.ts            # Auth business logic
│   └── auth.controller.ts         # Auth endpoints
│
├── wallet/                         # Wallet module
│   ├── dto/
│   │   ├── create-wallet.dto.ts   # Wallet creation validation
│   │   ├── fund-wallet.dto.ts     # Funding validation
│   │   ├── transfer.dto.ts        # Transfer validation
│   │   └── withdraw.dto.ts        # Withdrawal validation
│   ├── wallet.service.ts          # Wallet business logic
│   └── wallet.controller.ts       # Wallet endpoints
│
├── entities/                       # Database entities
│   ├── user.entity.ts             # User model
│   ├── wallet.entity.ts           # Wallet model
│   └── transaction.entity.ts      # Transaction model
│
├── common/                         # Shared resources
│   ├── guards/                    # Global guards
│   ├── filters/                   # Exception filters
│   └── decorators/                # Global decorators
│
└── main.ts                        # Application entry point
```

### Entity Relationships

```
User (1) ──────┐ (M) Wallet (1) ──────┐ (M) Transaction
               └──────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MySQL (v8.0 or higher)
- Docker (optional)

### Installation

1. **Clone the repository**

```bash
git clone <https://github.com/Shurrd/wallet-service.git>
cd wallet-service
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=wallet_service

# Application Configuration
APP_PORT=5050
NODE_ENV=development

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION_TIME=24h
```

4. **Setup database**

Create the database:

```sql
CREATE DATABASE wallet_service;
```

Sync the schema:

```bash
npm run typeorm schema:sync
```

5. **Run the application**

Development mode:

```bash
npm run start:dev
```

Production mode:

```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:5050`

## 📚 API Documentation

### Swagger Documentation

Complete API documentation with interactive testing available at:

```
http://localhost:5050/api
```

The Swagger UI provides:

- Full endpoint specifications
- Request/response schemas
- Authentication testing
- Live API playground

---

## 🔒 Security

### Authentication Flow

1. User registers/logs in → receives JWT token
2. Client stores token securely (httpOnly cookie recommended)
3. Client includes token in Authorization header for protected routes
4. Server validates token using JWT strategy
5. Request proceeds if token is valid

### Password Security

- Passwords hashed using bcrypt with 10 salt rounds
- Plain passwords never stored in database
- Password comparison done securely using bcrypt.compare()

### Authorization

- Route guards protect all wallet endpoints
- Users can only access their own wallets
- Ownership validation on every operation

### Manual Testing with Postman

Import the provided Postman collection from `postman/Wallet-Service.postman_collection.json`

**Test Flow:**

1. Register a new user
2. Login and save the access token
3. Create a wallet
4. Fund the wallet
5. Create a second wallet
6. Transfer between wallets
7. Check transaction history

## 🚀 Deployment

### Environment Variables

Production `.env` file:

```

env
DB_HOST=your-db-host
DB_PORT=3306
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=wallet_service_prod
APP_PORT=5050
NODE_ENV=production
JWT_SECRET_KEY=your-very-secure-random-secret
JWT_EXPIRATION_TIME=24h

```

## 📈 Production Considerations

### Scalability

1. **Database Optimization**
   - Add indexes on frequently queried columns
   - Implement connection pooling
   - Use read replicas for read-heavy operations
   - Consider sharding for large-scale deployments

2. **Caching Strategy**
   - Redis for frequently accessed wallet data
   - Cache idempotency keys with TTL
   - Cache user sessions

3. **Monitoring**
   - Setup APM (Application Performance Monitoring)
   - Log aggregation with ELK stack
   - Real-time alerts for errors and performance issues
   - Track transaction metrics

### High Availability

1. **Database**
   - Master-slave replication
   - Automated backups
   - Point-in-time recovery

2. **Application**
   - Multi-region deployment
   - Health checks and auto-scaling
   - Circuit breakers for external services

3. **Security**
   - Rate limiting (e.g., 100 requests/minute per user)
   - DDoS protection
   - Regular security audits
   - Automated vulnerability scanning

### Improvements for Production

1. **Implement Refresh Tokens** - Longer sessions without compromising security
2. **Add Rate Limiting** - Prevent API abuse
3. **Currency Conversion** - Support cross-currency transfers
4. **Webhooks** - Notify external systems on transactions
5. **Admin Dashboard** - Management and monitoring interface
6. **Audit Logging** - Comprehensive activity tracking
7. **2FA** - Two-factor authentication for sensitive operations
8. **Email Notifications** - Transaction alerts
9. **Scheduled Tasks** - Daily balance reports, cleanup jobs
10. **GraphQL API** - Alternative to REST for flexible queries

### Common Error Codes

| Code | Status                | Description                                 |
| ---- | --------------------- | ------------------------------------------- |
| 200  | OK                    | Request successful                          |
| 201  | Created               | Resource created                            |
| 400  | Bad Request           | Invalid input or business logic error       |
| 401  | Unauthorized          | Missing or invalid JWT token                |
| 403  | Forbidden             | User doesn't own the resource               |
| 404  | Not Found             | Wallet or resource not found                |
| 409  | Conflict              | Duplicate entry (username, idempotency key) |
| 500  | Internal Server Error | Unexpected server error                     |

**Built with ❤️ using NestJS**
