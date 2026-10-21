/** Repositório falso (em memória) com o mesmo contrato do repositório PostgreSQL. */
function criarRepositorioEmMemoria() {
  const pessoas = new Map();

  return {
    async listar() {
      return [...pessoas.values()].sort((a, b) => a.nome.localeCompare(b.nome));
    },
    async buscarPorCpf(cpf) {
      return pessoas.get(cpf) || null;
    },
    async inserir(pessoa) {
      pessoas.set(pessoa.cpf, { ...pessoa });
      return { ...pessoa };
    },
    async atualizar(cpf, dados) {
      if (!pessoas.has(cpf)) return null;
      const atualizada = { ...pessoas.get(cpf), ...dados };
      pessoas.set(cpf, atualizada);
      return { ...atualizada };
    },
    async remover(cpf) {
      return pessoas.delete(cpf);
    },
  };
}

module.exports = { criarRepositorioEmMemoria };
