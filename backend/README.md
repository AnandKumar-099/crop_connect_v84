# CropConnect Backend API

Production-ready RESTful API for CropConnect - A platform connecting farmers and buyers.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update the values:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_ACCESS_SECRET`: Strong secret for access tokens
   - `JWT_REFRESH_SECRET`: Strong secret for refresh tokens
   - `CLIENT_URL`: Your frontend URL

4. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

The API will be running at `http://localhost:5000`

---

## 📁 Project Structure

```
backend/
├── config/           # Configuration files
│   ├── config.js     # Environment config
│   └── database.js   # MongoDB connection
├── controllers/      # Request handlers
│   ├── authController.js
│   ├── cropController.js
│   ├── orderController.js
│   ├── messageController.js
│   └── adminController.js
├── middleware/       # Custom middleware
│   ├── auth.js       # JWT authentication
│   ├── errorHandler.js
│   └── validation.js # Input validation
├── models/           # Mongoose schemas
│   ├── User.js
│   ├── Crop.js
│   ├── Order.js
│   └── Message.js
├── routes/           # API routes
│   ├── authRoutes.js
│   ├── cropRoutes.js
│   ├── orderRoutes.js
│   ├── messageRoutes.js
│   └── adminRoutes.js
├── utils/            # Utility functions
│   ├── fileUpload.js # Multer config
│   ├── tokenUtils.js # JWT helpers
│   └── seedData.js   # Database seeding
├── uploads/          # Uploaded files
│   └── crops/
├── .env.example      # Environment template
├── .gitignore
├── package.json
└── server.js         # Entry point
```

---

## 🔐 Authentication

All protected routes require a JWT access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Sample Credentials (after seeding)

| Role   | Email                    | Password   |
|--------|--------------------------|------------|
| Admin  | admin@cropconnect.com    | admin123   |
| Farmer | rajesh@example.com       | farmer123  |
| Farmer | sunita@example.com       | farmer123  |
| Buyer  | amit@example.com         | buyer123   |
| Buyer  | priya@example.com        | buyer123   |

---

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint    | Description          | Access |
|--------|-------------|----------------------|--------|
| POST   | /register   | Register new user    | Public |
| POST   | /login      | Login user           | Public |
| POST   | /refresh    | Refresh access token | Public |
| POST   | /logout     | Logout user          | Private|
| GET    | /me         | Get current user     | Private|

### Crops (`/api/crops`)

| Method | Endpoint              | Description              | Access          |
|--------|-----------------------|--------------------------|-----------------|
| GET    | /                     | Get all crops (filtered) | Public          |
| POST   | /                     | Create crop listing      | Farmer only     |
| GET    | /my-crops             | Get my crops             | Farmer only     |
| GET    | /farmer/:farmerId     | Get crops by farmer      | Public          |
| GET    | /:id                  | Get single crop          | Public          |
| PUT    | /:id                  | Update crop              | Farmer (owner)  |
| DELETE | /:id                  | Delete crop              | Farmer (owner)  |
| PATCH  | /:id/availability     | Toggle availability      | Farmer (owner)  |

### Orders (`/api/orders`)

| Method | Endpoint           | Description            | Access         |
|--------|--------------------|------------------------|----------------|
| POST   | /                  | Create order           | Buyer only     |
| GET    | /my-orders         | Get buyer's orders     | Buyer only     |
| GET    | /farmer-orders     | Get farmer's orders    | Farmer only    |
| GET    | /:id               | Get single order       | Involved party |
| PATCH  | /:id/accept        | Accept order           | Farmer (owner) |
| PATCH  | /:id/reject        | Reject order           | Farmer (owner) |
| PATCH  | /:id/complete      | Mark as completed      | Farmer (owner) |
| PATCH  | /:id/cancel        | Cancel order           | Buyer (owner)  |
| PATCH  | /:id/payment       | Update payment status  | Involved party |

