/** Remove tudo que não for dígito. */
function normalizarCPF(valor) {
  if (typeof valor !== 'string') return '';
  return valor.replace(/\D/g, '');
}

function calcularDigito(base) {
  const pesoInicial = base.length + 1;
  const soma = base
    .split('')
    .reduce((total, digito, indice) => total + Number(digito) * (pesoInicial - indice), 0);
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

/** Valida CPF (com ou sem máscara) pelos dígitos verificadores. */
function validarCPF(valor) {
  const cpf = normalizarCPF(valor);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const primeiro = calcularDigito(cpf.slice(0, 9));
  const segundo = calcularDigito(cpf.slice(0, 10));
  return primeiro === Number(cpf[9]) && segundo === Number(cpf[10]);
}

/** Aplica a máscara 000.000.000-00 a um CPF com 11 dígitos. */
function formatarCPF(valor) {
  const cpf = normalizarCPF(valor);
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

module.exports = { validarCPF, normalizarCPF, formatarCPF };
