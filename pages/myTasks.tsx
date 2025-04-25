import { useState } from 'react';
import Head from 'next/head';
import { KanbanBoard } from '../components/KanbanBoard';
import HeaderMenu from '../components/HeaderMenu';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';

export default function MyTasks() {
  const isClerkEnabled = process.env.NEXT_PUBLIC_CLERK_ENABLED === 'true';

  const renderContent = () => (
    <main className="container mx-auto px-4 py-8">
      <KanbanBoard />
    </main>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Head>
        <title>My Tasks - HumbleMePlz</title>
        <meta name="description" content="Manage your resume improvement tasks" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <HeaderMenu />
      
      {isClerkEnabled ? (
        <>
          <SignedIn>
            {renderContent()}
          </SignedIn>
          
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </>
      ) : (
        renderContent()
      )}
    </div>
  );
}