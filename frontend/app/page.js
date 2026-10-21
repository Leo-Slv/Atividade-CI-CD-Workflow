'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { criarClienteApi } from '../lib/api';
import { formatarData, mascararCPF } from '../lib/format';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const FORMULARIO_VAZIO = { cpf: '', nome: '', dataNascimento: '' };

export default function Pagina() {
  const api = useMemo(() => criarClienteApi({ baseUrl: API_URL }), []);
  const [pessoas, setPessoas] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);
  const [editando, setEditando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      setPessoas(await api.listar());
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    } finally {
      setCarregando(false);
    }
  }, [api]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function alterar(campo, valor) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  function cancelar() {
    setFormulario(FORMULARIO_VAZIO);
    setEditando(false);
  }

  async function enviar(evento) {
    evento.preventDefault();
    setMensagem(null);
    const dados = { nome: formulario.nome, dataNascimento: formulario.dataNascimento };
    try {
      if (editando) {
        await api.atualizar(formulario.cpf, dados);
      } else {
        await api.criar({ cpf: formulario.cpf, ...dados });
      }
      setMensagem({ tipo: 'ok', texto: editando ? 'Pessoa atualizada.' : 'Pessoa cadastrada.' });
      cancelar();
      await carregar();
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  function editar(pessoa) {
    setFormulario({
      cpf: mascararCPF(pessoa.cpf),
      nome: pessoa.nome,
      dataNascimento: pessoa.dataNascimento,
    });
    setEditando(true);
    setMensagem(null);
  }

  async function remover(pessoa) {
    if (!window.confirm(`Remover ${pessoa.nome}?`)) return;
    try {
      await api.remover(pessoa.cpf);
      setMensagem({ tipo: 'ok', texto: 'Pessoa removida.' });
      await carregar();
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  return (
    <main className="container">
      <h1>CRUD de Pessoas</h1>

      <form onSubmit={enviar} className="card">
        <h2>{editando ? 'Editar pessoa' : 'Nova pessoa'}</h2>

        <label>
          CPF
          <input
            name="cpf"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={formulario.cpf}
            onChange={(e) => alterar('cpf', mascararCPF(e.target.value))}
            disabled={editando}
            required
          />
        </label>

        <label>
          Nome
          <input
            name="nome"
            maxLength={120}
            value={formulario.nome}
            onChange={(e) => alterar('nome', e.target.value)}
            required
          />
        </label>

        <label>
          Data de nascimento
          <input
            name="dataNascimento"
            type="date"
            value={formulario.dataNascimento}
            onChange={(e) => alterar('dataNascimento', e.target.value)}
            required
          />
        </label>

        <div className="acoes">
          <button type="submit">{editando ? 'Salvar' : 'Cadastrar'}</button>
          {editando && (
            <button type="button" className="secundario" onClick={cancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {mensagem && (
        <p role="status" className={`mensagem ${mensagem.tipo}`}>
          {mensagem.texto}
        </p>
      )}

      <section className="card">
        <h2>Pessoas cadastradas</h2>
        {carregando ? (
          <p>Carregando...</p>
        ) : pessoas.length === 0 ? (
          <p>Nenhuma pessoa cadastrada.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>CPF</th>
                <th>Nome</th>
                <th>Nascimento</th>
                <th>Idade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pessoas.map((pessoa) => (
                <tr key={pessoa.cpf}>
                  <td>{mascararCPF(pessoa.cpf)}</td>
                  <td>{pessoa.nome}</td>
                  <td>{formatarData(pessoa.dataNascimento)}</td>
                  <td>{pessoa.idade} anos</td>
                  <td className="acoes">
                    <button type="button" className="secundario" onClick={() => editar(pessoa)}>
                      Editar
                    </button>
                    <button type="button" className="perigo" onClick={() => remover(pessoa)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
