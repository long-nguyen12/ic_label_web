# FROM node:14.21-alpine3.16 as build-step
# RUN apk add --update --no-cache autoconf libtool automake nasm gcc make g++ zlib-dev tzdata
# WORKDIR /app

# COPY ["package.json", "package-lock.json*", "./"]
# # RUN yarn import
# RUN yarn install
# RUN yarn add cross-env

# COPY . .
# RUN yarn run build

# FROM nginx:1.18.0-alpine
# RUN apk update && apk add tzdata
# ENV TZ=Asia/Ho_Chi_Minh
# COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=build-step /app/build /usr/share/nginx/html
# CMD ["nginx", "-g", "daemon off;"]
# EXPOSE 80

# FROM node:14.21-alpine3.16 as build-step
# RUN apk add --update --no-cache autoconf libtool automake nasm gcc make g++ zlib-dev tzdata
# WORKDIR /app
# COPY package.json .
# RUN yarn install
# COPY . .
# RUN yarn run build

# CMD ["npm", "run", "start:web"]

FROM node:14-alpine3.10 as build-step
RUN apk add --update --no-cache autoconf libtool automake nasm gcc make g++ zlib-dev tzdata
WORKDIR /app
COPY package.json .
RUN yarn install
COPY . .
RUN yarn run build

CMD ["npm", "run", "start:web"]
