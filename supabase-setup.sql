-- ============================================
-- SUPABASE DATABASE SETUP
-- Sistema de Autenticación - Fundación Atenas
-- ============================================

-- ============================================
-- 1. TABLA USER
-- ============================================

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS public.user (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birthdate DATE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'DONATOR' CHECK (role IN ('DONATOR', 'DIRECTOR', 'ADMIN')),
  profile_images_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentarios en las columnas
COMMENT ON TABLE public.user IS 'Tabla de usuarios de la aplicación';
COMMENT ON COLUMN public.user.id IS 'ID del usuario (sincronizado con auth.users)';
COMMENT ON COLUMN public.user.email IS 'Email del usuario';
COMMENT ON COLUMN public.user.username IS 'Username único del usuario';
COMMENT ON COLUMN public.user.first_name IS 'Nombre del usuario';
COMMENT ON COLUMN public.user.last_name IS 'Apellido del usuario';
COMMENT ON COLUMN public.user.birthdate IS 'Fecha de nacimiento';
COMMENT ON COLUMN public.user.phone IS 'Teléfono (opcional)';
COMMENT ON COLUMN public.user.role IS 'Rol del usuario: DONATOR, DIRECTOR o ADMIN';
COMMENT ON COLUMN public.user.profile_images_id IS 'URL o ID de la imagen de perfil';

-- ============================================
-- 2. ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_email ON public.user(email);
CREATE INDEX IF NOT EXISTS idx_user_username ON public.user(username);
CREATE INDEX IF NOT EXISTS idx_user_role ON public.user(role);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON public.user(created_at);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Users can read own profile" ON public.user;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user;

-- POLÍTICA 1: Usuario puede leer su propio perfil
CREATE POLICY "Users can read own profile"
ON public.user FOR SELECT
USING (auth.uid() = id);

-- POLÍTICA 2: Usuario puede actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON public.user FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- POLÍTICA 3: Usuario puede insertar su propio perfil (durante registro)
CREATE POLICY "Users can insert own profile"
ON public.user FOR INSERT
WITH CHECK (auth.uid() = id);

-- POLÍTICA 4: Admin puede leer todos los perfiles
CREATE POLICY "Admins can read all profiles"
ON public.user FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- POLÍTICA 5: Admin puede actualizar todos los perfiles
CREATE POLICY "Admins can update all profiles"
ON public.user FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- ============================================
-- 4. TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_user_updated_at ON public.user;
CREATE TRIGGER update_user_updated_at
BEFORE UPDATE ON public.user
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. FUNCIONES ÚTILES
-- ============================================

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user 
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- 6. DATOS DE PRUEBA (OPCIONAL)
-- ============================================

-- NOTA: Estos usuarios deben existir primero en auth.users
-- Para crearlos, usa el flujo de registro de la aplicación

-- Ejemplo de inserción manual (solo si el usuario existe en auth.users)
/*
INSERT INTO public.user (id, email, username, first_name, last_name, birthdate, phone, role)
VALUES (
  'uuid-del-usuario-en-auth',
  'admin@atenas.com',
  'admin',
  'Administrador',
  'Sistema',
  '1990-01-01',
  '+57 300 123 4567',
  'ADMIN'
);
*/

-- ============================================
-- 7. CONSULTAS DE VERIFICACIÓN
-- ============================================

-- Ver todos los usuarios
SELECT 
  id, 
  email, 
  username, 
  first_name, 
  last_name, 
  role,
  created_at
FROM public.user
ORDER BY created_at DESC;

-- Ver usuarios con sus datos de auth
SELECT 
  u.id,
  u.email,
  u.username,
  u.first_name || ' ' || u.last_name as full_name,
  u.role,
  a.created_at as auth_created,
  a.last_sign_in_at
FROM public.user u
JOIN auth.users a ON u.id = a.id
ORDER BY a.created_at DESC;

-- Verificar usuarios en auth pero no en user table
SELECT 
  a.id,
  a.email,
  a.created_at
FROM auth.users a
LEFT JOIN public.user u ON a.id = u.id
WHERE u.id IS NULL;

-- Contar usuarios por rol
SELECT 
  role,
  COUNT(*) as count
FROM public.user
GROUP BY role;

-- ============================================
-- 8. MANTENIMIENTO
-- ============================================

-- Eliminar usuario completamente (de user y auth)
-- NOTA: Debido a ON DELETE CASCADE, eliminar de auth.users 
-- eliminará automáticamente de public.user

-- Ver políticas RLS activas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user';

-- Ver índices de la tabla
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'user'
ORDER BY indexname;

-- ============================================
-- 9. BACKUP Y RESTORE
-- ============================================

-- Para hacer backup de la tabla user:
/*
COPY (SELECT * FROM public.user) TO '/tmp/users_backup.csv' WITH CSV HEADER;
*/

-- Para restaurar desde backup:
/*
COPY public.user FROM '/tmp/users_backup.csv' WITH CSV HEADER;
*/

-- ============================================
-- 10. SEGURIDAD ADICIONAL
-- ============================================

-- Revocar todos los permisos públicos
REVOKE ALL ON public.user FROM PUBLIC;
REVOKE ALL ON public.user FROM anon;
REVOKE ALL ON public.user FROM authenticated;

-- Otorgar solo los permisos necesarios
GRANT SELECT, INSERT, UPDATE ON public.user TO authenticated;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Para ejecutar este script:
-- 1. Ve a Supabase Dashboard
-- 2. SQL Editor
-- 3. Pega este script
-- 4. Ejecuta
-- 5. Verifica que no haya errores

-- Notas importantes:
-- - Este script es idempotente (puede ejecutarse múltiples veces)
-- - Las políticas RLS protegen los datos automáticamente
-- - El trigger updated_at se ejecuta automáticamente
-- - ON DELETE CASCADE mantiene la sincronización con auth.users
