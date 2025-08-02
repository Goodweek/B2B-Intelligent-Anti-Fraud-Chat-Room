'use client'

import { useEffect } from 'react'
import { useChatStore } from '@/store/chatStore'
import { Toaster } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { loadUser, loadChatrooms } = useChatStore()

  useEffect(() => {
    // 初始化用户状态
    loadUser()
    loadChatrooms()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          await loadUser()
        } else if (event === 'SIGNED_OUT') {
          // 清理状态在store中已处理
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [loadUser, loadChatrooms])

  return (
    <>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  )
}