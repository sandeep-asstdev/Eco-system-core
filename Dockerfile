FROM node:20-alpine

WORKDIR /app

# Copy shared packages needed for local file dependencies
COPY packages/ ./packages/

# Copy ecosystem-core backend package files
COPY ecosystem-core/backend/package*.json ./ecosystem-core/backend/

WORKDIR /app/ecosystem-core/backend

# Install dependencies including local sdk package
RUN npm install

# Copy Prisma schema and generate client
COPY ecosystem-core/backend/prisma ./prisma
RUN npx prisma generate

# Copy application source code
COPY ecosystem-core/backend/ ./

# Expose default port (Render will override via PORT env var)
EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
