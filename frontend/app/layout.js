import './globals.css';

export const metadata = {
  title: 'CRUD de Pessoas',
  description: 'Cadastro de pessoas com CPF, nome, data de nascimento e idade',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
