const express = require('express');
const cors = require('cors');
const { ValidationError, NotFoundError, ConflictError } = require('./errors');

const STATUS_POR_ERRO = [
  [ValidationError, 400],
  [NotFoundError, 404],
  [ConflictError, 409],
];

/** Encapsula handlers assíncronos para encaminhar rejeições ao tratador de erros. */
const assincrono = (handler) => (req, res, next) => handler(req, res).catch(next);

function criarApp({ service }) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.post(
    '/pessoas',
    assincrono(async (req, res) => {
      res.status(201).json(await service.criar(req.body));
    }),
  );

  app.get(
    '/pessoas',
    assincrono(async (_req, res) => {
      res.json(await service.listar());
    }),
  );

  app.get(
    '/pessoas/:cpf',
    assincrono(async (req, res) => {
      res.json(await service.buscar(req.params.cpf));
    }),
  );

  app.put(
    '/pessoas/:cpf',
    assincrono(async (req, res) => {
      res.json(await service.atualizar(req.params.cpf, req.body));
    }),
  );

  app.delete(
    '/pessoas/:cpf',
    assincrono(async (req, res) => {
      await service.remover(req.params.cpf);
      res.status(204).end();
    }),
  );

  app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));

  // eslint-disable-next-line no-unused-vars
  app.use((erro, _req, res, _next) => {
    if (erro.type === 'entity.parse.failed') {
      return res.status(400).json({ erro: 'JSON malformado' });
    }
    const correspondencia = STATUS_POR_ERRO.find(([Classe]) => erro instanceof Classe);
    if (correspondencia) {
      return res.status(correspondencia[1]).json({ erro: erro.message });
    }
    console.error(erro); // eslint-disable-line no-console
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  });

  return app;
}

module.exports = { criarApp };
