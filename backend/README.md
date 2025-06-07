# Python Backend Server

A lightweight HTTP server built with Python's standard library for use with the Expo app.

## Features

- RESTful API endpoints
- CORS support for frontend integration
- JSON request/response handling
- Error handling and logging
- No external dependencies (WebContainer compatible)

## API Endpoints

### GET /api/health
Health check endpoint to verify server status.

**Response:**
```json
{
  "status": "healthy",
  "message": "Python backend is running",
  "timestamp": "2024-01-01T12:00:00"
}
```

### GET /api/users
Get list of users.

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    }
  ],
  "total": 1,
  "status": "success"
}
```

### POST /api/users
Create a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

**Response:**
```json
{
  "user": {
    "id": 1234567890,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2024-01-01T12:00:00"
  },
  "message": "User created successfully",
  "status": "success"
}
```

### GET /api/data
Get sample application data.

### GET /api/time
Get current server time in various formats.

## Running the Server

```bash
python backend/server.py
```

The server will start on `http://localhost:8000` by default.

## Development Notes

- Uses Python standard library only (WebContainer compatible)
- CORS enabled for frontend development
- JSON-based API responses
- Basic error handling and logging
- Extensible design for adding new endpoints

## Limitations

- In-memory data storage (no persistence)
- No authentication/authorization
- Limited to Python standard library
- Single-threaded request handling

For production use, consider:
- Database integration
- Authentication middleware
- Request validation
- Rate limiting
- Proper logging system