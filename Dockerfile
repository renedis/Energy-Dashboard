FROM alpine:latest

# Install system packages
RUN apk add --no-cache tzdata nodejs npm procps busybox-extras

# Set timezone
RUN cp /usr/share/zoneinfo/Europe/Amsterdam /etc/localtime
ENV TZ=Europe/Amsterdam

# Create app directory structure
WORKDIR /app
COPY package*.json ./

# Install Node.js dependencies
RUN apk add --no-cache powertop --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing
RUN npm install

# Copy application files
COPY . .

# Set PowerTOP permissions
RUN chmod u+s /usr/sbin/powertop

EXPOSE 88
CMD ["sh", "-c", "powertop --auto-tune & node server.js"]


