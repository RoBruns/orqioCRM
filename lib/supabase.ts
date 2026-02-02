
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://swmjozexpzszbyqqgnzr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bWpvemV4cHpzemJ5cXFnbnpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDM5NjEsImV4cCI6MjA4NDQxOTk2MX0.0n9qHFXgur44dYRSoYkB_r35U5UvE0y0tuibD5gzcWY';

export const supabase = createClient(supabaseUrl, supabaseKey);
