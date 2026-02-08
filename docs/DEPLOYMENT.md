# Deploying JustBack Platform

This guide covers everything you need to deploy the JustBack platform to production.

## 1. Backend Deployment (Docker)

The backend is fully containerized. To deploy to any server with Docker and Docker Compose:

1.  **Clone the repository** on your server.
2.  **Create a `.env.prod` file** in the `backend/` directory based on `.env.example`.
3.  **Run the following command**:
    ```bash
    docker-compose -f docker-compose.prod.yml up -d
    ```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure real database URLs (PostgreSQL, MongoDB, Redis)
- [ ] Update `API_KEY` for OpenAI and Twilio
- [ ] Update `PAYSTACK_SECRET_KEY` with live keys
- [ ] Configure SSL (using Nginx or similar)

## 2. Infrastructure
Deployment configurations are located in `infrastructure/`.
For production, we recommend using managed services for databases:
- **RDS (PostgreSQL)**
- **Atlas (MongoDB)**
- **Upstash/ElastiCache (Redis)**

## 3. Web Dashboards
Admin and Host dashboards are built with Vite + React. 
Deploy the `dist/` folder to any static hosting like **Vercel**, **Netlify**, or **GitHub Pages**.

```bash
cd admin-dashboard
npm install
npm run build
# Deploy 'dist/' folder
```
