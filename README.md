# Crush Token Radar

Token Radar is an Next JS trading platform that app supports cross-chain trading, allowing users to easily trade and exchange various tokens across different blockchain networks. 

## Features

- View trending tokens
- View new token pairs
- View token details
  - Price chart
  - Social mentions
  - Holders overtime
  - Security score
  - Twitter recycle
  - Social dominance
  - Top influencer
  - Search token contract address or ticker on X
  - Top holders with their common holdings
  - Holders bubblemaps
  - Market intelligence (track alpha call)
  - Insiders
  - User trades for specific token
- View alpha feed
- Update alpha feed preferences
- View token watchlist
- Add and remove token from watchlist
- View referral status
- View wallet balances
- View wallet activities
- Withdraw token 
- Buy and sell token from supported chains:
  - Solana
  - Ethereum mainnet
  - Base (coming soon)
  - BSC (coming soon)
  - Hyperliquid (coming soon)
- View automated trading strategies
- Create automated trading strategy
- Update automated trading strategy
- Delete automated trading strategy
- PWA supports for mobile trading

## Getting Started

### Prerequisites

- Node.js (v20+)
- npm (v10+) / pnpm (v9+)
- Privy app ID and secret
- Internal backend API URL and key 

### Installing

1. Clone the repository:

    ```bash
    git clone https://github.com/crush-protocol/token-radar.git
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Copy `.env.example` file in the root directory and update the value:

    ```bash
    cp .env.example .env
    ```

5. Start the app:

    ```bash
    npm run dev
    ```

### Scripts

- `npm run start`: Runs the app.
- `npm run dev`: Runs the app in development mode.
- `npm run build`: Build and bundle the app.
- `npm run lint`: Runs ESLint to check for errors.

## Dependencies

Key dependencies:

- `next`: Web development framework.
- `tailwindcss`: A utility-first CSS framework
- `@tanstack/react-query`: Asynchronous state management for React.
- `@tanstack/reat-table`: Headless UI for building tables.
- `@privy-io`: Handle authentication.

Backend dependencies:

- [Token Radar Backend](https://github.com/crush-protocol/token-radar-backend)
  - Related .env key: BACKEND_API_URL & BACKEND_API_KEY

- [Referral Backend](https://github.com/crush-protocol/crush-referral-backend)
  - Related .env key: REFERRAL_BACKEND_API_URL & REFERRAL_BACKEND_API_KEY

- [Bridge Backend](https://github.com/crush-protocol/crush-bridge-server)
  - Related .env key: BRIDGE_API_URL & BRIDGE_API_KEY

- [User Backend](https://github.com/crush-protocol/crush-ucenter-backend)
  - Related .env key: USER_BACKEND_API_URL & USER_BACKEND_API_KEY

- Ignas Backend 
  - Related .env key: IGNAS_BACKEND_API_URL & IGNAS_BACKEND_API_KEY

## Development Tools

- `eslint`: Linting for TypeScript.
- `prettier`: Code formatting.

## License

This project by Crush AI - all rights reserved. See the LICENSE file for details.
 
