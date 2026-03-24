-- schema.sql
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public."Users" (
    user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public."Todos" (
    todo_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
      FOREIGN KEY(user_id) 
      REFERENCES public."Users"(user_id)
      ON DELETE CASCADE
);

-- Enable RLS (Optional but recommended for client side queries if we were using Supabase Auth natively, 
-- but since we are handling our own Users table, we might just keep policies open or perform queries from a secure environment/RPC.
-- For this project, we'll assume the client is querying directly and we can leave RLS open for development/demo,
-- or implement basic policies if needed.

-- Note: We are using a custom Users table and custom password hash logic, 
-- in production you should use Supabase Auth (auth.users) directly for security.
