FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 9999

CMD ["./entrypoint.sh"]
