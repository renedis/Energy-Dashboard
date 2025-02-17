FROM alpine:latest

# Install dependencies
RUN apk add --no-cache tzdata nodejs npm procps busybox-extras && \
    apk add --no-cache powertop --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing

# Set timezone
ENV TZ=Europe/Amsterdam
RUN cp /usr/share/zoneinfo/Europe/Amsterdam /etc/localtime

# Create app directory
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Set PowerTOP permissions
RUN chmod u+s /usr/sbin/powertop

EXPOSE 88
CMD ["sh", "-c", "powertop --auto-tune & node server.js"]
