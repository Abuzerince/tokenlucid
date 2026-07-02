FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
ENV NODE_ENV=production PORT=5173 HOST=0.0.0.0
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/config ./config
COPY --from=build /app/package.json ./package.json
EXPOSE 5173
USER node
CMD ["npm", "start"]
