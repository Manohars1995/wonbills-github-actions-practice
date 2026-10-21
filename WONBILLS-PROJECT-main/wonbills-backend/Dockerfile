# -------------------------------
# WONBILLS Backend Dockerfile
# -------------------------------

# Use official Node.js 18 LTS image
FROM node:18-bullseye-slim

# Set working directory
WORKDIR /app

# Install build tools required for bcrypt & native deps
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first (for Docker cache)
COPY package.json package-lock.json ./

# Install dependencies (clean & reproducible)
RUN npm ci --build-from-source

# Copy application source code
COPY . .

# Expose application port
EXPOSE 8014

# Start the backend server
CMD ["npm", "start"]
