const { validarCPF, normalizarCPF, formatarCPF } = require('../../src/domain/cpf');

describe('normalizarCPF', () => {
  it('remove pontos e traço', () => {
    expect(normalizarCPF('529.982.247-25')).toBe('52998224725');
  });

  it('mantém apenas dígitos', () => {
    expect(normalizarCPF(' 529 982 247 25 ')).toBe('52998224725');
  });

  it('retorna string vazia para valores não textuais', () => {
    expect(normalizarCPF(null)).toBe('');
    expect(normalizarCPF(undefined)).toBe('');
  });
});

describe('validarCPF', () => {
  it.each(['529.982.247-25', '52998224725', '111.444.777-35', '11144477735'])(
    'aceita CPF válido (%s)',
    (cpf) => {
      expect(validarCPF(cpf)).toBe(true);
    },
  );

  it('rejeita CPF com dígito verificador incorreto', () => {
    expect(validarCPF('529.982.247-24')).toBe(false);
    expect(validarCPF('111.444.777-36')).toBe(false);
  });

  it.each(['00000000000', '11111111111', '99999999999'])(
    'rejeita sequências de dígitos repetidos (%s)',
    (cpf) => {
      expect(validarCPF(cpf)).toBe(false);
    },
  );

  it.each(['', '123', '1234567890', '123456789012', 'abcdefghijk', null, undefined, 12345678909])(
    'rejeita formato inválido (%p)',
    (cpf) => {
      expect(validarCPF(cpf)).toBe(false);
    },
  );
});

describe('formatarCPF', () => {
  it('aplica a máscara 000.000.000-00', () => {
    expect(formatarCPF('52998224725')).toBe('529.982.247-25');
  });
});
