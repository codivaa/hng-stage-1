# 🚀 HNG Stage 1 Backend – Profile Intelligence API

## 📌 Overview

This is a RESTful API built for the HNG Stage 1 Backend Task.

The API:

* Accepts a name
* Calls 3 external APIs (Genderize, Agify, Nationalize)
* Applies classification logic
* Stores results in MongoDB
* Exposes endpoints to manage profiles

---

## 🌐 Live API

**Base URL**

```
https://hng-stage-1-production-93d7.up.railway.app
```

**Test Endpoint**

```
https://hng-stage-1-production-93d7.up.railway.app/api/profiles
```

---

## 📡 External APIs Used

* Genderize → https://api.genderize.io?name={name}
* Agify → https://api.agify.io?name={name}
* Nationalize → https://api.nationalize.io?name={name}

---

## 🧠 Classification Logic

### Age Groups

| Age   | Group    |
| ----- | -------- |
| 0–12  | child    |
| 13–19 | teenager |
| 20–59 | adult    |
| 60+   | senior   |

### Nationality

* Select country with highest probability

---

## 📦 API Endpoints

---

### 1️⃣ Create Profile

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
    "country_id": "NG",
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
  "data": { }
}
```

---

### 2️⃣ Get Single Profile

**GET** `/api/profiles/{id}`

---

### 3️⃣ Get All Profiles

**GET** `/api/profiles`

Query parameters (case-insensitive):

* gender
* country_id
* age_group

Example:

```
/api/profiles?gender=male&country_id=NG
```

Response:

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
      "country_id": "NG"
    }
  ]
}
```

---

### 4️⃣ Delete Profile

**DELETE** `/api/profiles/{id}`

Response:

```
204 No Content
```

---

## ❗ Error Handling

All errors follow:

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
| 502  | External API failure  |
| 500  | Internal server error |

---

## ⚠️ Edge Case Handling

* Genderize returns null → 502
* Agify returns null → 502
* Nationalize returns empty → 502

Format:

```json
{
  "status": "error",
  "message": "ExternalAPI returned an invalid response"
}
```

---

## 🗂️ Project Structure

```
src/
  app.js
  server.js
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
git clone https://github.com/codivaa/hng-stage-1
cd hng-stage-1
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create `.env`:

```
MONGO_URI=your_mongodb_connection_string
PORT=3000
```

---

## 🌍 Deployment

Deployed on Railway:

```
https://hng-stage-1-production-93d7.up.railway.app
```

---

## 🧪 Testing

Use:

* Postman
* Thunder Client
* curl
* Browser (GET endpoints)

---

## 👤 Author

Sassera Angel Ogbemudia
