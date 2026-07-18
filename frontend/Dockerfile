# Stage 1: Build the static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy lock files and packages
COPY package.json package-lock.json* ./

# Install packages
RUN npm ci

# Copy code modules
COPY . .

# Compile application bundle
RUN npm run build

# Stage 2: Serve with light Nginx server
FROM nginx:stable-alpine

# Copy built outputs from stage 1 to nginx folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
