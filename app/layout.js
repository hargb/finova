import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";
import Header from "@/components/ui/header";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Finova | AI-Powered Finance Management",
  description:
    "Finova is an AI-powered personal finance management app to track accounts, transactions, budgets, and recurring expenses.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Header />

          <main className="min-h-screen">
            {children}
          </main>

          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made with 💚 by Harsh</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}