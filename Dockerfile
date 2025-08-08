FROM node:20.11.1 as base

WORKDIR /app

COPY package.json .

# -----------------------development stage--------------------------

FROM base as development 
#            ^___development here is the stage name we have given in the docker-compose-dev file to the field "target: development"
RUN npm install

COPY . .

CMD [ "npm", "run", "start:dev" ]

# -----------------------production stage--------------------------

FROM base as production
#            ^___production here is the stage name we have given in the docker-compose-prod file to the field "target: production"
RUN npm install --only=production

COPY . .

CMD [ "npm", "run", "start:prod"]
