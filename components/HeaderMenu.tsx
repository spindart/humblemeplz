import { SignedIn, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/router";

export default function HeaderMenu() {
  const router = useRouter();
  const isClerkEnabled = process.env.NEXT_PUBLIC_CLERK_ENABLED === 'true';

  return (
    isClerkEnabled ? (
      <SignedIn>
        <header className="bg-white shadow-md py-4 mb-6">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <span className="text-xl font-bold text-red-800 cursor-pointer" onClick={() => router.push("/")}>
                HumbleMePlz
              </span>
              <nav className="flex space-x-4 items-center">
                <button
                  onClick={() => router.push("/myTasks")}
                  className="text-gray-700 hover:text-red-800"
                >
                  My tasks
                </button>
                <button
                  onClick={() => router.push("/myResumes")}
                  className="text-gray-700 hover:text-red-800"
                >
                  My résumés
                </button>
              </nav>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
      </SignedIn>
    ) : null
  );
}