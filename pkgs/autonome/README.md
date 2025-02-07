# API (built with Hono)

## How to work

- インストール

  ```bash
  pnpm install
  ```

- ローカルで起動

  ```bash
  pnpm run dev
  ```

- Docker コンテナをビルド

  `autonome-cdp-custom`という名前で`latest`をタグ付け

  ```bash
  docker build . -t autonome-cdp-custom:latest
  ```

  build for Autonome

  ```bash
  docker build --platform linux/amd64 -t autonome-cdp-custom:latest .
  ```

- Docker コンテナを起動

  ```bash
  docker run -p 3000:3000 --env-file .env autonome-cdp-custom:latest
  ```
  or

  ```bash
  docker run -p 3000:3000 --env-file .env haruki31067/autonome-cdp-custom:latest
  ```

  イメージ ID は以下で確認

  ```bash
  docker image ls
  ```

- Docker コンテナを停止

  ```bash
  docker stop <imageid>
  ```

  以下のコマンドでイメージ削除

  ```bash
  docker image rm -f <imageid>
  ```

- push to docker hub

  ```bash
  docker tag autonome-cdp-custom:latest haruki31067/autonome-cdp-custom:latest
  ```

  ```bash
  docker push haruki31067/autonome-cdp-custom:latest
  ```

  Published Container image

  [docker/haruki31067/autonome-cdp-custom](https://hub.docker.com/repository/docker/haruki31067/autonome-cdp-custom/general)
