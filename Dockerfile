# Step 1: Specify the base image
# We'll use an official Node.js image. The 'alpine' version is lightweight.
FROM node:18-alpine

# Step 2: Set the working directory inside the container
# This is where our application code will live.
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json
# Copying these first allows Docker to cache the installed dependencies.
COPY package*.json ./

# Step 4: Install the application's dependencies
# This runs 'npm install' inside the container.
RUN npm install

# Step 5: Copy the rest of the application code
# This copies server.js and any other files into the container.
COPY . .

# Step 6: Expose the port the app runs on
# Our server runs on port 3001, so we tell Docker to open it.
EXPOSE 3001

# Step 7: Define the command to run the application
# This is the command that will be executed when the container starts.
CMD [ "node", "server.js" ]