# API (built with Hono)

## How to work

- Instal

  ```bash
  pnpm install
  ```

- start at local

  ```bash
  pnpm run dev
  ```

- Build Docker Contrainer Image

  ```bash
  docker build . -t autonome-cdp-custom:latest
  ```

  build for Autonome

  ```bash
  docker build --platform linux/amd64 -t autonome-cdp-custom:latest .
  ```

- Run Docker Contrainer

  ```bash
  docker run -p 3000:3000 --env-file .env autonome-cdp-custom:latest
  ```
  or

  ```bash
  docker run -p 3000:3000 --env-file .env haruki31067/autonome-cdp-custom:latest
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

- push to docker hub

  ```bash
  docker tag autonome-cdp-custom:latest haruki31067/autonome-cdp-custom:latest
  ```

  ```bash
  docker push haruki31067/autonome-cdp-custom:latest
  ```

  Published Container image

  [docker/haruki31067/autonome-cdp-custom](https://hub.docker.com/repository/docker/haruki31067/autonome-cdp-custom/general)
