const { Pool, types } = require('pg');

// Mantém colunas DATE como texto "AAAA-MM-DD" (evita problemas de fuso horário).
const OID_DATE = 1082;
types.setTypeParser(OID_DATE, (valor) => valor);

function criarPool(connectionString) {
  return new Pool({ connectionString });
}

module.exports = { criarPool };
