# --------------------------------------
# WONBILLS Frontend Dockerfile (Vite Dev - FIXED)
# --------------------------------------

FROM node:20-alpine

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# ❌ REMOVE build (not needed for dev)
 #RUN npm run build

# Expose Vite port
EXPOSE 5173

# ✅ FIX: Proper host + strict port + no crash
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]

