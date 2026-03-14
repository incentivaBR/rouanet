import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuração do pool - aceita DATABASE_URL ou variáveis separadas
let poolConfig;

if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
  console.log('📦 Usando DATABASE_URL para conexão');
} else if (process.env.PGHOST) {
  poolConfig = {
    host:     process.env.PGHOST,
    port:     process.env.PGPORT || 5432,
    user:     process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
  console.log('📦 Usando variáveis PG* para conexão (Railway)');
} else {
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
  console.log('📦 Usando variáveis DB_* para conexão');
}

const pool = new Pool(poolConfig);

// Função para testar conexão
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso!');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com PostgreSQL:', error.message);
    return false;
  }
}

export default pool;
