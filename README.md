# 🚀 HNG Stage 1 Backend – Profile Intelligence API

## 📌 Overview

This project is a RESTful API built for the HNG Backend Stage 1 task.

It accepts a name, enriches it using three external APIs (Genderize, Agify, and Nationalize), processes the data, stores it in MongoDB, and exposes endpoints to retrieve, filter, and delete profiles.

The system is designed to demonstrate:

* Backend system design
* API integration
* Database usage
* Clean API response structure

---

## ⚙️ Features

* 🔗 Multi-API integration (Genderize, Agify, Nationalize)
* 💾 MongoDB data persistence
* ♻️ Idempotency (no duplicate profiles)
* 🧠 Age classification logic
* 🌍 Nationality selection (highest probability)
* 🔍 Filtering support via query params
* ⚠️ Structured error handling
* 🆔 UUID v7 unique IDs
* 🕒 ISO 8601 timestamps (UTC)
* 🌐 CORS enabled

---

## 🌐 Base URL

```
https://your-api-url.com
```

---

## 📡 External APIs

### Genderize

```
https://api.genderize.io?name={name}
```

### Agify

```
https://api.agify.io?name={name}
```

### Nationalize

```
https://api.nationalize.io?name={name}
```

---

## 🧠 Business Logic

### Age Classification

| Age   | Group    |
| ----- | -------- |
| 0–12  | child    |
| 13–19 | teenager |
| 20–59 | adult    |
| 60+   | senior   |

### Nationality

* Select country with highest probability from API response

---

## 📦 API Endpoints

### 🔹 Create Profile

**POST** `/api/profiles`

Request:

```json
{
  "name": "ella"
}
```

Success (201):

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "DRC",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00Z"
  }
}
```

Duplicate (200):

```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": { ... }
}
```

---

### 🔹 Get Single Profile

**GET** `/api/profiles/{id}`

Response (200):

```json
{
  "status": "success",
  "data": { ...full profile }
}
```

---

### 🔹 Get All Profiles

**GET** `/api/profiles`

Query params:

* gender
* country_id
* age_group

Example:

```
/api/profiles?gender=male&country_id=NG
```

Response (200):

```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": "uuid",
      "name": "ella",
      "gender": "female",
      "age": 46,
      "age_group": "adult",
      "country_id": "DRC"
    }
  ]
}
```

---

### 🔹 Delete Profile

**DELETE** `/api/profiles/{id}`

Response:

```
204 No Content
```

---

## ❗ Error Handling

All errors follow this format:

```json
{
  "status": "error",
  "message": "Error message"
}
```

### Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 400  | Missing or empty name |
| 422  | Invalid type          |
| 404  | Profile not found     |
| 502  | External API error    |
| 500  | Internal server error |

---

## 🗂️ Project Structure

```
config/
  db.js
controllers/
  profileController.js
models/
  Profile.js
routes/
  profileRoutes.js
utils/
  classifyAge.js
errors/
  errorHandler.js
app.js
server.js
```

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB (Mongoose)
* Axios
* UUID v7

---

## ▶️ Running Locally

```bash
git clone https://github.com/codivaa/hng_stage1
cd hng_stage1
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file and add:

```
MONGO_URI=your_mongodb_connection_string
PORT=3000
```

---

## 🌍 Deployment

Deployed on Railway (or any supported platform).

---

## 🧪 Testing

Use tools like:

* Thunder Client
* Postman
* curl

---

## 👤 Author

Sassera Angel Ogbemudia
