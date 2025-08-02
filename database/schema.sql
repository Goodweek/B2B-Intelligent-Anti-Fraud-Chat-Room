-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 聊天室表
CREATE TABLE IF NOT EXISTS chatrooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  type TEXT DEFAULT 'general' CHECK (type IN ('general', 'product', 'industry')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  search_text TEXT
);

-- 消息表
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chatroom_id UUID REFERENCES chatrooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('buyer', 'supplier')),
  user_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT false
);

-- 用户资料表 (扩展 auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('buyer', 'supplier')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 聊天室成员表
CREATE TABLE IF NOT EXISTS chatroom_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chatroom_id UUID REFERENCES chatrooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chatroom_id, user_id)
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_chatrooms_keywords ON chatrooms USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_chatrooms_created_at ON chatrooms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chatroom_id ON messages(chatroom_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);

-- 全文搜索索引
CREATE INDEX IF NOT EXISTS idx_chatrooms_search ON chatrooms USING GIN(
  to_tsvector('english', search_text)
);

-- RLS (Row Level Security) 策略
ALTER TABLE chatrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatroom_members ENABLE ROW LEVEL SECURITY;

-- 聊天室策略：所有人都可以查看和创建
CREATE POLICY "Anyone can view chatrooms" ON chatrooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create chatrooms" ON chatrooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own chatrooms" ON chatrooms FOR UPDATE USING (created_by = auth.uid());

-- 消息策略：所有人都可以查看，认证用户可以发送
CREATE POLICY "Anyone can view messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages" ON messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own messages" ON messages FOR UPDATE USING (user_id = auth.uid());

-- 用户资料策略
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR ALL USING (id = auth.uid());

-- 成员策略
CREATE POLICY "Anyone can view members" ON chatroom_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join rooms" ON chatroom_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 触发器：自动创建用户资料
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'buyer')
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 触发器函数：更新搜索文本
CREATE OR REPLACE FUNCTION update_search_text()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.search_text = NEW.name || ' ' || COALESCE(NEW.description, '') || ' ' || array_to_string(NEW.keywords, ' ');
    RETURN NEW;
END;
$function$;

CREATE TRIGGER update_chatrooms_search_text 
  BEFORE INSERT OR UPDATE ON chatrooms
  FOR EACH ROW EXECUTE FUNCTION update_search_text();

-- 触发器函数：更新时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE TRIGGER update_chatrooms_updated_at BEFORE UPDATE ON chatrooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初始数据：创建一些示例聊天室
INSERT INTO chatrooms (name, keywords, description, type) VALUES
('Electronics Trading Hub', ARRAY['electronics', 'gadgets', 'technology'], 'Global electronics trading and sourcing discussions', 'industry'),
('LED Display Marketplace', ARRAY['led', 'display', 'screen', 'digital signage'], 'Connect LED display manufacturers with buyers worldwide', 'product'),
('Furniture & Home Decor', ARRAY['furniture', 'home decor', 'interior design'], 'Furniture manufacturers and interior designers meeting point', 'industry'),
('Textile & Apparel Trade', ARRAY['textile', 'apparel', 'clothing', 'fabric'], 'Textile industry professionals networking space', 'industry'),
('Machinery & Equipment', ARRAY['machinery', 'equipment', 'industrial', 'manufacturing'], 'Heavy machinery and industrial equipment trading', 'industry');

-- 更新现有数据的搜索文本（如果表已存在）
UPDATE chatrooms SET search_text = name || ' ' || COALESCE(description, '') || ' ' || array_to_string(keywords, ' ') WHERE search_text IS NULL;
