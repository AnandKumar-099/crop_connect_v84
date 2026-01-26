# CropConnect Backend - API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Crops](#crops)
3. [Orders](#orders)
4. [Messages](#messages)
5. [Admin](#admin)
6. [Error Responses](#error-responses)

---

## Authentication

### Register User
**POST** `/api/auth/register`

Create a new user account (Farmer/Buyer/Admin).

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required, min 6 chars)",
  "role": "farmer | buyer | admin (required)",
  "phone": "string (required)",
  "profileImageUrl": "string (optional)",
  "farmDetails": {
    "farmName": "string (required for farmers)",
    "address": "string (required for farmers)",
    "sizeInAcres": "number (optional)"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ...user object },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

### Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ...user object },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

### Refresh Token
**POST** `/api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```

### Get Current User
**GET** `/api/auth/me`

**Headers:** `Authorization: Bearer <access_token>`

---

## Crops

### Get All Crops
**GET** `/api/crops`

**Query Parameters:**
- `type`: Filter by crop type (Grains, Vegetables, Fruits, etc.)
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `minQuantity`: Minimum quantity
- `maxQuantity`: Maximum quantity
- `city`: Filter by city
- `state`: Filter by state
- `search`: Search in name/description
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "crops": [ ...array of crops ],
    "pagination": {
      "total": 50,
      "page": 1,
      "pages": 5,
      "limit": 10
    }
  }
}
```

### Create Crop
**POST** `/api/crops`

**Headers:** `Authorization: Bearer <access_token>` (Farmer only)

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `name`: string (required)
- `type`: Grains|Vegetables|Fruits|Pulses|Oilseeds|Spices|Other (required)
- `description`: string (optional)
- `quantity`: number (required)
- `unit`: kg|quintal|ton|piece|dozen (required)
- `price`: number (required)
- `priceUnit`: string (optional)
- `location[address]`: string (required)
- `location[city]`: string (optional)
- `location[state]`: string (optional)
- `location[pincode]`: string (optional)
- `harvestDate`: date (optional)
- `qualityGrade`: A|B|C|Not Graded (optional)
- `images`: file[] (optional, max 5 images, 5MB each)

### Update Crop
**PUT** `/api/crops/:id`

**Headers:** `Authorization: Bearer <access_token>` (Farmer - owner only)

Same fields as Create Crop

### Delete Crop
**DELETE** `/api/crops/:id`

**Headers:** `Authorization: Bearer <access_token>` (Farmer - owner only)

---

## Orders

### Create Order
**POST** `/api/orders`

**Headers:** `Authorization: Bearer <access_token>` (Buyer only)

**Request Body:**
```json
{
  "cropId": "string (required)",
  "quantity": "number (required, min 1)",
  "deliveryAddress": "string (required)",
  "paymentMethod": "cash | online | bank_transfer | other (optional)",
  "buyerNotes": "string (optional)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "order": { ...order object with populated fields }
  }
}
```

### Get My Orders (Buyer)
**GET** `/api/orders/my-orders`

**Headers:** `Authorization: Bearer <access_token>` (Buyer only)

**Query Parameters:**
- `status`: pending|accepted|rejected|completed|cancelled

### Get Farmer Orders
**GET** `/api/orders/farmer-orders`

**Headers:** `Authorization: Bearer <access_token>` (Farmer only)

**Query Parameters:**
- `status`: pending|accepted|rejected|completed|cancelled

### Accept Order
**PATCH** `/api/orders/:id/accept`

**Headers:** `Authorization: Bearer <access_token>` (Farmer - owner only)

**Request Body:**
```json
{
  "deliveryDate": "date (optional)",
  "farmerNotes": "string (optional)"
}
```

### Reject Order
**PATCH** `/api/orders/:id/reject`

**Headers:** `Authorization: Bearer <access_token>` (Farmer - owner only)

**Request Body:**
```json
{
  "rejectionReason": "string (optional)"
}
```

### Complete Order
**PATCH** `/api/orders/:id/complete`

**Headers:** `Authorization: Bearer <access_token>` (Farmer - owner only)

### Cancel Order
**PATCH** `/api/orders/:id/cancel`

**Headers:** `Authorization: Bearer <access_token>` (Buyer - owner only)

### Update Payment Status
**PATCH** `/api/orders/:id/payment`

**Headers:** `Authorization: Bearer <access_token>` (Involved party)

**Request Body:**
```json
{
  "paymentStatus": "pending | paid | failed | refunded"
}
```

---

## Messages

### Send Message
**POST** `/api/messages`

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "receiverId": "string (required)",
  "content": "string (required, max 1000 chars)",
  "relatedOrderId": "string (optional)",
  "relatedCropId": "string (optional)"
}
```

### Get Conversations
**GET** `/api/messages/conversations`

**Headers:** `Authorization: Bearer <access_token>`

Returns list of all conversations with unread counts.

### Get Conversation with User
**GET** `/api/messages/conversation/:userId`

**Headers:** `Authorization: Bearer <access_token>`

Returns all messages between current user and specified user.

### Mark Messages as Read
**PATCH** `/api/messages/read/:userId`

**Headers:** `Authorization: Bearer <access_token>`

Marks all messages from specified user as read.

### Get Unread Count
**GET** `/api/messages/unread-count`

**Headers:** `Authorization: Bearer <access_token>`

---

## Admin

All admin endpoints require `Authorization: Bearer <access_token>` with admin role.

### Get Dashboard Stats
**GET** `/api/admin/stats`

Returns counts of users, farmers, buyers, crops, orders.

### Get All Users
**GET** `/api/admin/users`

**Query Parameters:**
- `role`: farmer|buyer|admin
- `isActive`: true|false
- `isBanned`: true|false
- `page`: number
- `limit`: number

### Ban/Unban User
**PATCH** `/api/admin/users/:id/ban`

Toggles user ban status.

### Activate/Deactivate User
**PATCH** `/api/admin/users/:id/activate`

Toggles user active status.

### Delete User
**DELETE** `/api/admin/users/:id`

Permanently deletes user (cannot delete admins).

### Get All Crops (Admin)
**GET** `/api/admin/crops`

**Query Parameters:**
- `page`: number
- `limit`: number

### Delete Crop (Admin)
**DELETE** `/api/admin/crops/:id`

### Get All Orders (Admin)
**GET** `/api/admin/orders`

**Query Parameters:**
- `status`: pending|accepted|rejected|completed|cancelled
- `page`: number
- `limit`: number

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ...optional array of validation errors ]
}
```

**Common Status Codes:**
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

**Validation Error Example:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```
