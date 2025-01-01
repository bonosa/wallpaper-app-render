# Use a base image with Node.js 22
FROM node:22

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set the working directory
WORKDIR /app

# Copy the application files
COPY . .

# Install Node.js dependencies
RUN npm install

# Install Python dependencies using python3 -m pip
RUN python3 -m pip install -r requirements.txt

# Run the application
CMD ["sh", "-c", "concurrently 'python3 mvp-lock.py' 'node server.js' 'npm start'"]