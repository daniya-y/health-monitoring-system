/*
  # Create students table

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
      - Anyone can read students data
      - Authenticated users can manage students data
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

-- Allow authenticated users to insert students
CREATE POLICY "Allow authenticated insert"
    ON students
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update students
CREATE POLICY "Allow authenticated update"
    ON students
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete students
CREATE POLICY "Allow authenticated delete"
    ON students
    FOR DELETE
    TO authenticated
    USING (true);