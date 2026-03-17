Finova – AI Powered Finance Management Platform 💰🤖

Finova is an AI-driven personal finance management platform that helps users track expenses, manage budgets, and generate smart financial insights using AI.
It automates financial tracking and provides intelligent reports to help users make better financial decisions.

🚀 Features
🧾 AI Receipt Scanner

Upload receipts

AI extracts transaction details automatically

Adds them to your expense tracker

📊 Smart Budget Tracking

Set monthly budgets

Track spending in different categories

Get alerts when limits are exceeded

🤖 AI Monthly Reports

Generates AI powered financial summaries

Shows spending patterns

Provides financial insights

🔔 Smart Notifications

Real-time toast notifications

Alerts for unusual transactions

Budget limit reminders

💳 Transaction Management

Add, edit, delete transactions

Categorized expense tracking

Automatic updates

🔐 Secure Authentication

User authentication using Clerk

Secure login and signup

🛠 Tech Stack

Frontend

Next.js

Tailwind CSS

ShadCN UI

Backend

Supabase

PostgreSQL

AI Integration

Google Gemini AI

Other Tools

Arcjet (Security)

Inngest (Background jobs)

Clerk Authentication

Lucide React Icons

📂 Project Architecture
Finova
 ├── app
 ├── components
 ├── lib
 ├── hooks
 ├── utils
 ├── database
 └── public
⚙️ Installation

Clone the repository

git clone https://github.com/hargb/finova.git

Go to project directory

cd finova

Install dependencies

npm install

Run development server

npm run dev
🌐 Environment Variables

Create .env.local

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

SUPABASE_URL=
SUPABASE_ANON_KEY=

GEMINI_API_KEY=
ARCJET_KEY=
