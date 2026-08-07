-- 032 — `ir_total` passa a se chamar `ir_devido`
--
-- O campo sempre guardou o IMPOSTO DEVIDO apurado na declaração — é o que o
-- frontend envia (`state.ir_devido`) e é a base correta do teto de 6%
-- (Lei 9.532/1997, art. 22). O valor nunca esteve errado. O NOME estava.
--
-- Por que isso importa mais do que parece: `ir_total` se lê como "IR total" ou,
-- pior, como "total de rendimentos". Uma white label integrando pela API leria
-- esse nome e poderia enviar a renda bruta. O limite sairia multiplicado por
-- dez, e o servidor destinaria muito acima do permitido — indo parar na malha
-- fina por causa de um nome mal escolhido.
--
-- Um campo que decide limite fiscal não pode depender de o integrador adivinhar
-- o que ele significa.
--
-- A rota continua aceitando `ir_total` no corpo do POST por um ciclo, para não
-- quebrar uma página em cache durante o deploy. Só o nome interno muda agora.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'donations' AND column_name = 'ir_total'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'donations' AND column_name = 'ir_devido'
  ) THEN
    ALTER TABLE donations RENAME COLUMN ir_total TO ir_devido;
  END IF;
END $$;

COMMENT ON COLUMN donations.ir_devido IS
  'Imposto devido apurado na declaração, antes das deduções de incentivo. É a base do teto de 6% (Lei 9.532/1997, art. 22) — não é renda, nem imposto a pagar após retenções.';
