-- Atualizar a tabela de receitas com campos de assinatura
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS is_signed BOOLEAN DEFAULT FALSE;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS signed_file_url TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMPTZ;
