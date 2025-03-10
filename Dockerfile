FROM node:20.13.1

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg

COPY . .

RUN npm ci \ 
    && npm install

RUN npm run build --if-present

COPY . .

EXPOSE 4000

CMD ["npm", "run", "start"]