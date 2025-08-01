# ⚡ QuiCash - A Digital Wallet Management System

A minimal RESTful API for a Digital Wallet management system similar to services like **Bkash**. Built using **Express** on Node, and powered by **MongoDB** with **Mongoose ORM** for the database.

📍 **Live API**: [https://quicash-digitalwallet-express.onrender.com/](https://quicash-digitalwallet-express.onrender.com/)

**(NOTE: Please be patient when visiting, it may take a little bit of time to spin up the live server since it's on free tier on render.com)**

---

## Features

- JWT Based Authentication and Role based Authorization
- Role Based Acces Control. Roles being `admin`, `agent`, `user`
- Secure credential handling through hashing
- Agent based `cash-in`, `cash-out` system similar to **Bkash**
- Users can:
  - Cash in through agents
  - Cash out by invoking an agent.
  - Send money to another user
  - View transaction history
  - Change some of their profile info
- Agents can:
  - Add money to any user's wallet (cash-in)
  - Withdraw money from any user's wallet (cash-out)
  - View their commission history
- Admins can:
  - View all users, agents, wallets and transactions
  - Edit any user profile and set roles
  - Freeze/unfreeze any wallets
  - Activate/Deactivate agents or user accounts
- Wallets can be in either `frozen` or `active` status (can be configured by admin)
- User accounts (all) can be in either `active` or `inactive` status (also can be configured by admin)
- Frozen wallets or inactive accounts can't be involved in a transaction
- Centralized error handling, 404 error handling, and validation using **Zod**
- Organized architecture (controllers, routes, models, middlewares) through MVC architecture
- MongoDB integration with Mongoose
- Built with Node.js compatibility (tsx package used for node)

---

## Setup Instructions

### Prerequisites

- Node.js or Bun or any other runtime
- MongoDB connection string
- `.env` file, must be placed on the root directory
- An example env file `.env.example` has been provided for reference, which must be followed accordingly

### `.env` Format

_Exactly as the `env.example` file_

### Install Dependencies

```bash
pnpm install
```

> Or if using npm:
>
> ```bash
> npm install
> ```

### Run the Server (Development)

```bash
pnpm dev
```

Or (for Node.js/npm, start command will run the whole server with tsx) :

```bash
pnpm start
```

> Or if using npm:
>
> ```bash
> npm run start
> ```

---

## Tech Stack

| Category  | Tools                                             |
| --------- | ------------------------------------------------- |
| Framework | Express.js                                        |
| Language  | TypeScript                                        |
| Database  | MongoDB + Mongoose                                |
| Security  | jwt, bcrypt, jose                                 |
| Others    | cors, cookie-parser, zod, dotenv, t3-oss/env, tsx |

---

## Project Structure

```
quicash-digitalwallet-express/
├── src/
│   ├── config/
│   ├── middlewares/
│   ├── modules/
│   ├── Router/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── types/
│   └── express/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── README.md
├── tsconfig.json
└── vercel.json

```

---

## Postman Testing

### Postman collection Url

[Public Collection Link](https://www.postman.com/satellite-geoscientist-57844122/workspace/my-workspace/collection/46058752-e1995072-75a6-4f6c-bbb6-a668352ec00b?action=share&creator=46058752&active-environment=46058752-c05c1bd1-2b2f-4f8b-8d55-de1e7e42eadf)

#### Also, The Postman Collection can be imported from the included file `postman.json`

#### Istructions (Please follow carefully)

- First, set the {{base_url}} to `https://quicash-digitalwallet-express.onrender.com`
- Then after signing in with credentials, on each request, include the Bearer Token as the Authorization Header of the request of `Postman` in the format `Bearer ${token_here}`
- The Authorization Header should look like `Bearer auth-jwt-token-here`
- The token can also be set as a postman variable within {{vault:json-web-token}}

#### Test Admin Credential

```json
{
  "phoneNumber": "01755555555",
  "password": "admin_password"
}
```

---

## API Endpoints

## Auth Endpoints

### Sign In

- `POST /api/v1/auth/sign-in` – Sign In a user

#### Request:

```json
{
  "phoneNumber": "01711111111",
  "password": "User Password here"
}
```

#### Response:

```json
{
  "message": "Signed In succesfully",
  "statusCode": 200,
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### Sign Up

- `POST /api/v1/auth/sign-up` – Sign Up a user

#### Request:

```json
{
  "firstName": "Shawn",
  "lastName": "Krisper",
  "email": "shawn@mail.com",
  "phoneNumber": "01722222222",
  "password": "Password Here"
}
```

#### Response:

```json
{
  "message": "Signed Up succesfully",
  "statusCode": 200,
  "data": {
    "_id": "688a387c01a606c167f4aae3",
    "email": "shawn@mail.com",
    "firstName": "Shawn",
    "lastName": "Crisper",
    "phoneNumber": "01722222222",
    "role": "user",
    "createdAt": "2025-07-30T15:21:32.076Z",
    "updatedAt": "2025-07-30T15:21:32.076Z",
    "accountStatus": "active"
  }
}
```

### Seed Super user

- `POST /api/v1/auth/create-super-user` – Create a super user (admin) from provided creds from env

### Refresh

- `POST /api/v1/auth/refresh` – Generate new Tokens

## User Endpoints

### Get user By ID

- `GET /api/v1/user/:id` – Get user info from id
- A user can fetch his own info, but Admin can fetch anyone's information

#### Response:

```json
{
  "message": "Information retrived succesfully",
  "statusCode": 200,
  "data": {
    "_id": "688a387c01a606c167f4aae3",
    "email": "towhidkarim123@gmail.com",
    "firstName": "Towhid",
    "lastName": "Karim",
    "phoneNumber": "01744161517",
    "role": "admin",
    "createdAt": "2025-07-30T15:21:32.076Z",
    "updatedAt": "2025-07-30T15:21:32.076Z",
    "accountStatus": "active"
  }
}
```

### Get All Users (admin restricted route)

- `GET /api/v1/user/get-all?skip=0&sortBy=createdAt&sortOrder=asc` – Get a list of all users with sorting and pagination
- Only admins can access this route

#### Response:

```json
{
    "message": "Information retrived succesfully",
    "statusCode": 200,
    "data": [
        {
            "_id": "688a387c01a606c167f4aae3",
            "email": "towhidkarim123@gmail.com",
            "firstName": "Towhid",
            "lastName": "Karim",
            "phoneNumber": "01744161517",
            "role": "admin",
            "createdAt": "2025-07-30T15:21:32.076Z",
            "updatedAt": "2025-07-30T15:21:32.076Z",
            "accountStatus": "active"
        },
        {...},
        {...}
    ]
}
```

### Update User

- `PATCH /api/v1/user/update/:userId` – Update user information by id
- Can be called by an user for himself or by admin for any id

#### Request:

```json
{
  "firstName": "Fname"
}
```

#### Response:

```json
{
    "message": "Information Updated Succesfully",
    "statusCode": 200,
    "data": {
        "firstName": "Fname",
        {...rest}
    }
}
```

### Set Account Status (admin only route)

- `PATCH /api/v1/user/set-account-status` – Set a user acount status to targert user (active/inactive)

#### Request:

```json
{
  "statusToSet": "active",
  "targetAccountPhoneNumber": "01711111111"
}
```

#### Response:

```json
{
    "message": "Account status updated successfully",
    "statusCode": 200,
    "data": {
        "accountStatus": "active",
        {...rest}
    }
}
```

### Set User Role (admin only route)

- `PATCH /api/v1/user/set-user-role` – Set a specified role to targert user (`agent` | `admin` | `user`)

#### Request:

```json
{
  "roleToSet": "agent",
  "targetAccountPhoneNumber": "01722222222"
}
```

#### Response:

```json
{
    "message": "Account status updated successfully",
    "statusCode": 200,
    "data": {
        "role": "agent",
        {...rest}
    }
}
```

## Wallet Endpoints

### Get Wallet by User ID

- `GET /api/v1/wallet/by-user-id/:userId` Get wallet data by ID
- User can access their own wallets. Admins can access any.

#### Response

```json
{
  "message": "Wallet information retrived succesfully",
  "statusCode": 200,
  "data": {
    "_id": "688a387c01a606c167f4aae5",
    "walletOwnerId": "688a387c01a606c167f4aae3",
    "walletStatus": "active",
    "balance": 1039.9,
    "createdAt": "2025-07-30T15:21:32.157Z",
    "updatedAt": "2025-07-31T20:53:45.288Z"
  }
}
```

### Get Wallet by Phone Number

- `GET /api/v1/wallet/by-user-phone-number/:phoneNumber` Get wallet data by ID
- User can access their own wallets. Admins can access any.
- Convenient since phone number is a unique identifier as well

#### Response

```json
{
  "message": "Wallet information retrived succesfully",
  "statusCode": 200,
  "data": {
    "_id": "688a387c01a606c167f4aae5",
    "walletOwnerId": "688a387c01a606c167f4aae3",
    "walletStatus": "active",
    "balance": 1039.9,
    "createdAt": "2025-07-30T15:21:32.157Z",
    "updatedAt": "2025-07-31T20:53:45.288Z"
  }
}
```

### Get All Wallets (Admin only route)

- `GET /api/v1/wallet/get-all?skip=0&sortBy=createdAt` Get all wallets with sorting and pagination support
- Admins access only.

#### Response

```json
{
    "message": "All Wallet information retrived succesfully",
    "statusCode": 200,
    "data": [
        {
            "_id": "688a632af4157df7748848b1",
            "walletOwnerId": "688a632af4157df7748848af",
            "walletStatus": "active",
            "balance": 1542,
            "createdAt": "2025-07-30T18:23:38.844Z",
            "updatedAt": "2025-07-31T20:53:45.295Z"
        },
        ...{rest}
    ]
}
```

### Set Wallet Status (Admin only route)

- `PATCH /api/v1/wallet/set-wallet-status` Set wallet status to `frozen` or `active`
- Admins access only.

#### Request

```json
{
  "walletStatus": "active", //or "frozen"
  "targetWalletOwnerId": "688a387c01a606c167f4aae3"
}
```

#### Response

```json
{
  "message": "Wallet status updated to active successfully",
  "statusCode": 200,
  "data": {
    "_id": "688a387c01a606c167f4aae5",
    "walletOwnerId": "688a387c01a606c167f4aae3",
    "walletStatus": "active",
    "balance": 1039.9,
    "createdAt": "2025-07-30T15:21:32.157Z",
    "updatedAt": "2025-08-01T05:47:20.097Z"
  }
}
```

## Transaction Endpoints

### Send Money (user to user send money)

- `POST /api/v1/transaction/send-money` Send money to any user
- Even agents can access, for convenience. Admins can also do so for testing and other purpose

#### Request

```json
{
  "recipientPhoneNumber": "01711111111",
  "amount": 20
}
```

#### Response

```json
{
  "message": "Money sent successfully",
  "statusCode": 201,
  "data": [
    {
      "amount": 20,
      "initiatorName": "Towhid Karim",
      "recipientName": "John Doe",
      "initiatorId": "688a387c01a606c167f4aae3",
      "recipientId": "688a632af4157df7748848af",
      "transactionType": "sendMoney",
      "transactionStatus": "succesful",
      "_id": "688c5734a55a1bd6ac1e1bfa",
      "createdAt": "2025-08-01T05:57:08.205Z",
      "updatedAt": "2025-08-01T05:57:08.205Z"
    }
  ]
}
```

### Cash in (Agents and admin only route)

- `POST /api/v1/transaction/cash-in` Cash in to a user account
- Agents can access. Admins can also do so for testing and other purpose. User can't access this route

#### Request

```json
{
  "recipientPhoneNumber": "01711111111",
  "amount": 100
}
```

#### Response

```json
{
  "message": "Money cashed in successfully",
  "statusCode": 201,
  "data": [
    {
      "amount": 100,
      "initiatorName": "Shawn Krisper",
      "recipientName": "John Doe",
      "initiatorId": "688b7181510f16f8fcc8f475",
      "recipientId": "688a632af4157df7748848af",
      "transactionType": "cashIn",
      "transactionStatus": "succesful",
      "_id": "688c5807a55a1bd6ac1e1c02",
      "createdAt": "2025-08-01T06:00:39.798Z",
      "updatedAt": "2025-08-01T06:00:39.798Z"
    }
  ]
}
```

### Cash out (Cash out endpoint for regular user)

- `POST /api/v1/transaction/cash-out` Cash out through an agent
- Users can access. Admins can also do so for testing and other purpose. Agents can't access this route

#### Request

```json
{
  "recipientPhoneNumber": "01722222222",
  "amount": 50
}
```

#### Response

```json
{
  "message": "Money cashed out successfully",
  "statusCode": 201,
  "data": [
    {
      "amount": 50,
      "initiatorName": "John Doe",
      "recipientName": "Shawn Krisper",
      "initiatorId": "688a632af4157df7748848af",
      "recipientId": "688b7181510f16f8fcc8f475",
      "transactionType": "cashOut",
      "transactionStatus": "succesful",
      "_id": "688c5a3fa55a1bd6ac1e1c17",
      "createdAt": "2025-08-01T06:10:07.040Z",
      "updatedAt": "2025-08-01T06:10:07.040Z"
    }
  ]
}
```

### Add Money Admin (Admin only route)

- `POST /api/v1/transaction/add-money-admin` Admin route for adding money to literally any account
- Admins can also deduct money through negative values (only admins can do this negative operation)

#### Request

```json
{
  "recipientPhoneNumber": "01711111111",
  "amount": 500
}
```

#### Response

```json
{
  "message": "Money added by admin successfully",
  "statusCode": 201,
  "data": [
    {
      "amount": 500,
      "initiatorName": "Towhid Karim",
      "recipientName": "John Doe",
      "initiatorId": "688a387c01a606c167f4aae3",
      "recipientId": "688a632af4157df7748848af",
      "transactionType": "addMoneyAdmin",
      "transactionStatus": "succesful",
      "_id": "688c5ab1a55a1bd6ac1e1c1f",
      "createdAt": "2025-08-01T06:12:01.975Z",
      "updatedAt": "2025-08-01T06:12:01.975Z"
    }
  ]
}
```

### Get a Transaction by ID

- `GET /api/v1/transaction/:id` Fetch transaction info though transaction ID

#### Response

```json
{
  "message": "Transactions retrieved successfully",
  "statusCode": 200,
  "data": {
    "_id": "688c5ab1a55a1bd6ac1e1c1f",
    "amount": 500,
    "initiatorName": "Towhid Karim",
    "recipientName": "John Doe",
    "initiatorId": "688a387c01a606c167f4aae3",
    "recipientId": "688a632af4157df7748848af",
    "transactionType": "addMoneyAdmin",
    "transactionStatus": "succesful",
    "createdAt": "2025-08-01T06:12:01.975Z",
    "updatedAt": "2025-08-01T06:12:01.975Z"
  }
}
```

### Get Transactions by user ID (Transaction History)

- `GET /api/v1/transaction/by-user-id/:id` Fetch transactions info though user ID
- User can access their own history. Admin can access anyones

#### Response

```json
{
    "message": "Transactions retrieved successfully",
    "statusCode": 200,
    "data": [
        {
            "_id": "688a6adcd4aa368cf84eee44",
            "amount": 5,
            "initiatorName": "Towhid Karim",
            "recipientName": "John Doe",
            "initiatorId": "688a387c01a606c167f4aae3",
            "recipientId": "688a632af4157df7748848af",
            "transactionType": "sendMoney",
            "transactionStatus": "succesful",
            "createdAt": "2025-07-30T18:56:28.800Z",
            "updatedAt": "2025-07-30T18:56:28.800Z"
        },
        {
            "_id": "688b87a02df7fd141949e2f2",
            "amount": 500,
            "initiatorName": "Towhid Karim",
            "recipientName": "John Doe",
            "initiatorId": "688a387c01a606c167f4aae3",
            "recipientId": "688a632af4157df7748848af",
            "transactionType": "addMoneyAdmin",
            "transactionStatus": "succesful",
            "createdAt": "2025-07-31T15:11:28.479Z",
            "updatedAt": "2025-07-31T15:11:28.479Z"
        },
        ...{rest}
    ]
}
```

### Get All Transactions (Admin only)

- `GET /api/v1/transaction/get-all` Get all transactions
- Admin only route with pagination and sorting

#### Response

```json
{
    "message": "All transaction information retrived succesfully",
    "statusCode": 200,
    "data": [
        {
            "_id": "688c5ab1a55a1bd6ac1e1c1f",
            "amount": 500,
            "initiatorName": "Towhid Karim",
            "recipientName": "John Doe",
            "initiatorId": "688a387c01a606c167f4aae3",
            "recipientId": "688a632af4157df7748848af",
            "transactionType": "addMoneyAdmin",
            "transactionStatus": "succesful",
            "createdAt": "2025-08-01T06:12:01.975Z",
            "updatedAt": "2025-08-01T06:12:01.975Z"
        },
        ...{rest}
    ]
}
```

### Get All Transactions (Admin and agent only)

- `GET /api/v1/transaction/agent/commissions/:agentId` Get a list of commissions for a certain agent

#### Response

```json
{
    "message": "All commission information retrieved successfully",
    "statusCode": 200,
    "data": [
        {
            "id": "688c5a3fa55a1bd6ac1e1c17",
            "amount": 1.5,
            "transactionType": "cashOut",
            "createdAt": "2025-08-01T06:10:07.040Z"
        },
        {
            "id": "688c58cca55a1bd6ac1e1c0f",
            "amount": 0.2,
            "transactionType": "cashIn",
            "createdAt": "2025-08-01T06:03:56.140Z"
        },
        ...{rest}
    ]
}
```
