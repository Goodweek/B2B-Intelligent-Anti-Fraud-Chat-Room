import { create } from 'zustand'
import { supabase, type ChatRoom, type Message } from '@/lib/supabase'
import Fuse from 'fuse.js'
import toast from 'react-hot-toast'
import { calculateSimilarity } from '@/lib/utils'

interface SearchResult extends ChatRoom {
  similarity: number
  isNew?: boolean
}

interface ChatStore {
  // State
  chatrooms: ChatRoom[]
  messages: Message[]
  currentRoom: ChatRoom | null
  user: any
  loading: boolean
  
  // Actions
  loadChatrooms: () => Promise<void>
  searchChatrooms: (keywords: string[]) => SearchResult[]
  createChatroom: (name: string, keywords: string[], description: string) => Promise<ChatRoom>
  joinChatroom: (room: ChatRoom) => void
  leaveRoom: () => void
  
  // Messages
  loadMessages: (roomId: string) => Promise<void>
  sendMessage: (content: string, userType: 'buyer' | 'supplier') => Promise<void>
  subscribeToMessages: (roomId: string) => () => void
  
  // Auth
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, userType: 'buyer' | 'supplier') => Promise<void>
  signOut: () => Promise<void>
  loadUser: () => Promise<void>
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chatrooms: [],
  messages: [],
  currentRoom: null,
  user: null,
  loading: false,

  loadChatrooms: async () => {
    try {
      set({ loading: true })
      const { data, error } = await supabase
        .from('chatrooms')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      set({ chatrooms: data || [] })
    } catch (error) {
      toast.error('Failed to load chatrooms')
    } finally {
      set({ loading: false })
    }
  },

  searchChatrooms: (keywords: string[]): SearchResult[] => {
    const { chatrooms } = get()
    const query = keywords.join(' ').toLowerCase()
    
    // 使用Fuse.js进行模糊搜索
    const fuse = new Fuse(chatrooms, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'keywords', weight: 0.4 },
        { name: 'description', weight: 0.2 }
      ],
      threshold: 0.4,
      includeScore: true
    })
    
    const results = fuse.search(query)
    
    return results.map(result => ({
      ...result.item,
      similarity: Math.round((1 - (result.score || 0)) * 100)
    })).sort((a, b) => b.similarity - a.similarity)
  },

  createChatroom: async (name: string, keywords: string[], description: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('chatrooms')
        .insert([{
          name,
          keywords,
          description,
          type: 'product',
          created_by: user?.id
        }])
        .select()
        .single()
      
      if (error) throw error
      
      // 更新本地状态
      set(state => ({
        chatrooms: [data, ...state.chatrooms]
      }))
      
      toast.success('Chatroom created successfully!')
      return data
    } catch (error) {
      toast.error('Failed to create chatroom')
      throw error
    }
  },

  joinChatroom: (room: ChatRoom) => {
    set({ currentRoom: room, messages: [] })
    get().loadMessages(room.id)
  },

  leaveRoom: () => {
    set({ currentRoom: null, messages: [] })
  },

  loadMessages: async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chatroom_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100)
      
      if (error) throw error
      set({ messages: data || [] })
    } catch (error) {
      toast.error('Failed to load messages')
    }
  },

  sendMessage: async (content: string, userType: 'buyer' | 'supplier') => {
    const { currentRoom, user } = get()
    if (!currentRoom || !user) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          chatroom_id: currentRoom.id,
          content: content.trim(),
          user_type: userType,
          user_id: user.id,
          user_name: user.user_metadata?.name || user.email
        }])
      
      if (error) throw error
    } catch (error) {
      toast.error('Failed to send message')
      throw error
    }
  },

  subscribeToMessages: (roomId: string) => {
    const subscription = supabase
      .channel(`messages:${roomId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `chatroom_id=eq.${roomId}` 
        },
        (payload) => {
          set(state => ({
            messages: [...state.messages, payload.new as Message]
          }))
        }
      )
      .subscribe()
    
    return () => subscription.unsubscribe()
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true })
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      await get().loadUser()
      toast.success('Signed in successfully!')
    } catch (error: any) {
      toast.error(error.message)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (email: string, password: string, name: string, userType: 'buyer' | 'supplier') => {
    try {
      set({ loading: true })
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            user_type: userType
          }
        }
      })
      
      if (error) throw error
      toast.success('Account created! Please check your email.')
    } catch (error: any) {
      toast.error(error.message)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      set({ user: null, currentRoom: null, messages: [] })
      toast.success('Signed out successfully!')
    } catch (error: any) {
      toast.error(error.message)
    }
  },

  loadUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      set({ user })
    } catch (error) {
      console.error('Failed to load user:', error)
    }
  }
}))
