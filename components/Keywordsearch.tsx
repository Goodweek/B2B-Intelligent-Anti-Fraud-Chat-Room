'use client'

import { useState } from 'react'
import { useChatStore } from '@/store/chatStore'
import { Search, Plus, Users, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const QUICK_KEYWORDS = [
  'Electronics', 'LED Display', 'Furniture', 'Textiles', 
  'Machinery', 'Food Products', 'Chemicals', 'Auto Parts'
]

export function KeywordSearch() {
  const [keywords, setKeywords] = useState('')
  const [userType, setUserType] = useState<'buyer' | 'supplier'>('buyer')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const { searchChatrooms, createChatroom, joinChatroom } = useChatStore()

  const handleSearch = async () => {
    if (!keywords.trim()) return
    
    setLoading(true)
    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k)
    
    try {
      // 搜索现有聊天室
      const searchResults = searchChatrooms(keywordArray)
      
      if (searchResults.length === 0 || searchResults[0].similarity < 70) {
        // 创建新聊天室
        const roomName = keywordArray.join(' ').replace(/\b\w/g, l => l.toUpperCase())
        const newRoom = await createChatroom(
          `${roomName} Discussion`,
          keywordArray,
          `B2B discussion room for ${keywordArray.join(', ')}. Connect with ${userType === 'buyer' ? 'suppliers' : 'buyers'} worldwide.`
        )
        
        setResults([
          { ...newRoom, similarity: 100, isNew: true },
          ...searchResults.slice(0, 3)
        ])
      } else {
        setResults(searchResults.slice(0, 5))
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const addQuickKeyword = (keyword: string) => {
    const current = keywords.split(',').map(k => k.trim()).filter(k => k)
    if (!current.includes(keyword)) {
      setKeywords([...current, keyword].join(', '))
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your B2B Chat Room
          </h1>
          <p className="text-gray-600">
            Connect with global {userType === 'buyer' ? 'suppliers' : 'buyers'} in your industry
          </p>
        </div>

        {/* 用户类型选择 */}
        <div className="flex justify-center gap-4">
          {[
            { type: 'buyer', icon: '🛒', label: 'I\'m a Buyer' },
            { type: 'supplier', icon: '🏭', label: 'I\'m a Supplier' }
          ].map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => setUserType(type as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                userType === type 
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-xl">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* 搜索框 */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Enter product keywords (e.g., LED Display, Electronics)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !keywords.trim()}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* 快速关键词 */}
        <div>
          <p className="text-sm text-gray-600 mb-3">Quick keywords:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_KEYWORDS.map((keyword) => (
              <button
                key={keyword}
                onClick={() => addQuickKeyword(keyword)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                + {keyword}
              </button>
            ))}
          </div>
        </div>

        {/* 搜索结果 */}
        {results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Chat Room Recommendations
            </h3>
            
            <div className="grid gap-4">
              {results.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => joinChatroom(room)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                          {room.name}
                        </h4>
                        {room.isNew && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                            <Plus className="w-3 h-3" />
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{room.description}</p>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Keywords:</span> {room.keywords?.join(', ')}
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                        <Zap className="w-5 h-5" />
                        {room.similarity}%
                      </div>
                      <div className="text-xs text-gray-500">Match</div>
                      {room.isNew && (
                        <div className="text-xs text-blue-600 mt-1">Just Created</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                      Join Chat Room →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}