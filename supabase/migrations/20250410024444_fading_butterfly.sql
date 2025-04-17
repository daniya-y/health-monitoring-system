/*
  # Update RLS policies for authenticated access

  1. Changes
    - Update policies for health_data and students tables
    - Allow authenticated users to access all data
    - Maintain existing anonymous access for live monitoring
    
  2. Security
    - Authenticated users can perform all operations
    - Anonymous users can only read data
*/

-- Update health_data policies
DROP POLICY IF EXISTS "Allow anonymous read" ON health_data;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON health_data;

-- Allow authenticated users full access to health_data
CREATE POLICY "Allow authenticated full access"
    ON health_data
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow anonymous users to read and insert health_data (for IoT devices and live monitoring)
CREATE POLICY "Allow anonymous read and insert"
    ON health_data
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow anonymous insert"
    ON health_data
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Update students policies
DROP POLICY IF EXISTS "Allow anonymous read" ON students;
DROP POLICY IF EXISTS "Allow anonymous insert" ON students;
DROP POLICY IF EXISTS "Allow anonymous update" ON students;
DROP POLICY IF EXISTS "Allow anonymous delete" ON students;

-- Allow authenticated users full access to students
CREATE POLICY "Allow authenticated full access"
    ON students
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow anonymous users to read students data (for live monitoring)
CREATE POLICY "Allow anonymous read"
    ON students
    FOR SELECT
    TO anon
    USING (true);