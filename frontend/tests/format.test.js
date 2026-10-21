import { mascararCPF, formatarData } from '../lib/format';

describe('mascararCPF', () => {
  it.each([
    ['', ''],
    ['5', '5'],
    ['529', '529'],
    ['5299', '529.9'],
    ['529982', '529.982'],
    ['5299822', '529.982.2'],
    ['529982247', '529.982.247'],
    ['5299822472', '529.982.247-2'],
    ['52998224725', '529.982.247-25'],
  ])('mascara progressivamente %p -> %p', (entrada, esperado) => {
    expect(mascararCPF(entrada)).toBe(esperado);
  });

  it('ignora caracteres não numéricos e limita a 11 dígitos', () => {
    expect(mascararCPF('529.982.247-25999')).toBe('529.982.247-25');
    expect(mascararCPF('abc')).toBe('');
  });

  it('tolera valores nulos', () => {
    expect(mascararCPF(undefined)).toBe('');
  });
});

describe('formatarData', () => {
  it('converte AAAA-MM-DD para DD/MM/AAAA', () => {
    expect(formatarData('1990-05-10')).toBe('10/05/1990');
  });

  it('devolve vazio para valor ausente', () => {
    expect(formatarData('')).toBe('');
    expect(formatarData(null)).toBe('');
  });
});
