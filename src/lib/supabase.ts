import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gmnleuoqqavpdxxgmsaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbmxldW9xcWF2cGR4eGdtc2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTc2MzUsImV4cCI6MjA4MzE5MzYzNX0.akXHT5UusiODDcoNna4u38vr54x1FW8oAQeWrfyea9Q';

export const supabase = createClient(supabaseUrl, supabaseKey);