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

## Clone Coinbase AgentKit repository
RUN apk add --no-cache git
RUN git clone https://github.com/coinbase/agentkit.git

## install & build agentkit
RUN cd agentkit && npm install && npm run build

RUN cd ../

## update build files
RUN rm -rf node_modules/@coinbase/agentkit/dist/*
RUN cp -r agentkit/typescript/agentkit/dist/* node_modules/@coinbase/agentkit/dist/

# Specify the user who will run the application
USER node
EXPOSE 3000/tcp

# Start the server
CMD ["pnpm", "run", "dev", "&"]
