/** Aplica a máscara 000.000.000-00 progressivamente, enquanto o usuário digita. */
export function mascararCPF(valor) {
  const digitos = String(valor ?? '')
    .replace(/\D/g, '')
    .slice(0, 11);

  return digitos
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

/** Converte "AAAA-MM-DD" em "DD/MM/AAAA". */
export function formatarData(valor) {
  if (!valor) return '';
  const [ano, mes, dia] = valor.split('-');
  return `${dia}/${mes}/${ano}`;
}
