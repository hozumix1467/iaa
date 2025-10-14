-- Create reflections table for daily memo/journaling
CREATE TABLE IF NOT EXISTS reflections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one reflection per user per date
    UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reflections_user_date ON reflections(user_id, date);
CREATE INDEX IF NOT EXISTS idx_reflections_date ON reflections(date);

-- Enable Row Level Security
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own reflections" ON reflections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reflections" ON reflections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections" ON reflections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflections" ON reflections
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reflections_updated_at 
    BEFORE UPDATE ON reflections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
