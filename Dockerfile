FROM node:20.11.1 as base

WORKDIR /app

COPY package.json .

# -----------------------development stage--------------------------

FROM base as development

RUN npm install

COPY . .

CMD [ "npm", "run", "start:dev" ]

# -----------------------production stage--------------------------

FROM base as production

RUN npm install --only=production

COPY . .

CMD [ "npm", "run", "start:prod"]
