# Use a lightweight Node.js base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to take advantage of Docker's layer caching.
COPY package*.json ./

# Install all dependencies from package.json
# This will be much faster now that the platform-specific sharp installation is gone.
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to start the application with a watcher for development
CMD ["npm", "run", "start"]
