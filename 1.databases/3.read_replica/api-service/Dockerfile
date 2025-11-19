# Use the official Node.js 20-slim image for a smaller container size
FROM node:20-slim

# Create and set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if present) to leverage Docker cache
# This is done separately so npm install isn't run every time your code changes
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the port your Express app is listening on
EXPOSE 3000

# Command to run the application
CMD [ "node", "server.js" ]