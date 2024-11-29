# Project Setup Instructions

## Prerequisites

Before you start, make sure you have the following tools installed:

- **Node.js** (v16 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js)
- **NestJS CLI** - Install it globally using `npm install -g @nestjs/cli`

## Steps to Set Up the Project

### 1. Clone the Repository

First, clone the project repository to your local machine using Git.

```bash
git clone https://github.com/Jayanti2919/QR-Management-Backend.git
cd QR-Management-Backend
```

### 2. Install Dependencies

Install all the required dependencies listed in the `package.json` file.

```bash
npm install
```

### 3. Environment Variables Setup

Create a `.env` file at the root of your project and set up the necessary environment variables. Example:

```env
# MongoDB URI
MONGO_URI=mongodb://localhost:27017/yourdbname

# OpenAI API Key (if using OpenAI functionality)
OPENAI_API_KEY=your_openai_api_key

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret

```

### 4. Run the Development Server

To start the application in development mode, use the following command:

```bash
npm run start:dev
```

This will start the server and watch for changes, reloading automatically.

### 5. Running Tests

To run tests, use the following command:

```bash
npm run test
```

This will run all unit and integration tests and display the results in your terminal and also generate the test report as a HTMLfile.

Make sure the `jest-html-reporter` reporter is set up in your `jest.config.js` file.

### 6. Accessing the Application

By default, the application will be running on `http://localhost:3000/`.

You can test the API endpoints using Postman or any other API testing tool.

### 7. API Documentation

This project includes API documentation using [Swagger](https://swagger.io/). You can view the API documentation at:

```
http://localhost:3000/api-docs
```

The documentation is automatically generated based on the controllers and routes defined in the application.

### 8. Troubleshooting

- **Issue: Missing dependencies or packages not installing correctly**
  - Run `npm install` again to ensure all dependencies are installed.
  - Make sure you're using the correct version of Node.js.

- **Issue: MongoDB connection errors**
  - Ensure MongoDB is running locally or that the connection string in the `.env` file is correct.
  - If you're using a cloud database like MongoDB Atlas, make sure the `MONGO_URI` is configured correctly.

- **Issue: Tests failing**
  - Check the error messages for more information about what caused the failure.
  - Ensure that all mock data and environment configurations are set correctly.