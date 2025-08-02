'use client'

import { useEffect, useState, useRef } from 'react'
import { useChatStore } from '@/store/chatStore'
import { Send, ArrowLeft, Users, Hash } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'

export function ChatRoom() {
  const [message, setMessage] = useState('')
  const [userType, setUserType] = useState<'buyer' | 'supplier'>('buyer')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { 
    currentRoom, 
    messages, 
    user, 
    sendMessage, 
    subscribeToMessages, 
    leaveRoom 
  } = useChatStore()

  useEffect(() => {
    if (!currentRoom) return
    
    const unsubscribe = subscribeToMessages(currentRoom.id)
    return unsubscribe
  }, [currentRoom, subscribeToMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim()) return
    
    try {
      await sendMessage(message, userType)
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  if (!currentRoom) return null

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={leaveRoom}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div>
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-semibold">{currentRoom.name}</h2>
              </div>
              <p className="text-sm text-gray-600">{currentRoom.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            Online
          </div>
        </div>
      </div>

      {/* Messages */}