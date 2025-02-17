# Use Alpine base
FROM alpine:latest

# Set timezone
RUN apk add --no-cache tzdata
ENV TZ=Europe/Amsterdam
RUN cp /usr/share/zoneinfo/Europe/Amsterdam /etc/localtime

# Install dependencies
RUN apk add --no-cache nodejs npm powertop procps busybox-extras
RUN npm install -g socket.io express chart.js systeminformation

# Create app directory
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Configure permissions for PowerTOP
RUN chmod u+s /usr/sbin/powertop

# Expose web port
EXPOSE 88

# Start script with auto-tune and web server
CMD ["sh", "-c", "powertop --auto-tune & node server.js"]
