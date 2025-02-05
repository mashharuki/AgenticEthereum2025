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

  `hono-vertexai-image`という名前で`latest`をタグ付け

  ```bash
  docker build . -t hono-vertexai-image:latest
  ```

- Docker コンテナを起動

  ```bash
  docker run -p 3000:3000 <imageid>
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
