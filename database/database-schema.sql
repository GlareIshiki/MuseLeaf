-- SD Character Gallery MVP Database Schema
-- Phase 0 MVP implementation for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    handle VARCHAR(50) UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    suno_account_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Characters table
CREATE TABLE characters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    short_worldview TEXT NOT NULL,
    description TEXT,
    has_music BOOLEAN DEFAULT FALSE,
    ai_tool_used VARCHAR(50),
    sd_score FLOAT DEFAULT 0.0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets table (images/gifs/videos)
CREATE TABLE assets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'gif', 'video')),
    original_url TEXT NOT NULL,
    thumbnail_url TEXT,
    preview_url TEXT,
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    prompt_summary TEXT,
    downloadable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Music table
CREATE TABLE music (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    platform VARCHAR(20) DEFAULT 'suno' CHECK (platform IN ('suno', 'youtube', 'soundcloud', 'custom')),
    suno_track_id VARCHAR(100),
    embed_url TEXT NOT NULL,
    verified_owner BOOLEAN DEFAULT FALSE,
    account_id VARCHAR(100),
    title VARCHAR(200),
    duration INTEGER, -- in seconds
    volume_normalized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) DEFAULT 'feature' CHECK (type IN ('feature', 'emotion', 'world')),
    color VARCHAR(7) DEFAULT '#6B7280', -- hex color
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Character tags junction table
CREATE TABLE character_tags (
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    confidence FLOAT DEFAULT 1.0,
    auto_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (character_id, tag_id)
);

-- Moderation log table
CREATE TABLE moderation_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    reason TEXT,
    moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Engagement table (for future analytics)
CREATE TABLE engagement (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('view', 'play', 'download', 'like')),
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_characters_status ON characters(status);
CREATE INDEX idx_characters_has_music ON characters(has_music);
CREATE INDEX idx_characters_created_at ON characters(created_at DESC);
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_assets_character_id ON assets(character_id);
CREATE INDEX idx_music_character_id ON music(character_id);
CREATE INDEX idx_character_tags_character_id ON character_tags(character_id);
CREATE INDEX idx_character_tags_tag_id ON character_tags(tag_id);
CREATE INDEX idx_engagement_character_id ON engagement(character_id);
CREATE INDEX idx_engagement_created_at ON engagement(created_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE music ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be refined later)
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Characters: users can CRUD their own, everyone can read approved
CREATE POLICY "Users can manage own characters" ON characters
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view approved characters" ON characters
    FOR SELECT USING (status = 'approved');

-- Assets: follow character permissions
CREATE POLICY "Users can manage own character assets" ON assets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM characters 
            WHERE characters.id = assets.character_id 
            AND characters.user_id = auth.uid()
        )
    );

CREATE POLICY "Everyone can view approved character assets" ON assets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM characters 
            WHERE characters.id = assets.character_id 
            AND characters.status = 'approved'
        )
    );

-- Music: follow character permissions
CREATE POLICY "Users can manage own character music" ON music
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM characters 
            WHERE characters.id = music.character_id 
            AND characters.user_id = auth.uid()
        )
    );

CREATE POLICY "Everyone can view approved character music" ON music
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM characters 
            WHERE characters.id = music.character_id 
            AND characters.status = 'approved'
        )
    );

-- Tags: everyone can read, only authenticated users can create
CREATE POLICY "Everyone can view tags" ON tags FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can create tags" ON tags FOR INSERT TO authenticated WITH CHECK (true);

-- Character tags: follow character permissions
CREATE POLICY "Users can manage own character tags" ON character_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM characters 
            WHERE characters.id = character_tags.character_id 
            AND characters.user_id = auth.uid()
        )
    );

CREATE POLICY "Everyone can view approved character tags" ON character_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM characters 
            WHERE characters.id = character_tags.character_id 
            AND characters.status = 'approved'
        )
    );

-- Engagement: users can create, admins can read all
CREATE POLICY "Users can create engagement records" ON engagement
    FOR INSERT TO authenticated WITH CHECK (true);

-- Insert some default tags
INSERT INTO tags (name, type, color) VALUES
    ('猫耳', 'feature', '#F59E0B'),
    ('角', 'feature', '#8B5CF6'),
    ('翼', 'feature', '#06B6D4'),
    ('尻尾', 'feature', '#F97316'),
    ('笑顔', 'emotion', '#10B981'),
    ('泣き', 'emotion', '#3B82F6'),
    ('怒り', 'emotion', '#EF4444'),
    ('無表情', 'emotion', '#6B7280'),
    ('ファンタジー', 'world', '#8B5CF6'),
    ('現代', 'world', '#6B7280'),
    ('SF', 'world', '#06B6D4'),
    ('和風', 'world', '#F59E0B'),
    ('スチームパンク', 'world', '#92400E');

