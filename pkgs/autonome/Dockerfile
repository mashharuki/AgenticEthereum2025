# ベースイメージ
FROM node:18-alpine

# プロジェクトルートを変更する（任意）
WORKDIR /usr/src/app

# pnpmをグローバルインストール
RUN npm install -g pnpm

# フォルダの中身を全てコピーする
COPY ./ ./

# コピーしたファイルに node ユーザーの権限を付与
RUN chown -R node:node /usr/src/app

# 依存関係をインストール
RUN pnpm install --prod

## clone Coinbase AgentKit repository
RUN apk add --no-cache git
RUN git clone https://github.com/coinbase/agentkit.git

## install & build agentkit
RUN cd agentkit && npm install && npm run build

RUN cd ../

## update build files
RUN rm -rf node_modules/@coinbase/agentkit/dist/*
RUN cp -r agentkit/typescript/agentkit/dist/* node_modules/@coinbase/agentkit/dist/

# アプリを実行するユーザーを指定
USER node
EXPOSE 3000/tcp

# サーバーを起動する
CMD ["pnpm", "run", "dev", "&"]
