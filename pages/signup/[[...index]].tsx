import { SignUp } from "@clerk/nextjs";
import Head from "next/head";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <Head>
        <title>Sign Up - HumbleMePlz</title>
        <meta name="description" content="Create your HumbleMePlz account" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main className="flex-1 flex flex-col justify-center items-center container mx-auto px-4 py-8">
        <div className="w-full max-w-md">
          <h1 className="text-4xl sm:text-5xl font-title text-red-800 text-center mb-8 tracking-wide">
            HumbleMePlz
          </h1>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <SignUp routing="hash" />
          </div>
        </div>
      </main>
    </div>
  );
}