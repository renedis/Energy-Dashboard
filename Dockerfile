FROM alpine:latest

# Install base packages
RUN apk add --no-cache tzdata nodejs npm powertop procps busybox-extras

# Set timezone
RUN cp /usr/share/zoneinfo/Europe/Amsterdam /etc/localtime
ENV TZ=Europe/Amsterdam

# Create app structure
WORKDIR /app

# Debugging: Show directory structure before copy
RUN echo "Pre-copy structure:" && ls -la

# Copy package files
COPY package*.json ./

# Debugging: Verify files were copied
RUN echo "Post-package copy contents:" && ls -la && cat package.json

# Install dependencies
RUN npm install --loglevel verbose

# Copy remaining files
COPY . .

# Final directory check
RUN echo "Final directory structure:" && ls -laR

# Set PowerTOP permissions
RUN chmod u+s /usr/sbin/powertop

EXPOSE 88
CMD ["sh", "-c", "powertop --auto-tune & node server.js"]
