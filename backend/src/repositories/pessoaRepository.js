const { ConflictError } = require('../errors');

const CODIGO_VIOLACAO_UNICIDADE = '23505';

const COLUNAS = 'cpf, nome, data_nascimento AS "dataNascimento"';

/** Repositório PostgreSQL de pessoas. */
function criarPessoaRepository(pool) {
  return {
    async listar() {
      const { rows } = await pool.query(`SELECT ${COLUNAS} FROM pessoas ORDER BY nome, cpf`);
      return rows;
    },

    async buscarPorCpf(cpf) {
      const { rows } = await pool.query(`SELECT ${COLUNAS} FROM pessoas WHERE cpf = $1`, [cpf]);
      return rows[0] || null;
    },

    async inserir({ cpf, nome, dataNascimento }) {
      try {
        const { rows } = await pool.query(
          `INSERT INTO pessoas (cpf, nome, data_nascimento) VALUES ($1, $2, $3) RETURNING ${COLUNAS}`,
          [cpf, nome, dataNascimento],
        );
        return rows[0];
      } catch (erro) {
        if (erro.code === CODIGO_VIOLACAO_UNICIDADE) throw new ConflictError();
        throw erro;
      }
    },

    async atualizar(cpf, { nome, dataNascimento }) {
      const { rows } = await pool.query(
        `UPDATE pessoas SET nome = $2, data_nascimento = $3 WHERE cpf = $1 RETURNING ${COLUNAS}`,
        [cpf, nome, dataNascimento],
      );
      return rows[0] || null;
    },

    async remover(cpf) {
      const { rowCount } = await pool.query('DELETE FROM pessoas WHERE cpf = $1', [cpf]);
      return rowCount > 0;
    },
  };
}

module.exports = { criarPessoaRepository };
