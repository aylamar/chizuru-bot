# Use the official Node.js image as the base image
FROM node:22-alpine3.21

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npx prisma generate

# Build the application
RUN npm run build

# Environment variables
ENV DISCORD_TOKEN=
ENV TWITCH_CLIENT_ID=
ENV TWITCH_SECRET=
ENV GUILD_ID=
ENV DATABASE_URL=
ENV LAMAR_ID=
ENV NODE_ENV="production"

# Command to run the application
CMD ["npm", "run", "start"]
