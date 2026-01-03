# MindCase Backend API

RESTful API backend for the MindCase mental health and wellness mobile application. Built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: JWT-based secure authentication system
- **Mood Tracking**: CRUD operations for mood entries with history
- **Journal Management**: Create, read, update, and delete journal entries
- **Nutrition Tracking**: Log and retrieve daily nutrition data
- **AI Chat Integration**: OpenAI-powered wellness conversation assistant
- **Data Persistence**: MongoDB database with Mongoose ODM
- **Security**: Password hashing with bcryptjs, CORS enabled

## 🛠️ Technology Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js v5
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment**: dotenv for configuration
- **Development**: Nodemon for auto-restart

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB installation)
- npm or yarn
- OpenAI API key (optional, for chat feature)

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Dilshanrad22/mind_case_backend.git
cd mind_case_backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_min_32_characters
PORT=5000
OPENAI_API_KEY=your_openai_api_key  # Optional
```

**Important**:
- Replace `your_mongodb_connection_string` with your MongoDB Atlas URI
- Generate a secure random string for `JWT_SECRET` (minimum 32 characters)
- Add your OpenAI API key if you want to enable the chat feature

### 4. Start the Server

**Development mode** (with auto-restart):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📂 Project Structure

```
mind_case_backend/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── controllers/
│   ├── auth.controller.js    # Authentication logic
│   ├── chat.controller.js    # Chat/AI assistant logic
│   ├── journal.controller.js # Journal CRUD operations
│   ├── mood.controller.js    # Mood tracking logic
│   └── nutrition.controller.js # Nutrition tracking logic
├── middleware/
│   └── auth.middleware.js    # JWT authentication middleware
├── models/
│   ├── User.model.js         # User schema
│   ├── Mood.model.js         # Mood entry schema
│   ├── Journal.model.js      # Journal schema
│   ├── JournaleEntry.model.js # Journal entry schema
│   ├── DailyNutrition.model.js # Daily nutrition schema
│   ├── Food.model.js         # Food item schema
│   └── Chat.model.js         # Chat message schema
├── routes/
│   ├── User.routes.js        # Authentication routes
│   ├── mood.routes.js        # Mood tracking routes
│   ├── journal.routes.js     # Journal routes
│   ├── nutrition.routes.js   # Nutrition routes
│   └── chat.routes.js        # Chat routes
├── .env                      # Environment variables (not in git)
├── server.js                 # Application entry point
├── render.yaml              # Render deployment configuration
└── package.json             # Dependencies and scripts
```

## 🔌 API Endpoints

### Authentication

#### Register New User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Sign In
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Mood Tracking

#### Get Mood History
```http
GET /api/moods
Authorization: Bearer <token>
```

#### Log New Mood
```http
POST /api/moods
Authorization: Bearer <token>
Content-Type: application/json

{
  "mood": "happy",
  "intensity": 4,
  "note": "Had a great day!"
}
```

#### Get Mood Statistics
```http
GET /api/moods/stats
Authorization: Bearer <token>
```

### Journal Entries

#### Get All Journal Entries
```http
GET /api/journals
Authorization: Bearer <token>
```

#### Get Single Journal Entry
```http
GET /api/journals/:id
Authorization: Bearer <token>
```

#### Create Journal Entry
```http
POST /api/journals
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Day",
  "content": "Today was amazing...",
  "mood": "happy",
  "tags": ["gratitude", "exercise"]
}
```

#### Update Journal Entry
```http
PUT /api/journals/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### Delete Journal Entry
```http
DELETE /api/journals/:id
Authorization: Bearer <token>
```

### Nutrition Tracking

#### Get Nutrition History
```http
GET /api/nutrition
Authorization: Bearer <token>
```

#### Log Food Intake
```http
POST /api/nutrition
Authorization: Bearer <token>
Content-Type: application/json

{
  "foodName": "Apple",
  "calories": 95,
  "protein": 0.5,
  "carbs": 25,
  "fat": 0.3,
  "servingSize": "1 medium"
}
```

#### Get Daily Nutrition Summary
```http
GET /api/nutrition/daily/:date
Authorization: Bearer <token>
```

### Chat / AI Assistant

#### Send Chat Message
```http
POST /api/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "How can I improve my mood?"
}
```

**Response**:
```json
{
  "reply": "AI generated response...",
  "timestamp": "2026-01-03T10:30:00.000Z"
}
```

### Health Check

#### Server Status
```http
GET /
```

**Response**:
```json
{
  "message": "MindCase API is running"
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. Register or sign in to receive a token
2. Include the token in the `Authorization` header for protected routes:
   ```
   Authorization: Bearer <your_token>
   ```
3. Tokens expire after 7 days (configurable in auth controller)

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Mood Model
```javascript
{
  userId: ObjectId (ref: User),
  mood: String (required),
  intensity: Number (1-5),
  note: String,
  timestamp: Date,
  createdAt: Date
}
```

### Journal Entry Model
```javascript
{
  userId: ObjectId (ref: User),
  title: String (required),
  content: String (required),
  mood: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Daily Nutrition Model
```javascript
{
  userId: ObjectId (ref: User),
  date: Date,
  foods: [FoodSchema],
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFat: Number
}
```

## 🧪 Testing the API

### Using cURL:

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Sign in
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Log a mood (replace <TOKEN> with actual token)
curl -X POST http://localhost:5000/api/moods \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"mood":"happy","intensity":4,"note":"Feeling great!"}'
```

### Using Postman:

1. Import the API endpoints
2. Set up an environment variable for the token
3. Test each endpoint with sample data

## 🚀 Deployment

### Deploy to Render

This repository includes a `render.yaml` configuration file for easy deployment to Render.

1. Push code to GitHub
2. Connect repository to Render
3. Render will automatically detect `render.yaml`
4. Add environment variables in Render dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `OPENAI_API_KEY` (optional)

### Deploy to Railway/Heroku

```bash
# Install CLI tool
npm install -g railway  # or heroku

# Login
railway login  # or heroku login

# Initialize project
railway init  # or heroku create

# Add environment variables
railway variables set MONGO_URI=<value>  # or heroku config:set

# Deploy
railway up  # or git push heroku main
```

## 🔧 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MONGO_URI` | MongoDB connection string | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT signing | Yes | `your_super_secret_key_min_32_chars` |
| `PORT` | Server port number | No (default: 5000) | `5000` |
| `OPENAI_API_KEY` | OpenAI API key for chat | No | `sk-...` |

## ⚠️ Security Notes

- Never commit `.env` file to version control
- Use strong, unique JWT_SECRET in production
- Enable HTTPS in production
- Regularly update dependencies
- Implement rate limiting for production
- Use MongoDB Atlas IP whitelist in production

## 📝 Known Issues & Limitations

- Chat feature requires OpenAI API key (costs apply)
- No rate limiting implemented (add in production)
- No email verification for new users
- No password reset functionality
- No file upload support yet
- No real-time features (WebSocket)

## 🔄 Updates & Maintenance

Keep dependencies up to date:

```bash
npm outdated
npm update
```

Security audit:

```bash
npm audit
npm audit fix
```

## 📄 API Documentation

For detailed API documentation, see:
- [Journal & Mood API Documentation](JOURNAL_MOOD_API.md)

## 📧 Support

For issues or questions:
- Create an issue on GitHub
- Contact: [@Dilshanrad22](https://github.com/Dilshanrad22)

## 📜 License

This project was created for educational purposes as part of a mobile development challenge.

---

**Built with ❤️ using Node.js, Express, and MongoDB**

*Backend API for MindCase Mobile Application*
*January 2026*
