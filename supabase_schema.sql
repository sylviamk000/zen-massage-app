-- 1. Crear extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Perfiles de Usuario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('cliente', 'masajista')),
  name TEXT NOT NULL,
  avatar_emoji TEXT DEFAULT '🐻',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Tabla de Configuración de Tasa Base
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  base_daily_minutes INT NOT NULL DEFAULT 20,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
INSERT INTO settings (id, base_daily_minutes) VALUES (1, 20) ON CONFLICT DO NOTHING;

-- 4. Tabla de Balance Diario
CREATE TABLE IF NOT EXISTS daily_balance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  date DATE NOT NULL,
  total_starting_balance INT NOT NULL,
  used_today INT DEFAULT 0, -- en segundos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Tabla de Solicitudes de Masaje
CREATE TABLE IF NOT EXISTS requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  minutes INT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobada', 'rechazada', 'cancelada', 'en_curso', 'completada')),
  reject_reason TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  actual_minutes INT,
  rating INT CHECK (rating BETWEEN 1 AND 5)
);

-- 6. Habilitar Supabase Realtime para la tabla requests y daily_balance
ALTER PUBLICATION supabase_realtime ADD TABLE requests;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_balance;

-- Deshabilitar políticas restrictivas de RLS para garantizar sincronización total entre móviles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_balance DISABLE ROW LEVEL SECURITY;
ALTER TABLE requests DISABLE ROW LEVEL SECURITY;
