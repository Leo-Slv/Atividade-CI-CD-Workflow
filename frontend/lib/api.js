const somenteDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

/**
 * Cliente HTTP da API de pessoas.
 * @param {{ baseUrl: string, fetchImpl?: typeof fetch }} opcoes
 */
export function criarClienteApi({ baseUrl, fetchImpl = (...args) => fetch(...args) }) {
  async function requisitar(caminho, { method = 'GET', corpo } = {}) {
    const opcoes = { method, headers: {}, cache: 'no-store' };
    if (corpo !== undefined) {
      opcoes.headers['Content-Type'] = 'application/json';
      opcoes.body = JSON.stringify(corpo);
    }

    const resposta = await fetchImpl(`${baseUrl}${caminho}`, opcoes);

    if (!resposta.ok) {
      const detalhe = await resposta.json().catch(() => null);
      throw new Error(detalhe?.erro || `Erro ${resposta.status}`);
    }
    if (resposta.status === 204) return undefined;
    return resposta.json();
  }

  return {
    listar: () => requisitar('/pessoas'),
    criar: (dados) => requisitar('/pessoas', { method: 'POST', corpo: dados }),
    atualizar: (cpf, dados) =>
      requisitar(`/pessoas/${somenteDigitos(cpf)}`, { method: 'PUT', corpo: dados }),
    remover: (cpf) => requisitar(`/pessoas/${somenteDigitos(cpf)}`, { method: 'DELETE' }),
  };
}
