# Journal & Mood APIs Documentation

## Journal Endpoints

All journal endpoints require authentication (Bearer token in Authorization header).

### Create Journal
**POST** `/api/journals`

**Request Body:**
```json
{
  "title": "My Day",
  "text": "Today was a great day. I accomplished many things..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Journal created successfully",
  "data": {
    "_id": "64abc...",
    "user": "64xyz...",
    "entry": {
      "_id": "64def...",
      "title": "My Day",
      "text": "Today was a great day...",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    },
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### Get All Journals
**GET** `/api/journals`

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "64abc...",
      "user": "64xyz...",
      "entry": {
        "_id": "64def...",
        "title": "My Day",
        "text": "Today was great...",
        "createdAt": "2024-01-01T10:00:00.000Z"
      },
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

### Get Single Journal
**GET** `/api/journals/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64abc...",
    "user": "64xyz...",
    "entry": {
      "_id": "64def...",
      "title": "My Day",
      "text": "Full journal text..."
    }
  }
}
```

### Update Journal
**PUT** `/api/journals/:id`

**Request Body:**
```json
{
  "title": "Updated Title",
  "text": "Updated text content..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Journal updated successfully",
  "data": {
    "_id": "64abc...",
    "entry": {
      "title": "Updated Title",
      "text": "Updated text content..."
    }
  }
}
```

### Delete Journal
**DELETE** `/api/journals/:id`

**Response (200):**
```json
{
  "success": true,
  "message": "Journal deleted successfully"
}
```

---

## Mood Endpoints

All mood endpoints require authentication (Bearer token in Authorization header).

### Create Mood
**POST** `/api/moods`

**Request Body:**
```json
{
  "moodType": "happy"
}
```

**Valid Mood Types:**
- happy
- sad
- angry
- anxious
- calm
- excited
- neutral
- stressed
- tired
- motivated

**Response (201):**
```json
{
  "success": true,
  "message": "Mood created successfully",
  "data": {
    "_id": "64abc...",
    "user": "64xyz...",
    "moodType": "happy",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### Get All Moods
**GET** `/api/moods`

**Query Parameters:**
- `startDate` (optional): Filter moods from this date (ISO format)
- `endDate` (optional): Filter moods until this date (ISO format)
- `moodType` (optional): Filter by specific mood type

**Examples:**
```
GET /api/moods
GET /api/moods?startDate=2024-01-01&endDate=2024-01-31
GET /api/moods?moodType=happy
```

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "64abc...",
      "user": "64xyz...",
      "moodType": "happy",
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

### Get Single Mood
**GET** `/api/moods/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64abc...",
    "user": "64xyz...",
    "moodType": "happy",
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### Update Mood
**PUT** `/api/moods/:id`

**Request Body:**
```json
{
  "moodType": "excited"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Mood updated successfully",
  "data": {
    "_id": "64abc...",
    "moodType": "excited",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T11:00:00.000Z"
  }
}
```

### Delete Mood
**DELETE** `/api/moods/:id`

**Response (200):**
```json
{
  "success": true,
  "message": "Mood deleted successfully"
}
```

### Get Mood Statistics
**GET** `/api/moods/stats`

**Query Parameters:**
- `startDate` (optional): Calculate stats from this date
- `endDate` (optional): Calculate stats until this date

**Examples:**
```
GET /api/moods/stats
GET /api/moods/stats?startDate=2024-01-01&endDate=2024-01-31
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "moodType": "happy",
      "count": 15
    },
    {
      "moodType": "calm",
      "count": 10
    },
    {
      "moodType": "stressed",
      "count": 5
    }
  ]
}
```

---

## React Native Implementation Examples

### Journal Service

```javascript
import api from './api'; // Your axios instance with interceptors

// Create journal
export const createJournal = async (title, text) => {
  const response = await api.post('/journals', { title, text });
  return response.data;
};

// Get all journals
export const getJournals = async () => {
  const response = await api.get('/journals');
  return response.data;
};

// Get single journal
export const getJournal = async (id) => {
  const response = await api.get(`/journals/${id}`);
  return response.data;
};

// Update journal
export const updateJournal = async (id, title, text) => {
  const response = await api.put(`/journals/${id}`, { title, text });
  return response.data;
};

// Delete journal
export const deleteJournal = async (id) => {
  const response = await api.delete(`/journals/${id}`);
  return response.data;
};
```

### Mood Service

```javascript
import api from './api';

// Create mood
export const createMood = async (moodType) => {
  const response = await api.post('/moods', { moodType });
  return response.data;
};

// Get all moods
export const getMoods = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/moods?${params}`);
  return response.data;
};

// Get mood stats
export const getMoodStats = async (startDate, endDate) => {
  const params = new URLSearchParams({ startDate, endDate }).toString();
  const response = await api.get(`/moods/stats?${params}`);
  return response.data;
};

// Update mood
export const updateMood = async (id, moodType) => {
  const response = await api.put(`/moods/${id}`, { moodType });
  return response.data;
};

// Delete mood
export const deleteMood = async (id) => {
  const response = await api.delete(`/moods/${id}`);
  return response.data;
};
```

---

## Error Responses

**400 Bad Request:**
```json
{
  "message": "Title and text are required"
}
```

**401 Unauthorized:**
```json
{
  "message": "Not authorized, no token"
}
```

**403 Forbidden:**
```json
{
  "message": "Not authorized to access this journal"
}
```

**404 Not Found:**
```json
{
  "message": "Journal not found"
}
```

**500 Server Error:**
```json
{
  "message": "Server error"
}
```

---

## Security Features

- ✅ All routes protected with JWT authentication
- ✅ User can only access their own journals and moods
- ✅ Validation on all inputs
- ✅ Proper error handling and status codes
- ✅ Cascading delete (when journal is deleted, entry is also deleted)
