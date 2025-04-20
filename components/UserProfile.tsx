import { useUser } from "@clerk/nextjs";

export const UserProfile = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
      <div className="flex items-center space-x-4">
        <img 
          src={user.imageUrl} 
          alt="Profile" 
          className="w-16 h-16 rounded-full"
        />
        <div>
          <h2 className="text-xl font-semibold">{user.fullName || 'User'}</h2>
          <p className="text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>
    </div>
  );
};