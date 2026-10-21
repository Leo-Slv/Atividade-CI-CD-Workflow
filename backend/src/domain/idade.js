const FORMATO_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Converte "AAAA-MM-DD" em { ano, mes, dia }, validando o calendário.
 * Retorna null quando o valor não é uma data válida.
 */
function parseData(valor) {
  if (typeof valor !== 'string') return null;
  const partes = FORMATO_DATA.exec(valor);
  if (!partes) return null;

  const [ano, mes, dia] = partes.slice(1).map(Number);
  const data = new Date(ano, mes - 1, dia);
  const valida =
    data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;

  return valida ? { ano, mes, dia } : null;
}

/**
 * Calcula a idade em anos completos a partir de "AAAA-MM-DD".
 * @param {string} dataNascimento
 * @param {Date} [hoje] referência (injetável para facilitar testes)
 */
function calcularIdade(dataNascimento, hoje = new Date()) {
  const nascimento = parseData(dataNascimento);
  if (!nascimento) throw new Error('Data de nascimento inválida');

  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;
  const diaAtual = hoje.getDate();

  const nascimentoNoFuturo =
    nascimento.ano > anoAtual ||
    (nascimento.ano === anoAtual &&
      (nascimento.mes > mesAtual || (nascimento.mes === mesAtual && nascimento.dia > diaAtual)));
  if (nascimentoNoFuturo) throw new Error('Data de nascimento futura');

  let idade = anoAtual - nascimento.ano;
  const aindaNaoFezAniversario =
    mesAtual < nascimento.mes || (mesAtual === nascimento.mes && diaAtual < nascimento.dia);
  if (aindaNaoFezAniversario) idade -= 1;

  return idade;
}

module.exports = { calcularIdade, parseData };
