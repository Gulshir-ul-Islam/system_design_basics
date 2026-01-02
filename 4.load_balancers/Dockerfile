FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy the local code into the container
COPY . .

# Expose ports (LB uses 80, Servers use 3000)
EXPOSE 80 3000

# We override the 'CMD' in docker-compose.yml for each service