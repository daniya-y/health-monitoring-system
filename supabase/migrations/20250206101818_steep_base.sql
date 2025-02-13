/*
  # Health Monitoring System Schema

  1. New Tables
    - `health_data`
      - `id` (uuid, primary key)
      - `student_id` (text, required) - Student identifier
      - `heart_rate` (integer) - Heart rate in BPM
      - `spo2` (integer) - Blood oxygen level percentage
      - `body_temperature` (decimal) - Body temperature in Celsius
      - `created_at` (timestamp) - When the measurement was taken
  
  2. Security
    - Enable RLS on `health_data` table
    - Add policies for:
      - Anyone can insert data (for IoT devices)
      - Authenticated users can read all data
*/

CREATE TABLE IF NOT EXISTS health_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    heart_rate INTEGER CHECK (heart_rate > 0 AND heart_rate < 300),
    spo2 INTEGER CHECK (spo2 >= 0 AND spo2 <= 100),
    body_temperature DECIMAL(4,1) CHECK (body_temperature > 30 AND body_temperature < 45),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;

-- Allow any client to insert data (for IoT devices)
CREATE POLICY "Allow anonymous inserts"
    ON health_data
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow authenticated users to read all data
CREATE POLICY "Allow authenticated read"
    ON health_data
    FOR SELECT
    TO authenticated
    USING (true);