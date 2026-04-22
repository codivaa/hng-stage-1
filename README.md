# 🚀 HNG Stage 2 Backend – Intelligence Query Engine API

---

## 📌 Overview

This project is an upgraded version of the **HNG Stage 1 Profile Intelligence API**, extended to meet the requirements of **Stage 2**.

It is built for **Insighta Labs**, a demographic intelligence company that needs fast, flexible data querying.

### 🔥 What this API does

* Creates demographic profiles using external APIs
* Stores structured data in MongoDB
* Supports **advanced filtering, sorting, and pagination**
* Supports **natural language queries (rule-based parsing)**
* Seeds database with **2026 profiles**
* Ensures **efficient querying (no unnecessary full-table scans)**

---

## 🌐 Live API

**Base URL**

```
https://hng-stage-1-production-93d7.up.railway.app
```

---

## 📡 External APIs Used

* Genderize → https://api.genderize.io
* Agify → https://api.agify.io
* Nationalize → https://api.nationalize.io

---

## 🧠 Classification Logic

### Age Groups

| Age Range | Group    |
| --------- | -------- |
| 0–12      | child    |
| 13–19     | teenager |
| 20–59     | adult    |
| 60+       | senior   |

### Country Selection

* Country with **highest probability** is selected

---

## 🗄️ Database Structure

Each profile follows this schema:

* id (UUID v7)
* name (unique)
* gender
* gender_probability
* age
* age_group
* country_id
* country_name
* country_probability
* created_at (ISO 8601 UTC)

---

## 🌱 Data Seeding

The database is preloaded with **2026 profiles** from a JSON dataset.

### ✔️ Key Features

* Prevents duplicate entries using unique name constraint
* Safe to run multiple times (**idempotent**)
* Ensures required dataset is available before API usage

### ▶️ How to Run Seed

```bash
npm run seed
```

---

## 📦 API Endpoints

---

### 1️⃣ Create Profile

**POST** `/api/profiles`

```json
{
  "name": "ella"
}
```

---

### 2️⃣ Get Single Profile

**GET** `/api/profiles/{id}`

---

### 3️⃣ Get All Profiles (CORE ENGINE)

**GET** `/api/profiles`

#### 🔍 Filtering (combinable)

* gender
* age_group
* country_id
* min_age
* max_age
* min_gender_probability
* min_country_probability

#### 🔃 Sorting

* `sort_by` → age | created_at | gender_probability
* `order` → asc | desc

#### 📄 Pagination

* page (default: 1)
* limit (default: 10, max: 50)

---

### 4️⃣ Natural Language Search (CORE FEATURE)

**GET** `/api/profiles/search?q=<query>`

---

## 🧠 Natural Language Parsing Approach

This system uses a **rule-based parser** (NO AI / NO LLMs).

### 🔍 Supported Keywords

#### 👤 Gender

* male → gender = male
* female → gender = female

#### 🎂 Age Rules

* young → age 16–24
* above X → min_age
* below X → max_age

#### 🧑‍🤝‍🧑 Age Groups

* child → child
* teen → teenager
* adult → adult
* senior → senior

#### 🌍 Countries

* nigeria → NG
* kenya → KE
* angola → AO
* ghana → GH
* uganda → UG

---

## 🔄 Example Queries

| Query                  | Output                                        |
| ---------------------- | --------------------------------------------- |
| young males            | gender=male + age 16–24                       |
| females above 30       | gender=female + min_age=30                    |
| adult males from kenya | gender=male + age_group=adult + country_id=KE |

---

## ❗ Error Handling

```json
{
  "status": "error",
  "message": "<error message>"
}
```

---

## ⚠️ Limitations

* Only predefined keywords supported
* Limited country mapping
* No typo correction
* Cannot parse complex sentences
* Rule-based only

---

## ⚡ Performance

* No full-table scans
* Efficient MongoDB queries
* Pagination for large data

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
  seed/
    seed.js 
    seedProfiles.js 
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
npm install
npm run dev
```

---

## 🔐 Environment Variables

```
MONGO_URI=your_mongodb_connection_string
PORT=3000
```

---

## 🌍 Deployment

Hosted on Railway:

```
https://hng-stage-1-production-93d7.up.railway.app
```

---

## 👤 Author

Sassera Angel Ogbemudia
