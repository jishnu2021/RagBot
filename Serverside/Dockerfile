FROM node:18-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Create necessary directories
RUN mkdir -p /data/uploads /data/public

# Create symbolic links to the persistent directories
RUN ln -s /data/uploads uploads && ln -s /data/public public

# Expose the application port
EXPOSE ${PORT}

# Volume for persistent storage
VOLUME ["/data"]

# Start the application
CMD ["node", "server.js"] 