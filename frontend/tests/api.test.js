import { criarClienteApi } from '../lib/api';

function respostaJson(status, corpo) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => corpo,
  };
}

describe('clienteApi', () => {
  const pessoa = { cpf: '52998224725', nome: 'Ana', dataNascimento: '1990-05-10', idade: 36 };

  it('lista pessoas com GET /pessoas', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(respostaJson(200, [pessoa]));
    const api = criarClienteApi({ baseUrl: 'http://api', fetchImpl });

    await expect(api.listar()).resolves.toEqual([pessoa]);
    expect(fetchImpl).toHaveBeenCalledWith('http://api/pessoas', expect.any(Object));
  });

  it('cria pessoa com POST e corpo JSON', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(respostaJson(201, pessoa));
    const api = criarClienteApi({ baseUrl: 'http://api', fetchImpl });

    const dados = { cpf: '529.982.247-25', nome: 'Ana', dataNascimento: '1990-05-10' };
    await expect(api.criar(dados)).resolves.toEqual(pessoa);

    const [url, opcoes] = fetchImpl.mock.calls[0];
    expect(url).toBe('http://api/pessoas');
    expect(opcoes.method).toBe('POST');
    expect(opcoes.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(opcoes.body)).toEqual(dados);
  });

  it('atualiza pessoa com PUT usando o CPF somente com dígitos', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(respostaJson(200, pessoa));
    const api = criarClienteApi({ baseUrl: 'http://api', fetchImpl });

    await api.atualizar('529.982.247-25', { nome: 'Ana', dataNascimento: '1990-05-10' });

    const [url, opcoes] = fetchImpl.mock.calls[0];
    expect(url).toBe('http://api/pessoas/52998224725');
    expect(opcoes.method).toBe('PUT');
  });

  it('remove pessoa com DELETE e aceita resposta 204 sem corpo', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({ ok: true, status: 204 });
    const api = criarClienteApi({ baseUrl: 'http://api', fetchImpl });

    await expect(api.remover('52998224725')).resolves.toBeUndefined();
    expect(fetchImpl.mock.calls[0][1].method).toBe('DELETE');
  });

  it('propaga a mensagem de erro devolvida pela API', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(respostaJson(409, { erro: 'CPF já cadastrado' }));
    const api = criarClienteApi({ baseUrl: 'http://api', fetchImpl });

    await expect(api.criar({})).rejects.toThrow('CPF já cadastrado');
  });

  it('usa mensagem genérica quando a API não envia detalhes', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('sem corpo');
      },
    });
    const api = criarClienteApi({ baseUrl: 'http://api', fetchImpl });

    await expect(api.listar()).rejects.toThrow('Erro 500');
  });
});
