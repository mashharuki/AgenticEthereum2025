# AgenticEthereum2025

![Vercel Deploy](https://deploy-badge.vercel.app/vercel/agentic-ethereum2025)

[![CI Pipeline (Lint&Test&Build)](https://github.com/mashharuki/AgenticEthereum2025/actions/workflows/pipeline.yml/badge.svg)](https://github.com/mashharuki/AgenticEthereum2025/actions/workflows/pipeline.yml)

This repo for AgenticEthereum2024 (https://ethglobal.com/events/agents)

---

![](./docs/background.png)

## Architecture

![](./docs/architecture.png)

## Sequence

```mermaid
sequenceDiagram
    title: Sequence Diagram for Hackathon Application
    autonumber
    actor user as User
    participant frontend as Frontend
    participant userWallet as Privy or OnChainKit
    participant api as API Server
    participant agent1 as Social Trend Collection Specialist<br/>Agent
    participant agent2 as News and Fundamental Information Specialist<br/>Agent
    participant agent3 as Risk Management Agent<br/>Agent
    participant agent4 as Performance Monitoring Agent<br/>Agent<br/>(Signer Role)
    participant agent5 as Analysis and Strategy Agent<br/>Agent
    participant agent6 as Execution and Operation Agent<br/>Agent
    participant tools as Various Tools
    participant llm as Various LLMs
    participant blockchain as Blockchain
    user ->> frontend: Access
    frontend ->> userWallet: Create Wallet
    userWallet ->> frontend: Return Wallet Information
    frontend ->> user: Display Wallet Information
    frontend ->> api: Request to Start Live Discussion
    api ->> agent1: Create Social Trend Collection Specialist Agent
    api ->> agent2: Create News and Fundamental Information Specialist Agent
    api ->> agent3: Create Risk Management Agent
    api ->> agent4: Create Performance Monitoring Agent
    api ->> agent5: Create Analysis and Strategy Agent
    api ->> agent6: Create Execution and Operation Agent
    note over api, agent6: Start Live Discussion
    note over agent1, llm: Subsequent inferences will access external tools and LLMs
    user ->> frontend: Request to Write Chat Message
    frontend ->> api: Pass Chat Message as Prompt
    note over agent1, agent6: Discussion on User Input
    user ->> frontend: Request to Send Tips
    frontend ->> userWallet: Call Tip Processing
    userWallet ->> user: Request Signature
    user ->> userWallet: Execute Signature
    userWallet ->> blockchain: Send Transaction
    blockchain ->> userWallet: Return Execution Result
    userWallet ->> frontend: Return Execution Result
    frontend ->> user: Return Execution Result
    agent6 ->> blockchain: Check Balance
    blockchain ->> agent6: Return Balance
    note over agent1, agent6: Discussion Based on Balance Information
    agent6 ->> blockchain: Call DeFi Swap Function, etc.
    blockchain ->> agent6: Return Execution Result
    note over agent1, agent6: Discussion Based on Execution Result
    note over api, agent6: End Live Discussion
```

## Live Demo

[https://agentic-ethereum2025.vercel.app/](https://agentic-ethereum2025.vercel.app/)

## Overview

Tracking Web3 trends requires a significant amount of time and effort for many people, even for those who are somewhat knowledgeable about Web3.

Moreover, the task of summarizing these trends in a concise and easy-to-understand manner becomes an even greater burden.

Ultimately, even if we incorporate AI agents, human knowledge is still needed when thinking of prompts. We believe that simply adding AI agents won't lead to a dramatic improvement in UI/UX.

To solve this issue, we propose a new approach: "Interactive Discussions Between AI Agents" and "User-Participation Live Discussions".

- **Features:**

  - **AI Agent Discussions:**

    AI agents discuss trending topics in real-time, offering users new perspectives and insights.

  - **User Participation:**

    Users can join the discussion via chat, and influence the AI agents' discussions and behavior through tipping.

  - **Live Experience:**

    Incorporating elements from platforms like NicoNico, users can enjoy discussions and efficiently gather information in a real-time streaming environment.

- **Value Offered:**

  - **Efficient Information Gathering:**

    Provides easy-to-understand summaries of large amounts of information related to trends, reducing users' burden.

  - **Interactive Entertainment:**

    Not only can users observe AI agents' discussions, but they can also influence the discussions through tipping or chatting, creating a new entertainment experience.

  - **Global Access:**

    Users from around the world can participate in real-time, creating a space to share diverse perspectives.

  - **Beginner-Friendly:**

    By including an agent focused on beginner-level crypto asset topics in live discussions, simple questions and exchanges can be automatically handled.

## The applied  prizes

### Autonome - $20000

We are submitting this product for the 🤖 Best DeFAI Agent 💰🤖 category, with a prize of $7,000.

We extended the Agent Kit provided by the Coinbase Developer Platform by implementing an external tool to interact with the AAVE Protocol. Additionally, we developed an API using Hono and chose Autonome as the hosting platform.

The hosted API can be accessed by executing the methods below.

```yaml
# API Endpoint
@baseUrl=https://autonome.alt.technology/cdpagent-tinblo

### POST Request
POST {{baseUrl}}/runCdpChatMode
Content-Type: application/json
Authorization: Basic Y2RwYWdlbnQ6elhyZVVoV2xxUw==

{
  "prompt": "What is my wallet's balance (EURC) now?"
}
```

We have also uploaded a custom framework for this project.

[Uploaded Framework - cdp-custom](https://apps.autono.meme/autonome/new?template=e57de5de-00e6-47c2-8e5e-ebdfbcda589b)

To meet the submission requirements, we have uploaded a detailed demo video to YouTube.

[Youtube - Demo Video for Autonome]()

The source code is stored under the `pkgs/autonome` directory.

### Coinbase Developer Platform - $20000

We are submitting this product for the 🤯 Most Innovative Use of AgentKit ⸺ $7,500 category.

We extended the Agent Kit provided by the Coinbase Developer Platform by implementing an external tool for the AAVE Protocol, which was also listed on the Wishlist. Additionally, we developed an API using Hono.

The hosted API can be called by executing the methods below.

In addition to retrieving token balances, AI Agents can execute AAVE's lending functions.

```yaml
@baseUrl=https://autonome.alt.technology/cdpagent-tinblo

### POST Request
POST {{baseUrl}}/runCdpChatMode
Content-Type: application/json
Authorization: Basic Y2RwYWdlbnQ6elhyZVVoV2xxUw==

{
  "prompt": "If the Available Borrow Amount of the account is 0.01 USDC or more, please borrow USDC using it as collateral. Include the following in the results: - The account's updated collateral status - Transaction hash   - Transaction status"
}

## "prompt": "What is my wallet's balance (ETH & USDC) now?"
## "prompt": "What is my wallet's balance (EURC) now?"
## "prompt": "Please tell me abount my account data on AAVE protocol."
## "prompt": "Cloud you fund ETH (faucet) to my wallet on base-sepolia?"
## "prompt": "Cloud you send 0.001ETH from my wallet to 0x51908F598A5e0d8F1A3bAbFa6DF76F9704daD072?"
## "prompt": "Please sign message to 'Hi, I'm a human.' "
## "prompt": "If the account holds more than 5 USDC, lend it to the AAVE protocol. Include the following in the results: - The account's updated collateral status - Transaction hash   - Transaction status"
## "prompt": "If the Available Borrow Amount of the account is 1 USDC or more, please borrow USDC using it as collateral. Include the following in the results: - The account's updated collateral status - Transaction hash   - Transaction status"
```

For detailed information on the implementation of the external tool, please refer to the files listed below.

[pkgs/autonome/src/lib/tools/cdp/cdpAaveTool.ts](https://github.com/mashharuki/AgenticEthereum2025/blob/main/pkgs/autonome/src/lib/tools/cdp/cdpAaveTool.ts)

### EigenLayer - $20000

We are submitting this product for the 🃏 Eigen Agents ⸺ $20,000 category.

For this hackathon, we developed an external tool to enable AI Agents to automatically perform staking and re-staking operations by interacting with Lido and EigenLayer contracts.

These external tools can be integrated with various LLMs by combining them with frameworks like LangChain.

For detailed information on the implementation of the external tools, please refer to the files listed below.

- LidoTool:

  [pkgs/api/src/lib/agent/tools/holesky/lidoTool.ts](https://github.com/mashharuki/AgenticEthereum2025/blob/main/pkgs/api/src/lib/agent/tools/holesky/lidoTool.ts)

- EigenLayerTool

  [pkgs/api/src/lib/agent/tools/holesky/eigenlayerTool.ts](https://github.com/mashharuki/AgenticEthereum2025/blob/main/pkgs/api/src/lib/agent/tools/holesky/eigenlayerTool.ts)

### Privy - $5000

We are submitting this product for the 📲 Best Consumer Experience Built with Server Wallets ⸺ $3,000 category.

For wallet management for AI Agents, we chose Privy's Server Wallet.

Many sample codes for AI Agents embed private keys as environment variables, which we believe poses significant security risks. To ensure secure and easy management of the keys operated by AI Agents, we adopted Server Wallets.

When AI Agents call external tools to interact with contracts such as AAVE Protocol and Uniswap, transactions are handled using Wallet instances generated by the Server Wallet.

You can check the source code using Server Wallet at the link below.

[pkgs/api/src/lib/wallet/privy.ts](https://github.com/mashharuki/AgenticEthereum2025/blob/main/pkgs/api/src/lib/wallet/privy.ts)

[pkgs/api/src/lib/agent/tools/sepolia/uniswapTool.ts](https://github.com/mashharuki/AgenticEthereum2025/blob/main/pkgs/api/src/lib/agent/tools/sepolia/uniswapTool.ts#L47-L73)

## How it's Made

### **Frontend:**

  The frontend is developed using Next.js and Coinbase's OnChainKit.

  Users can seamlessly create wallets through SmartWallet functionality.

  They can also send small amounts of cryptocurrency to the server wallet for AI Agents using a tipping feature.

### **Backend:**

  The backend consists of two components:

  - **Customized CDP Agent Kit API Server:**

    This server is hosted on Autonome and is customized for the CDP Agent Kit.

    In addition to the standard features, we integrated external tools to support operations with the AAVE Protocol for this hackathon.

    We also published a customized Agent Kit framework on Autonome.

  - **Custom API Server on Cloud Run:**

    The server uses Hono as the framework for API development.

    It implements AI Agent logic using Agent Kits from LangChain, LangGraph, and VertexAI.

    Multiple LLMs, including Gemini, Llama, OpenAI, and Claude, are used to foster dynamic discussions about Web3 and cryptocurrencies.

    These models are selected based on specific needs to enhance discussions.

### **AI Agents with Six Roles:**

  The AI Agents are assigned six distinct roles for effective discussions:

  - **Social Trend Collection Specialist**
  - **News and Fundamental Information Specialist**
  - **Risk Management Agent**
  - **Performance Monitoring Agent**
  - **Analysis and Strategy Agent**
  - **Execution and Operation Agent**
