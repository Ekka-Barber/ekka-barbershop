
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_status ON push_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_last_active ON push_subscriptions(last_active);

-- Add last_retry_at column if it doesn't exist
ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add retry_count column if it doesn't exist
ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Add timestamp column to notification_events if it doesn't exist
ALTER TABLE notification_events 
ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index on notification_events timestamp
CREATE INDEX IF NOT EXISTS idx_notification_events_timestamp ON notification_events(timestamp);

-- Create index on notification_events event_type
CREATE INDEX IF NOT EXISTS idx_notification_events_event_type ON notification_events(event_type);

-- Add platform_details column if it doesn't exist
ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS platform_details JSONB DEFAULT NULL;
