FROM node:18-slim

# Install python, ffmpeg, yt-dlp dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN pip3 install -U yt-dlp --break-system-packages

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install node dependencies
RUN npm install --production

# Copy source code
COPY . .

# Create downloads folder
RUN mkdir -p downloads

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
