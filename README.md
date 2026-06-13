E‑Commerce Project
=================

Overview
--------
A full-stack e-commerce demo: React (Vite) frontend, Node/Express backend, MySQL database. Features: product catalog, product detail, cart, orders, admin product management (image upload), authentication, theme toggle (dark mode).

Tech stack
----------
- Frontend: React + Vite, CSS variables
- Backend: Node.js, Express, Helmet, MySQL (mysql2)
- Auth: JWT (token stored client-side)
- Image storage: backend/uploads (current: base64 -> file), served statically

Prerequisites
-------------
- Node.js (>=18)
- npm
- MySQL server

Quick start (backend)
---------------------
1. Copy .env.example -> .env and set values:
   - NODE_ENV=development
   - PORT=3000
   - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
   - JWT_SECRET
   - FRONTEND_ORIGIN (e.g. http://localhost:5173)
2. Install and run:
   cd backend
   npm install
   npm run dev    # uses nodemon

Quick start (frontend)
----------------------
1. Set Vite env var (frontend/.env or system):
   VITE_API_URL=http://localhost:3000
2. Install and run:
   cd frontend
   npm install
   npm run dev     # starts Vite on :5173
3. Build for production:
   npm run build

Database migration
------------------
If you see errors like "Unknown column 'image'": add the image column:

ALTER TABLE Products ADD COLUMN image VARCHAR(255) NULL;

(Apply using your MySQL client.)

Image uploads
-------------
Current flow: frontend converts selected image to data URL (base64) and POST/PUTs it. Backend decodes and writes to backend/uploads, then returns path (/uploads/...). This is simpler for dev but not ideal for large files. Recommended production: switch to multipart uploads (multer) and store files on a blob store (S3) or serve with a CDN.

Security & production checklist
-------------------------------
- Set strong JWT_SECRET and other secrets in environment variables
- Run backend with NODE_ENV=production
- Configure FRONTEND_ORIGIN and tighten Helmet/CSP
- Use HTTPS and a reverse proxy (NGINX) in front of backend
- Limit request sizes and enable rate limiting (already present)
- Scan dependencies for known vulnerabilities

Deployment notes
----------------
- Build the frontend (npm run build) and serve via static host or behind nginx. Point VITE_API_URL to production API.
- Start backend with process manager (pm2/systemd) and ensure logs rotate.
- Consider Dockerizing both services for reproducible deploys.

Troubleshooting
---------------
- "Route not found /api/products": ensure backend is running and FRONTEND_API or VITE_API_URL points to correct host/port.
- "Unknown column 'image'": run migration above.
- Images 200 but not visible: check backend serves /uploads (server.js uses express.static). Check path prefixes and CSP/helmet settings.
- Cart/order price shows NaN: ensure backend returns numeric fields (subtotal) and frontend uses Number(...) before formatting.

Useful commands
---------------
- Backend: npm run dev  | npm start
- Frontend: npm run dev | npm run build
- DB: Run migration SQL via mysql cli or GUI

Next recommended improvements
---------------------------
- Switch to multipart uploads and S3 (or CDN) for images
- Add CI pipeline: lint, unit tests, build, and deploy
- Add Dockerfiles and docker-compose for local prod-like environment
- Add end-to-end tests and monitoring/alerts

Contact
-------
Project maintained by repository owner. For help, open an issue or contact the developer.
