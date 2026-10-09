-- External Links System
-- Allows admins to add custom links (blog, tips, resources) that appear in footer/customer portal

-- External Links Table
CREATE TABLE IF NOT EXISTS external_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    category VARCHAR(100), -- tips, blog, resources, social, help, etc.
    icon VARCHAR(50), -- Icon name (e.g., 'book', 'lightbulb', 'help')
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    open_in_new_tab BOOLEAN DEFAULT TRUE,
    show_in_footer BOOLEAN DEFAULT TRUE,
    show_in_customer_portal BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_external_links_active ON external_links(is_active);
CREATE INDEX idx_external_links_category ON external_links(category);
CREATE INDEX idx_external_links_display_order ON external_links(display_order);

-- Create updated_at trigger
CREATE TRIGGER update_external_links_updated_at 
BEFORE UPDATE ON external_links 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE external_links ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active links
CREATE POLICY "Anyone can view active external links" ON external_links
    FOR SELECT USING (is_active = TRUE);

-- Policy: Authenticated users can manage links (adjust based on your auth setup)
CREATE POLICY "Authenticated users can manage external links" ON external_links
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample links
INSERT INTO external_links (title, description, url, category, icon, display_order, show_in_footer, show_in_customer_portal) VALUES
-- Tips & Guides
('Cleaning Tips', 'Learn how to maintain a clean home between services', 'https://yourblog.com/cleaning-tips', 'tips', 'lightbulb', 1, true, true),
('Pest Prevention Guide', 'Tips to prevent pests and insects in your home', 'https://yourblog.com/pest-prevention', 'tips', 'bug_report', 2, true, true),
('Maintenance Best Practices', 'Keep your property in top condition', 'https://yourblog.com/maintenance-guide', 'tips', 'build', 3, true, true),

-- Resources
('Service Blog', 'Latest news and updates from our team', 'https://yourblog.com', 'blog', 'article', 10, true, true),
('FAQ', 'Frequently asked questions', 'https://yourwebsite.com/faq', 'help', 'help_outline', 11, true, true),
('Video Tutorials', 'Watch how-to videos and tutorials', 'https://youtube.com/@yourchannel', 'resources', 'video_library', 12, true, true),

-- Social Media
('Follow us on Facebook', 'Stay connected on Facebook', 'https://facebook.com/yourpage', 'social', 'facebook', 20, true, false),
('Follow us on Instagram', 'See our work on Instagram', 'https://instagram.com/yourpage', 'social', 'instagram', 21, true, false),
('Follow us on Twitter', 'Get updates on Twitter', 'https://twitter.com/yourpage', 'social', 'twitter', 22, true, false);

-- Comments for documentation
COMMENT ON TABLE external_links IS 'Stores external links that appear in footer and customer portal';
COMMENT ON COLUMN external_links.category IS 'Category: tips, blog, resources, social, help, etc.';
COMMENT ON COLUMN external_links.show_in_footer IS 'Whether to display in website footer';
COMMENT ON COLUMN external_links.show_in_customer_portal IS 'Whether to display in customer portal/app';
COMMENT ON COLUMN external_links.open_in_new_tab IS 'Whether to open link in new browser tab';
