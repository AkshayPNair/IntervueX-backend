# 🧠 IntervueX Backend

> **A Clean Architecture–driven, TypeScript-based backend powering the IntervueX platform — a real-time coding interview system with authentication, scheduling, chat, feedback, and payment management.**

🌐 **Live API:** [https://api.intervuex.akshaypnair.space/](https://api.intervuex.akshaypnair.space/)  
💻 **Frontend Website:** [https://intervuex.akshaypnair.space/](https://intervuex.akshaypnair.space/)

---

## 🏗️ Architecture Overview

The backend follows **Clean Architecture** and **SOLID Principles**, ensuring scalability, testability, and maintainability.

### 🧩 Layered Structure

| Layer | Description |
|-------|--------------|
| **Domain** | Defines **Entities**, **DTOs**, and **Interfaces** — pure business logic without dependencies. |
| **Application** | Implements **Use Cases**, **Mappers**, and **Error Handling**. Coordinates domain logic with infrastructure. |
| **Infrastructure** | Handles **Database**, **Repositories**, **External Services** (AWS, Email, Razorpay, Cloudinary, etc.), and **Schedulers**. |
| **Interfaces** | Contains **Controllers**, **Routes**, **Middlewares**, and **Sockets** for REST + WebSocket communication. |

📂 Folder breakdown:

```bash
src/
├── application/ # Core business logic (use-cases, mappers, errors)
├── domain/ # Entities, DTOs, and interfaces (pure domain layer)
├── infrastructure/ # Database, external services, schedulers
├── interfaces/ # Controllers, routes, middleware, sockets
├── utils/ # Helper utilities (logging, hashing, etc.)
├── app.ts # Express app setup
├── server.ts # Entry point
```

---

## 🚀 Features

✅ **Clean Architecture** following SOLID Principles  
✅ **TypeScript** with strict type safety  
✅ **JWT-based Authentication & Role Authorization**  
✅ **Google OAuth2 Login** for seamless sign-in  
✅ **OTP Verification** via Email  
✅ **Interview Booking System** with time slot management  
✅ **Real-Time Chat** using Socket.io  
✅ **Video Call Integration** between Interviewer and Candidate  
✅ **In-Call Real-Time Coding Compiler** (Collaborative Code Editor)  
✅ **Interview Feedback System**  
✅ **Razorpay Payment Gateway Integration**  
✅ **AWS S3** for Resume Uploads  
✅ **Cloudinary** for Image Uploads  
✅ **Cron-based Schedulers** for reminders and cleanup of expired bookings  
✅ **Integrated Logging & Monitoring** using **Grafana + Loki** via Docker  
✅ **CI/CD Pipeline** with **GitHub Actions → EC2 → Docker Compose**


---

## 🐳 Dockerized Setup

This backend runs in a **containerized environment** with integrated **Grafana** and **Loki** for observability.

### 🧱 Docker Compose Overview

- **backend** → Main Node.js API container  
- **loki** → Log aggregation system  
- **grafana** → Dashboard for metrics and logs  

### Run the entire stack

```bash
docker-compose up -d --build
```

---

## 🔗 Access

- **API:** [http://localhost:5000](http://localhost:5000)
- **Grafana:** [http://localhost:3001](http://localhost:3001)
- **Loki (internal):** [http://localhost:3100](http://localhost:3100)

---

## ⚙️ Local Development Setup

### 🧩 Prerequisites

- Node.js ≥ 20  
- TypeScript ≥ 5  
- MongoDB ≥ 6  
- Docker (for optional observability stack)  
- AWS S3 credentials (for resume uploads)  
- Razorpay credentials  

---

### 🪜 Installation

```bash
# 1. Clone the repository
git clone https://github.com/akshaypnair/intervuex-backend.git
cd intervuex-backend

# 2. Install dependencies
npm ci

# 3. Configure environment variables
cp src/config/.env.example src/config/.env

# 4. Run in development
npm run dev
```
Server will start on → **http://localhost:5000**

---

### 🔐 Environment Variables

Your `.env` file (`src/config/.env`) should contain the following:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/
ACCESS_TOKEN_SECRET=<your_jwt_secret>
RAZORPAY_KEY_ID=<razorpay_key>
RAZORPAY_KEY_SECRET=<razorpay_secret>
AWS_REGION=<region>
AWS_ACCESS_KEY_ID=<key_id>
AWS_SECRET_ACCESS_KEY=<secret>
S3_BUCKET_NAME=<bucket_name>
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
EMAIL_SERVICE=<smtp_service>
EMAIL_USER=<email_address>
EMAIL_PASS=<email_password>
FRONTEND_BASE_URL=https://intervuex.akshaypnair.space
```

---

## 📦 NPM Scripts

| Command         | Description                                             |
| --------------- | ------------------------------------------------------- |
| `npm run dev`   | Run the app in development mode using ts-node + nodemon |
| `npm run build` | Transpile TypeScript → JavaScript (dist/)               |
| `npm start`     | Run the compiled JS files in production                 |
| `npm run lint`  | Run ESLint checks (strict mode)                         |

---

## 🧰 Technologies Used

| Category         | Tech                              |
| ---------------- | --------------------------------- |
| **Language**     | TypeScript                        |
| **Framework**    | Express.js                        |
| **Database**     | MongoDB (Mongoose)                |
| **Auth**         | JWT + Google OAuth2               |
| **File Storage** | AWS S3, Cloudinary                |
| **Payments**     | Razorpay                          |
| **Scheduler**    | Node-cron-based Job System        |
| **Real-time**    | Socket.io                         |
| **Logging**      | Winston + Loki                    |
| **CI/CD**        | GitHub Actions + Docker + AWS EC2 |
| **Monitoring**   | Grafana                           |

---

## 🪄 Dockerfile
Multi-stage build for optimized production:

```dockerfile
# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
RUN addgroup -S app && adduser -S app -G app
USER app
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

---

## 📊 Grafana + Loki Integration

### 📁 `grafana-provisioning/datasources/datasource.yml`

```yaml
apiVersion: 1
datasources:
  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    isDefault: true
```
This automatically adds **Loki** as a data source to **Grafana**.  
Your logs (via **Winston-Loki** transport) will appear under Grafana’s **Explore** tab.

---

## ⚙️ CI/CD Pipeline

Automated deployment via **GitHub Actions → EC2 → Docker**.

### 📁 `.github/workflows/backend-deploy.yml`

```yaml
name: Docker Backend Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/IntervueX-backend
            git reset --hard
            git pull origin main
            docker-compose down
            docker-compose up -d --build
```

## 🧩 Folder Structure Snapshot

```bash
akshaypnair-intervuex-backend/
├── docker-compose.yml
├── Dockerfile
├── eslint.config.mjs
├── package.json
├── tsconfig.json
├── grafana-provisioning/
│ └── datasources/
│ └── datasource.yml
├── src/
│ ├── application/
│ ├── domain/
│ ├── infrastructure/
│ ├── interfaces/
│ ├── utils/
│ ├── app.ts
│ └── server.ts
└── .github/
└── workflows/
└── backend-deploy.yml
```

---

## 📈 Logging & Monitoring

- **Logger:** winston  
- **Transport:** winston-loki  
- **Dashboard:** Grafana  
- **Data Source:** Loki  

Each container logs to Loki and can be explored in Grafana at [http://localhost:3001](http://localhost:3001).

---

## 👨‍💻 Author

**Akshay P Nair**  
💼 MERN Stack Developer 

---

## 🧾 License

This project is licensed under the **MIT License** – feel free to use, modify, and distribute with attribution.

---

> “A scalable backend is not just about performance, but about clean boundaries — IntervueX proves both.” 🚀

---

## ⭐ Show your support

If you found this project helpful, please consider giving it a ⭐ on GitHub!

