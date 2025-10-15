# AlgoMates Backend 

A RESTful API backend for AlgoMates - a developer networking platform that helps programmers connect, collaborate, and find coding partners based on shared interests and skills.

## 🚀 Features

- **User Authentication & Authorization**
  - Secure signup/login with JWT tokens
  - Password hashing with bcrypt
  - Cookie-based session management

- **Profile Management**
  - Create and update user profiles
  - Skills showcase (max 10 skills)
  - Profile photo and bio
  - Password validation and updates

- **Connection System**
  - Send connection requests (interested/ignored)
  - Accept or reject connection requests
  - View pending requests
  - View all connections
  - Prevent duplicate requests

- **Smart Feed**
  - Paginated user feed
  - Excludes already connected users
  - Excludes users with pending requests
  - Customizable limit (max 30 per page)

- **Security**
  - Input validation with validator.js
  - Strong password requirements
  - Email validation
  - Protected routes with middleware

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: validator.js
- **CORS**: cors middleware
- **Environment Variables**: dotenv

## 📁 Project Structure

```
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── user.js              # User schema and methods
│   └── connectionRequest.js # Connection request schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── profile.js           # Profile management routes
│   ├── request.js           # Connection request routes
│   └── user.js              # User feed and connections routes
├── middlewares/
│   └── auth.js              # Authentication middleware
├── .env                     # Environment variables (not in repo)
├── .env.example             # Environment variables template
├── .gitignore
├── app.js                   # Main application file
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /signup` - Register a new user
- `POST /login` - Login user and get JWT token
- `POST /logout` - Logout user

### Profile
- `GET /profile/view` - View logged-in user profile
- `PATCH /profile/edit` - Update user profile
- `PATCH /profile/password` - Update password

### Connection Requests
- `POST /request/send/:status/:toUserId` - Send connection request (interested/ignored)
- `POST /request/review/:status/:requestId` - Accept or reject connection request

### Users
- `GET /user/requests/received` - Get all pending connection requests
- `GET /user/connections` - Get all accepted connections
- `GET /feed` - Get paginated feed of users (query params: `page`, `limit`)

## 🔐 Authentication

Protected routes require a JWT token sent via cookies. The token is automatically set during login and removed during logout.


## 📊 Data Models

### User Model
- firstName (required)
- lastName
- emailId (required, unique, validated)
- password (required, strong password validation)
- age (18-80)
- gender (male/female/other)
- photoUrl (validated URL)
- about (max 500 chars)
- skills (max 10 skills)
- timestamps

### Connection Request Model
- fromUserId (required)
- toUserId (required)
- status (interested/ignored/accepted/rejected)
- timestamps

## 🚧 Currently Working On

- [ ] Real-time messaging between connections
- [ ] Advanced search and filters for user feed
- [ ] Email notifications for connection requests
- [ ] Payment Integration using razorpay

**Shobhit Jain**
- GitHub: (https://github.com/Shobhit1805)
- Email: shobhitj1805@gmail.com

## 🔗 Related Repositories

- Frontend Repository: [AlgoMates Frontend]((https://github.com/Shobhit1805/AlgoMates-Frontend))

---

**Note**: This is a learning project and is actively being developed. Contributions and feedback are welcome!
