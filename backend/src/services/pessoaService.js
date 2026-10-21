const { validarCPF, normalizarCPF } = require('../domain/cpf');
const { calcularIdade } = require('../domain/idade');
const { ValidationError, NotFoundError, ConflictError } = require('../errors');

const NOME_MAXIMO = 120;

function exigirCPF(valor) {
  if (!validarCPF(valor)) throw new ValidationError('CPF inválido');
  return normalizarCPF(valor);
}

function validarDadosPessoais({ nome, dataNascimento }, agora) {
  const nomeLimpo = typeof nome === 'string' ? nome.trim() : '';
  if (!nomeLimpo) throw new ValidationError('Nome é obrigatório');
  if (nomeLimpo.length > NOME_MAXIMO) {
    throw new ValidationError(`Nome deve ter no máximo ${NOME_MAXIMO} caracteres`);
  }

  try {
    calcularIdade(dataNascimento, agora);
  } catch (erro) {
    throw new ValidationError(erro.message);
  }

  return { nome: nomeLimpo, dataNascimento };
}

/**
 * Casos de uso do CRUD de pessoas.
 * @param {{ repositorio: object, agora?: () => Date }} dependencias
 */
function criarPessoaService({ repositorio, agora = () => new Date() }) {
  const comIdade = (pessoa) => ({
    cpf: pessoa.cpf,
    nome: pessoa.nome,
    dataNascimento: pessoa.dataNascimento,
    idade: calcularIdade(pessoa.dataNascimento, agora()),
  });

  async function obterExistente(cpf) {
    const pessoa = await repositorio.buscarPorCpf(cpf);
    if (!pessoa) throw new NotFoundError();
    return pessoa;
  }

  return {
    async criar(entrada) {
      const cpf = exigirCPF(entrada?.cpf);
      const dados = validarDadosPessoais(entrada, agora());

      if (await repositorio.buscarPorCpf(cpf)) throw new ConflictError();

      return comIdade(await repositorio.inserir({ cpf, ...dados }));
    },

    async listar() {
      const pessoas = await repositorio.listar();
      return pessoas.map(comIdade);
    },

    async buscar(cpfInformado) {
      const cpf = exigirCPF(cpfInformado);
      return comIdade(await obterExistente(cpf));
    },

    async atualizar(cpfInformado, entrada) {
      const cpf = exigirCPF(cpfInformado);
      const dados = validarDadosPessoais(entrada ?? {}, agora());
      await obterExistente(cpf);
      return comIdade(await repositorio.atualizar(cpf, dados));
    },

    async remover(cpfInformado) {
      const cpf = exigirCPF(cpfInformado);
      const removida = await repositorio.remover(cpf);
      if (!removida) throw new NotFoundError();
    },
  };
}

module.exports = { criarPessoaService };
