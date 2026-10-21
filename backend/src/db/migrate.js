const SQL_CRIAR_TABELA = `
  CREATE TABLE IF NOT EXISTS pessoas (
    cpf             CHAR(11)     PRIMARY KEY,
    nome            VARCHAR(120) NOT NULL,
    data_nascimento DATE         NOT NULL
  )
`;

async function migrar(pool) {
  await pool.query(SQL_CRIAR_TABELA);
}

module.exports = { migrar };
