RecipeFindr 🍳
Discover delicious recipes tailored to the ingredients you already have. RecipeFindr helps reduce food waste by turning your kitchen inventory into meal ideas — powered by AI and built with modern web tech.

✨ Features
Ingredient-Based Recipe Search
Input your available ingredients manually or through a smart upload feature to get relevant recipes instantly.

AI-Powered Assistance
Integrated with OpenRouter.ai for conversational help, recipe suggestions, substitutions, and step-by-step cooking guidance.

Full-Stack TypeScript
Clean, scalable codebase with React frontend and Node.js + Express backend — both written in TypeScript.

MySQL Database
Robust and reliable storage for users, recipes, and preferences.

Modern UI
A sleek React interface with responsive design and intuitive navigation.

🛠 Tech Stack
Layer	Technology
Frontend	React + TypeScript
Backend	Node.js + Express (TypeScript)
Database	MySQL
AI API	OpenRouter.ai

🚀 Getting Started
Prerequisites
Node.js (v16+)

MySQL database

OpenRouter.ai API key

Installation
Clone the repo

bash
Copy
Edit
git clone https://github.com/John2206/RecipeFindr.git
cd RecipeFindr
Install dependencies

bash
Copy
Edit
npm install
Configure environment variables

Create a .env file in the root directory and add:

ini
Copy
Edit
OPENROUTER_API_KEY=your_openrouter_api_key
DATABASE_URL=mysql://user:password@host:port/database_name
PORT=4000
Set up the database

Make sure your MySQL database is running and the schema is ready. Use any migration or setup scripts provided, or run:

bash
Copy
Edit
# Example for running migrations (if Prisma or similar is used)
npx prisma migrate deploy
Start the development servers

bash
Copy
Edit
npm run dev
This should launch both backend (Express) and frontend (React) with hot reload.

📂 Project Structure
bash
Copy
Edit
/RecipeFindr
│
├─ /apps
│   ├─ /web         # React + TypeScript frontend
│   └─ /api         # Node + Express backend in TypeScript
│
├─ /prisma          # Database schema and migrations (if using Prisma)
├─ /packages        # Shared components and utilities
└─ .env             # Environment variables (not committed)
📦 Scripts
Command	Description
npm run dev	Runs frontend and backend in dev mode
npm run build	Builds frontend and backend for prod
npm run start	Starts compiled backend server
npm run format	Formats code with Prettier

🔒 Environment Variables
OPENROUTER_API_KEY: API key for AI-powered features

DATABASE_URL: MySQL connection string

PORT: Backend server port (default 4000)

🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to fork the repo and submit a pull request.

📄 License
This project is licensed under the MIT License.

🙌 Thank You!
RecipeFindr is your smart kitchen assistant — turning ingredients into delicious meals with the help of AI and clean code. Happy cooking!

If you want, I can also help you generate badges (build status, license, etc.) or customize this README further! Would you like that?






You said:
it should have less text and should have more visuals 


ChatGPT said:
Got it! Here's a concise, visually appealing README with badges and clear sections—easy to scan and GitHub-friendly:

RecipeFindr 🍳




What is RecipeFindr?
A smart app that turns your kitchen ingredients into tasty recipes, powered by AI.

⚡ Key Features
🔍 Search recipes by ingredients

🤖 AI assistant using OpenRouter.ai

🔥 Modern React + TypeScript frontend

🚀 Node.js + Express backend in TypeScript

💾 MySQL database for storage

🚀 Quick Start
bash
Copy
Edit
git clone https://github.com/John2206/RecipeFindr.git
cd RecipeFindr
npm install
cp .env.example .env
# Add your API keys & DB details in .env
npm run dev
📁 Project Structure
bash
Copy
Edit
/apps
  ├─ /web     # React + TS frontend
  └─ /api     # Express + TS backend
/prisma      # DB schema & migrations
/packages    # Shared utils & UI
🔧 Environment Variables
Name	Description
OPENROUTER_API_KEY	AI API key from OpenRouter.ai
DATABASE_URL	MySQL connection string
PORT	Backend server port (default 4000)

📄 License
MIT © RecipeFindr Team

