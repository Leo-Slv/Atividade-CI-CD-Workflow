const request = require('supertest');
const { criarPool } = require('../../src/db/pool');
const { migrar } = require('../../src/db/migrate');
const { criarPessoaRepository } = require('../../src/repositories/pessoaRepository');
const { criarPessoaService } = require('../../src/services/pessoaService');
const { criarApp } = require('../../src/app');
const { calcularIdade } = require('../../src/domain/idade');

const DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/crud_test';

const ANA = { cpf: '529.982.247-25', nome: 'Ana Souza', dataNascimento: '1990-05-10' };
const BRUNO = { cpf: '111.444.777-35', nome: 'Bruno Lima', dataNascimento: '1985-11-30' };

describe('API /pessoas (integração com PostgreSQL)', () => {
  let pool;
  let app;

  beforeAll(async () => {
    pool = criarPool(DATABASE_URL);
    await migrar(pool);
    const repositorio = criarPessoaRepository(pool);
    app = criarApp({ service: criarPessoaService({ repositorio }) });
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE TABLE pessoas');
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('GET /health', () => {
    it('informa que a API e o banco estão no ar', async () => {
      const resposta = await request(app).get('/health');
      expect(resposta.status).toBe(200);
      expect(resposta.body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /pessoas', () => {
    it('cadastra a pessoa, grava no banco e devolve a idade calculada', async () => {
      const resposta = await request(app).post('/pessoas').send(ANA);

      expect(resposta.status).toBe(201);
      expect(resposta.body).toEqual({
        cpf: '52998224725',
        nome: 'Ana Souza',
        dataNascimento: '1990-05-10',
        idade: calcularIdade('1990-05-10'),
      });

      const { rows } = await pool.query('SELECT * FROM pessoas');
      expect(rows).toHaveLength(1);
      expect(rows[0].cpf).toBe('52998224725');
    });

    it('responde 400 para CPF inválido', async () => {
      const resposta = await request(app)
        .post('/pessoas')
        .send({ ...ANA, cpf: '123.456.789-00' });
      expect(resposta.status).toBe(400);
      expect(resposta.body.erro).toBe('CPF inválido');
    });

    it('responde 400 para data de nascimento futura', async () => {
      const resposta = await request(app)
        .post('/pessoas')
        .send({ ...ANA, dataNascimento: '2999-01-01' });
      expect(resposta.status).toBe(400);
    });

    it('responde 400 para JSON malformado', async () => {
      const resposta = await request(app)
        .post('/pessoas')
        .set('Content-Type', 'application/json')
        .send('{ nome:');
      expect(resposta.status).toBe(400);
    });

    it('responde 409 para CPF já cadastrado', async () => {
      await request(app).post('/pessoas').send(ANA);
      const resposta = await request(app).post('/pessoas').send(ANA);
      expect(resposta.status).toBe(409);
      expect(resposta.body.erro).toBe('CPF já cadastrado');
    });
  });

  describe('GET /pessoas', () => {
    it('lista as pessoas ordenadas por nome', async () => {
      await request(app).post('/pessoas').send(BRUNO);
      await request(app).post('/pessoas').send(ANA);

      const resposta = await request(app).get('/pessoas');

      expect(resposta.status).toBe(200);
      expect(resposta.body.map((p) => p.nome)).toEqual(['Ana Souza', 'Bruno Lima']);
      expect(resposta.body[0]).toHaveProperty('idade');
    });

    it('devolve lista vazia sem registros', async () => {
      const resposta = await request(app).get('/pessoas');
      expect(resposta.status).toBe(200);
      expect(resposta.body).toEqual([]);
    });
  });

  describe('GET /pessoas/:cpf', () => {
    it('busca por CPF', async () => {
      await request(app).post('/pessoas').send(ANA);
      const resposta = await request(app).get('/pessoas/52998224725');
      expect(resposta.status).toBe(200);
      expect(resposta.body.nome).toBe('Ana Souza');
    });

    it('responde 404 quando não existe', async () => {
      const resposta = await request(app).get('/pessoas/52998224725');
      expect(resposta.status).toBe(404);
    });

    it('responde 400 para CPF inválido', async () => {
      const resposta = await request(app).get('/pessoas/123');
      expect(resposta.status).toBe(400);
    });
  });

  describe('PUT /pessoas/:cpf', () => {
    it('atualiza nome e data de nascimento', async () => {
      await request(app).post('/pessoas').send(ANA);

      const resposta = await request(app)
        .put('/pessoas/52998224725')
        .send({ nome: 'Ana Maria Souza', dataNascimento: '1991-06-11' });

      expect(resposta.status).toBe(200);
      expect(resposta.body).toMatchObject({
        cpf: '52998224725',
        nome: 'Ana Maria Souza',
        dataNascimento: '1991-06-11',
        idade: calcularIdade('1991-06-11'),
      });

      const { rows } = await pool.query('SELECT nome FROM pessoas WHERE cpf = $1', ['52998224725']);
      expect(rows[0].nome).toBe('Ana Maria Souza');
    });

    it('responde 404 ao atualizar quem não existe', async () => {
      const resposta = await request(app)
        .put('/pessoas/52998224725')
        .send({ nome: 'Ana', dataNascimento: '1990-05-10' });
      expect(resposta.status).toBe(404);
    });

    it('responde 400 para dados inválidos', async () => {
      await request(app).post('/pessoas').send(ANA);
      const resposta = await request(app)
        .put('/pessoas/52998224725')
        .send({ nome: '', dataNascimento: '1990-05-10' });
      expect(resposta.status).toBe(400);
    });
  });

  describe('DELETE /pessoas/:cpf', () => {
    it('remove a pessoa e responde 204', async () => {
      await request(app).post('/pessoas').send(ANA);

      const resposta = await request(app).delete('/pessoas/52998224725');

      expect(resposta.status).toBe(204);
      const { rows } = await pool.query('SELECT 1 FROM pessoas');
      expect(rows).toHaveLength(0);
    });

    it('responde 404 ao remover quem não existe', async () => {
      const resposta = await request(app).delete('/pessoas/52998224725');
      expect(resposta.status).toBe(404);
    });
  });

  it('responde 404 em JSON para rotas desconhecidas', async () => {
    const resposta = await request(app).get('/nao-existe');
    expect(resposta.status).toBe(404);
    expect(resposta.body).toHaveProperty('erro');
  });
});
