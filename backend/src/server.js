const { criarPool } = require('./db/pool');
const { migrar } = require('./db/migrate');
const { criarPessoaRepository } = require('./repositories/pessoaRepository');
const { criarPessoaService } = require('./services/pessoaService');
const { criarApp } = require('./app');

const PORTA = Number(process.env.PORT) || 3001;
const DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/crud_pessoas';

async function iniciar() {
  const pool = criarPool(DATABASE_URL);
  await migrar(pool);

  const service = criarPessoaService({ repositorio: criarPessoaRepository(pool) });
  const servidor = criarApp({ service }).listen(PORTA, () => {
    console.log(`API ouvindo na porta ${PORTA}`); // eslint-disable-line no-console
  });

  const encerrar = () => servidor.close(() => pool.end());
  process.on('SIGTERM', encerrar);
  process.on('SIGINT', encerrar);
}

iniciar().catch((erro) => {
  console.error('Falha ao iniciar a API:', erro); // eslint-disable-line no-console
  process.exit(1);
});
