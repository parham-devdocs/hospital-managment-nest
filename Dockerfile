# Dockerfile.dev
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# ✅ Use root user (remove USER node lines)
# USER node  # <-- COMMENT THIS OUT

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./
COPY pnpm-lock.yaml* ./
RUN chmod -R u+rwx .
# Install dependencies
RUN npm i

# Copy source as root
COPY . .

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Expose ports
EXPOSE 3000 9229

# Run as root
# USER node  # <-- COMMENT THIS OUT
CMD ["npm", "run", "start:dev"]