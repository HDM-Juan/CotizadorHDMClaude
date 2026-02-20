FROM node:18-slim

# Install Python 3 and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip3 install requests --break-system-packages

# Set working directory
WORKDIR /app

# Copy package files and install Node dependencies
COPY package.json ./
RUN npm install --omit=dev

# Copy all project files
COPY . .

# Expose port
EXPOSE 3000

# Start the SerpAPI backend
CMD ["node", "sistema-cotizacion-profesional/backend/backend-serpapi-bridge.js"]
