FROM node:12.22.12-alpine

ENV YARN_VERSION 1.22.0

RUN apk add shadow bash \
    && usermod --shell /bin/bash root \
    && apk del shadow

RUN apk add curl \
    && curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
    && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
    && ln -snf /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
    && ln -snf /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
    && rm yarn-v$YARN_VERSION.tar.gz \
    && apk del curl

RUN echo '{"allow_root": true}' > /root/.bowerrc

WORKDIR /app

COPY package.json yarn.lock bower.json /app/
RUN apk add git \
    && yarn install --frozen-lockfile \
    && yarn cache clean \
    && apk del git

COPY . /app/
