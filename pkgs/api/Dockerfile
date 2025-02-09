# Base image
FROM node:18-alpine

# Change project route (optional)
WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

# Copy all the contents of a folder
COPY ./ ./

# Grant node user permissions to the copied file
RUN chown -R node:node /usr/src/app

# Install dependencies
RUN pnpm install --prod

# Specify the user who will run the application
USER node
EXPOSE 3000/tcp

# Start the server
CMD ["pnpm", "run", "dev"]
