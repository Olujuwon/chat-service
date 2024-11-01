FROM node:21-alpine as builder
# Set the working directory to /app inside the container
WORKDIR /app
# Copy app files
COPY . .

# ==== BUILD =====
# Install dependencies (npm ci makes sure the exact versions in the lockfile gets installed)
RUN npm install

# Build the app
RUN npm run build

# ==== RUN =======
# Set the env to "production"
ENV DATABASE_URL=$DATABASE_URL
ENV ALGOLIA_APP_ID=$ALGOLIA_APP_ID
ENV ALGOLIA_API_KEY=$ALGOLIA_API_KEY
ENV REDIS_USERNAME=$REDIS_USERNAME
ENV REDIS_PASSWORD=$REDIS_PASSWORD
ENV REDIS_HOST=$REDIS_HOST
ENV JWT_SECRET=$JWT_SECRET
ENV OPEN_AI_API_KEY=$OPEN_AI_API_KEY
ENV REDIS_TTL=$REDIS_TTL

ENV FILE_ENCODING utf8
# Expose the port on which the app will be running (50001 is the default that `serve` uses)
EXPOSE 50001
# Start the app
CMD [ "npm", "start" ]