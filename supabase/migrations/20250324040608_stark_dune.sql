/*
  # Create students table and fix RLS policies

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `student_id` (text, unique) - Student identifier
      - `name` (text) - Student's full name
      - `email` (text, unique) - Student's email address
      - `created_at` (timestamp) - When the student was added

  2. Security
    - Enable RLS on `students` table
    - Add policies for:
      - Anyone can read and write students data (for demo purposes)
*/

CREATE TABLE IF NOT EXISTS students (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read students data
CREATE POLICY "Allow anonymous read"
    ON students
    FOR SELECT
    TO anon
    USING (true);

-- Allow anyone to insert students (for demo)
CREATE POLICY "Allow anonymous insert"
    ON students
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anyone to update students (for demo)
CREATE POLICY "Allow anonymous update"
    ON students
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- Allow anyone to delete students (for demo)
CREATE POLICY "Allow anonymous delete"
    ON students
    FOR DELETE
    TO anon
    USING (true);