import { SignedIn, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/router";

export default function HeaderMenu() {
  const router = useRouter();

  return (
    <SignedIn>
      <header className="bg-white shadow-md py-4 mb-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span className="text-xl font-bold text-red-800 cursor-pointer" onClick={() => router.push("/")}>
            HumbleMePlz
          </span>
          <nav className="flex space-x-4 items-center">
            <button
              onClick={() => router.push("/myTips")} // Updated route to /myTips
              className="text-gray-700 hover:text-red-800"
            >
              My tips
            </button>
            <UserButton afterSignOutUrl="/" />
          </nav>
        </div>
      </header>
    </SignedIn>
  );
}