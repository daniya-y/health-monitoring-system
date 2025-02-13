/*
  # Update RLS policies for health_data table

  1. Changes
    - Add policy to allow anonymous read access to health_data table
    
  2. Security
    - Allows anonymous users to read health data
    - Maintains existing insert policy for IoT devices
*/

-- Drop the existing authenticated-only read policy
DROP POLICY IF EXISTS "Allow authenticated read" ON health_data;

-- Create new policy to allow anonymous read access
CREATE POLICY "Allow anonymous read"
    ON health_data
    FOR SELECT
    TO anon
    USING (true);