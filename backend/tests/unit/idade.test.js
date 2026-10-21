const { calcularIdade } = require('../../src/domain/idade');

describe('calcularIdade', () => {
  const hoje = new Date(2026, 9, 21); // 21/10/2026

  it('calcula a idade quando o aniversário já ocorreu no ano', () => {
    expect(calcularIdade('2000-03-15', hoje)).toBe(26);
  });

  it('calcula a idade quando o aniversário ainda não ocorreu no ano', () => {
    expect(calcularIdade('2000-12-25', hoje)).toBe(25);
  });

  it('conta o aniversário no próprio dia', () => {
    expect(calcularIdade('2000-10-21', hoje)).toBe(26);
  });

  it('não completa o ano um dia antes do aniversário', () => {
    expect(calcularIdade('2000-10-22', hoje)).toBe(25);
  });

  it('retorna 0 para quem nasceu há menos de um ano', () => {
    expect(calcularIdade('2026-01-10', hoje)).toBe(0);
  });

  it('trata corretamente nascidos em 29/02 (ano bissexto)', () => {
    expect(calcularIdade('2004-02-29', new Date(2026, 1, 28))).toBe(21);
    expect(calcularIdade('2004-02-29', new Date(2026, 2, 1))).toBe(22);
  });

  it('lança erro para data futura', () => {
    expect(() => calcularIdade('2030-01-01', hoje)).toThrow('futura');
  });

  it.each(['', 'abc', '2000-13-01', '2001-02-29', '15/03/2000', null, undefined])(
    'lança erro para data inválida (%p)',
    (valor) => {
      expect(() => calcularIdade(valor, hoje)).toThrow('inválida');
    },
  );
});
