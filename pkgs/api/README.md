# API (built with Hono)

## How to work

- Install

  ```bash
  pnpm install
  ```

- start at local

  ```bash
  pnpm run dev
  ```

- Build Docker Contrainer Image

  ```bash
  docker build . -t hono-vertexai-image:latest
  ```

- Run Docker Contrainer

  ```bash
  docker run -p 3000:3000 <imageid>
  ```

  get Image ID

  ```bash
  docker image ls
  ```

- Stop Docker Contrainer

  ```bash
  docker stop <imageid>
  ```

  remove Docker Contrainer Iamge

  ```bash
  docker image rm -f <imageid>
  ```
