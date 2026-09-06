import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  Globe,
  Zap,
} from "lucide-react";

// Stats Data
export const statsData = [
  {
    value: "AI-Powered",
    label: "Financial Insights",
  },
  {
    value: "100%",
    label: "Secure & Private",
  },
  {
    value: "24/7",
    label: "Automated Tracking",
  },
  {
    value: "Smart",
    label: "Budget Management",
  },
];

// Features Data
export const featuresData = [
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "Advanced Analytics",
    description:
      "Understand your spending patterns with clear analytics and AI-powered financial insights.",
  },
  {
    icon: <Receipt className="h-8 w-8 text-blue-600" />,
    title: "Smart Receipt Scanner",
    description:
      "Extract transaction details from receipts automatically using AI-powered receipt processing.",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "Budget Planning",
    description:
      "Set monthly budgets and receive alerts when your spending approaches your budget limit.",
  },
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "Multi-Account Support",
    description:
      "Manage multiple financial accounts and keep your transactions organized in one place.",
  },
  {
    icon: <Globe className="h-8 w-8 text-blue-600" />,
    title: "Multi-Currency Ready",
    description:
      "Build a flexible finance platform that can support multiple currencies as your needs grow.",
  },
  {
    icon: <Zap className="h-8 w-8 text-blue-600" />,
    title: "Automated Insights",
    description:
      "Get automated financial summaries and actionable recommendations based on your spending.",
  },
];

// How It Works Data
export const howItWorksData = [
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "1. Create Your Account",
    description:
      "Sign up securely and create your Finova account in just a few steps.",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "2. Track Your Spending",
    description:
      "Add accounts and transactions to keep your income and expenses organized.",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "3. Get Financial Insights",
    description:
      "Use analytics, budgets, automated alerts, and AI-powered insights to make smarter financial decisions.",
  },
];

// Testimonials Data
export const testimonialsData = [
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    image: "https://randomuser.me/api/portraits/women/75.jpg",
    quote:
      "Finova makes it easier to keep track of my spending and understand where my money is going.",
  },
  {
    name: "Michael Chen",
    role: "Freelancer",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    quote:
      "The receipt scanning workflow makes entering expenses much faster than doing everything manually.",
  },
  {
    name: "Emily Rodriguez",
    role: "Finance Professional",
    image: "https://randomuser.me/api/portraits/women/74.jpg",
    quote:
      "Having transactions, budgets, and financial insights together makes managing my finances much simpler.",
  },
];