FROM node:10.15.3-alpine
MAINTAINER Costa carmen@student.unimelb.edu.au

RUN addgroup -S nupp && adduser -S -g nupp nupp

ENV HOME=/home/nupp

COPY package*.json $HOME/app/

COPY dist/ $HOME/app/dist

WORKDIR $HOME/app

RUN chown -R nupp:nupp $HOME/* /usr/local/ && \

    npm install --silent --progress=false --production && \
    chown -R nupp:nupp $HOME/*

USER nupp

EXPOSE 3000

CMD  npm start
# CMD ["/wait","&&","npm", "start"]
