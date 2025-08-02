'use client'

import { useChatStore } from '@/store/chatStore'
import { KeywordSearch } from '@/components/KeywordSearch'
import { ChatRoom } from '@/components/ChatRoom'
import { AuthForm } from '@/components/AuthForm'

export default function HomePage() {
  const { user, currentRoom } = useChatStore()

  if (!user) {
    return <AuthForm />
  }

  if (currentRoom) {
    return <ChatRoom />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-8">
        <KeywordSearch />
      </div>
    </div>
  )
}