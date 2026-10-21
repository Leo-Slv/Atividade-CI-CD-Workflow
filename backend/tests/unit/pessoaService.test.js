const { criarPessoaService } = require('../../src/services/pessoaService');
const { ValidationError, NotFoundError, ConflictError } = require('../../src/errors');
const { criarRepositorioEmMemoria } = require('../helpers/repositorioEmMemoria');

const HOJE = new Date(2026, 9, 21);
const CPF_VALIDO = '529.982.247-25';

function novoServico() {
  return criarPessoaService({ repositorio: criarRepositorioEmMemoria(), agora: () => HOJE });
}

describe('pessoaService.criar', () => {
  it('cria a pessoa, normaliza o CPF e calcula a idade', async () => {
    const servico = novoServico();
    const pessoa = await servico.criar({
      cpf: CPF_VALIDO,
      nome: '  Maria da Silva ',
      dataNascimento: '2000-03-15',
    });

    expect(pessoa).toEqual({
      cpf: '52998224725',
      nome: 'Maria da Silva',
      dataNascimento: '2000-03-15',
      idade: 26,
    });
  });

  it('rejeita CPF inválido', async () => {
    await expect(
      novoServico().criar({ cpf: '123.456.789-00', nome: 'Ana', dataNascimento: '1990-01-01' }),
    ).rejects.toThrow(ValidationError);
  });

  it.each([undefined, '', '   ', 'a'.repeat(121)])('rejeita nome inválido (%p)', async (nome) => {
    await expect(
      novoServico().criar({ cpf: CPF_VALIDO, nome, dataNascimento: '1990-01-01' }),
    ).rejects.toThrow(ValidationError);
  });

  it.each(['31/12/1990', '1990-02-30', '2999-01-01', undefined])(
    'rejeita data de nascimento inválida (%p)',
    async (dataNascimento) => {
      await expect(
        novoServico().criar({ cpf: CPF_VALIDO, nome: 'Ana', dataNascimento }),
      ).rejects.toThrow(ValidationError);
    },
  );

  it('rejeita CPF já cadastrado', async () => {
    const servico = novoServico();
    const dados = { cpf: CPF_VALIDO, nome: 'Ana', dataNascimento: '1990-01-01' };
    await servico.criar(dados);
    await expect(servico.criar(dados)).rejects.toThrow(ConflictError);
  });
});

describe('pessoaService.listar', () => {
  it('retorna todas as pessoas ordenadas por nome, com idade', async () => {
    const servico = novoServico();
    await servico.criar({ cpf: '111.444.777-35', nome: 'Zeca', dataNascimento: '1980-10-21' });
    await servico.criar({ cpf: CPF_VALIDO, nome: 'Ana', dataNascimento: '2000-10-22' });

    const lista = await servico.listar();

    expect(lista.map((p) => [p.nome, p.idade])).toEqual([
      ['Ana', 25],
      ['Zeca', 46],
    ]);
  });

  it('retorna lista vazia quando não há registros', async () => {
    expect(await novoServico().listar()).toEqual([]);
  });
});

describe('pessoaService.buscar', () => {
  it('encontra pela CPF com ou sem máscara', async () => {
    const servico = novoServico();
    await servico.criar({ cpf: CPF_VALIDO, nome: 'Ana', dataNascimento: '1990-01-01' });

    expect((await servico.buscar('529.982.247-25')).nome).toBe('Ana');
    expect((await servico.buscar('52998224725')).nome).toBe('Ana');
  });

  it('lança NotFoundError quando não existe', async () => {
    await expect(novoServico().buscar('11144477735')).rejects.toThrow(NotFoundError);
  });

  it('lança ValidationError para CPF inválido', async () => {
    await expect(novoServico().buscar('123')).rejects.toThrow(ValidationError);
  });
});

describe('pessoaService.atualizar', () => {
  it('atualiza nome e data de nascimento e recalcula a idade', async () => {
    const servico = novoServico();
    await servico.criar({ cpf: CPF_VALIDO, nome: 'Ana', dataNascimento: '1990-01-01' });

    const atualizada = await servico.atualizar(CPF_VALIDO, {
      nome: 'Ana Souza',
      dataNascimento: '1995-12-31',
    });

    expect(atualizada).toEqual({
      cpf: '52998224725',
      nome: 'Ana Souza',
      dataNascimento: '1995-12-31',
      idade: 30,
    });
  });

  it('lança NotFoundError ao atualizar quem não existe', async () => {
    await expect(
      novoServico().atualizar(CPF_VALIDO, { nome: 'Ana', dataNascimento: '1990-01-01' }),
    ).rejects.toThrow(NotFoundError);
  });

  it('valida os dados na atualização', async () => {
    const servico = novoServico();
    await servico.criar({ cpf: CPF_VALIDO, nome: 'Ana', dataNascimento: '1990-01-01' });
    await expect(
      servico.atualizar(CPF_VALIDO, { nome: '', dataNascimento: '1990-01-01' }),
    ).rejects.toThrow(ValidationError);
  });
});

describe('pessoaService.remover', () => {
  it('remove a pessoa existente', async () => {
    const servico = novoServico();
    await servico.criar({ cpf: CPF_VALIDO, nome: 'Ana', dataNascimento: '1990-01-01' });

    await servico.remover(CPF_VALIDO);

    await expect(servico.buscar(CPF_VALIDO)).rejects.toThrow(NotFoundError);
  });

  it('lança NotFoundError ao remover quem não existe', async () => {
    await expect(novoServico().remover(CPF_VALIDO)).rejects.toThrow(NotFoundError);
  });
});
