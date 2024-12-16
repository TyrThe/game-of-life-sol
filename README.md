
# Solana Game of Life Visualizer

A creative visualization tool that transforms Solana blockchain transactions into Conway's Game of Life patterns, creating unique visual representations of blockchain activity.

## Features

- Real-time transaction visualization using Conway's Game of Life
- Pattern classification system (Common, Rare, Epic, Legendary)
- Interactive grid interface with detailed pattern information
- Population and lifecycle tracking for each pattern
- Direct links to Solscan for transaction details
- Responsive design with infinite scroll
- Modern, minimalist UI with smooth animations

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Solana API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/TyrThe/solana-game-of-life-sol.git
cd solana-game-of-life-sol
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SOLSCAN_API_KEY=your_api_key_here
NEXT_PUBLIC_TOKEN_ADDRESS=your_token_address
```

4. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.


## Technologies Used

- Next.js 13+
- React 19
- TypeScript
- Tailwind CSS
- Solana Web3.js
- Conway's Game of Life Algorithm

## How It Works

1. **Transaction Fetching**: The application fetches Solana blockchain transactions in real-time.
2. **Pattern Generation**: Each transaction's hash is used as a seed to generate a unique Game of Life pattern.
3. **Pattern Evolution**: Patterns evolve according to Conway's Game of Life rules.
4. **Classification**: Patterns are classified based on their complexity and characteristics.
5. **Visualization**: Each pattern is rendered in a grid with real-time updates.

## Pattern Types

- **Common**: Basic patterns with low complexity
- **Rare**: Patterns with interesting formations
- **Epic**: Complex, evolving patterns
- **Legendary**: Highly unique and complex patterns

## Contributing

Feel free to submit issues and pull requests. For major changes, please open an issue first to discuss what you would like to change.

## Acknowledgments

- John Conway for the Game of Life
- Solana blockchain for transaction data
- Next.js team for the framework

## Contact

GLSOL - [@yourtwitter](https://x.com/GameLifeSOL)
=======
# solana-game-of-life
>>>>>>> ebc86348befcd57a085041e17659fe0a3f133328
