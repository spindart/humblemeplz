# 🙏 HumbleMePlz

## 🚀 About the Project

**HumbleMePlz** is a modern web application built with **Next.js 14** and **TypeScript**, designed to deliver a unique experience by integrating **AI** capabilities with **PDF generation**. It leverages the **OpenAI API** for natural language processing and **Stripe** for secure payment processing.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14  
- **Language:** TypeScript  
- **UI:** React + Tailwind CSS  
- **AI Integration:** OpenAI API  
- **PDF Generation:** PDFKit  
- **Payment Processing:** Stripe  
- **State Management / UI Components:** Headless UI  

---

## 📋 Requirements

- Node.js (v18 or higher)  
- npm or yarn  
- OpenAI API key  
- Stripe API keys  

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/HumbleMePlz.git
cd HumbleMePlz
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Copy the example environment file and configure your API keys:

```bash
cp .env.local.example .env.local
```

Fill in the required environment variables in `.env.local`:

```env
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Project Structure

```
HumbleMePlz/
├── components/       # Reusable React components
├── pages/            # Next.js pages
│   └── api/          # API routes (serverless functions)
├── public/           # Static assets
├── styles/           # Global styles (Tailwind config, etc.)
└── types/            # TypeScript type definitions
```

---

## 🛠️ Development Notes

- ✅ Hot Reloading  
- ✅ TypeScript with strict type-checking  
- ✅ ESLint for code linting  
- ✅ Tailwind CSS for rapid UI development  

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 🤝 Contributing

Contributions are welcome!  
Feel free to open an issue or submit a pull request.


