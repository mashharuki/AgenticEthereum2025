# スマートコントラクト用フォルダ

## How to work

- ### **setUp**

  1.  You need to create `.env` file & fillout these values

      ```bash
      cp .env.example .env
      ```

      ```txt
      PRIVATE_KEY=""
      ```

  3.  install

      ```bash
      pnpm install
      ```

- ### **commands**

  - **compile**

    ```bash
    pnpm compile
    ```

  - **test**

    ```bash
    pnpm test
    ```

  - **deploy contract**

    ```bash
    pnpm deploy:Lock --network holesky
    ```

  - **verify contract**

    ```bash
    pnpm verify chain-1946
    ```

  - **get chain info**

    ```bash
    pnpm getChainInfo --network holesky
    ```

  - **get balance**

    ```bash
    pnpm getBalance --network holesky
    ```

  - **callReadMethod**

    ```bash
    pnpm callReadMethod --network holesky
    ```

  - **calWriteMethod**

    ```bash
    pnpm callWriteMethod --network holesky
    ```