### Messages (`/api/messages`)

| Method | Endpoint                | Description              | Access  |
|--------|-------------------------|--------------------------|---------|
| POST   | /                       | Send message             | Private |
| GET    | /conversations          | Get all conversations    | Private |
| GET    | /conversation/:userId   | Get conversation         | Private |
| GET    | /unread-count           | Get unread count         | Private |
| PATCH  | /read/:userId           | Mark messages as read    | Private |
| DELETE | /:id                    | Delete message           | Private |

### Admin (`/api/admin`)

| Method | Endpoint              | Description           | Access      |
|--------|-----------------------|-----------------------|-------------|
| GET    | /stats                | Dashboard statistics  | Admin only  |
| GET    | /users                | Get all users         | Admin only  |
| GET    | /users/:id            | Get user by ID        | Admin only  |
| PATCH  | /users/:id/ban        | Ban/unban user        | Admin only  |
| PATCH  | /users/:id/activate   | Activate/deactivate   | Admin only  |
| DELETE | /users/:id            | Delete user           | Admin only  |
| GET    | /crops                | Get all crops         | Admin only  |
| DELETE | /crops/:id            | Delete crop           | Admin only  |
| GET    | /orders               | Get all orders        | Admin only  |

---

## 📝 API Usage Examples

### Register a Farmer

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "farmer",
  "phone": "+91 9876543210",
  "farmDetails": {
    "farmName": "Doe Farms",
    "address": "Village XYZ, District ABC",
    "sizeInAcres": 20
  }
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Create Crop Listing (with image upload)

```bash
POST /api/crops
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

FormData:
- name: "Basmati Rice"
- type: "Grains"
- description: "Premium quality rice"
- quantity: 500
- unit: "quintal"
- price: 4500
- location[address]: "Village ABC"
- location[city]: "Meerut"
- location[state]: "UP"
- images: [file1.jpg, file2.jpg]
```

### Get All Crops (with filters)

```bash
GET /api/crops?type=Vegetables&city=Lucknow&minPrice=20&maxPrice=50&page=1&limit=10
```

### Place an Order

```bash
POST /api/orders
Authorization: Bearer <buyer_access_token>
Content-Type: application/json

{
  "cropId": "6581234567890abcdef12345",
  "quantity": 100,
  "deliveryAddress": "123 Market Road, Delhi",
  "paymentMethod": "bank_transfer",
  "buyerNotes": "Please pack carefully"
}
```

### Accept Order (Farmer)

```bash
PATCH /api/orders/:orderId/accept
Authorization: Bearer <farmer_access_token>
Content-Type: application/json

{
  "deliveryDate": "2024-12-20",
  "farmerNotes": "Will be delivered on time"
}
```

---

## 🔒 Security Features

- **JWT Authentication**: Access & refresh tokens
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: 100 requests per 15 minutes
- **Helmet**: Security headers
- **CORS**: Configured for frontend
- **Input Validation**: express-validator
- **NoSQL Injection Prevention**: mongo-sanitize
- **Role-Based Access Control**: Farmer/Buyer/Admin

---

## 🌐 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cropconnect
JWT_ACCESS_SECRET=your_very_strong_secret_key_here
JWT_REFRESH_SECRET=your_very_strong_refresh_secret_here
CLIENT_URL=https://your-frontend-domain.com
```

### Deploy to Render/Railway

1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables
4. Deploy!

### Deploy to Heroku

```bash
heroku create cropconnect-api
heroku config:set MONGODB_URI=<your_mongodb_uri>
heroku config:set JWT_ACCESS_SECRET=<your_secret>
git push heroku main
```

---

## 🧪 Testing

Test the API using:
- **Postman**: Import endpoints and test
- **Thunder Client** (VS Code extension)
- **cURL**: Command-line testing

---

## 📄 License

MIT

---

## 👥 Support

For issues or questions, contact the development team.
