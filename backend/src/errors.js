class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(message = 'Pessoa não encontrada') {
    super(message);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends Error {
  constructor(message = 'CPF já cadastrado') {
    super(message);
    this.name = 'ConflictError';
  }
}

module.exports = { ValidationError, NotFoundError, ConflictError };
