FROM node:20-alpine

# Install OpenSSL and libc compatibility for Prisma on Alpine Linux
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
