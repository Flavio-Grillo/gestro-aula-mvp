# AulaEmDia — demonstração

Versão para apresentar o layout e as interações com dados fictícios. Não usa banco de dados, Firebase ou login. As APIs reais estão desativadas.

## Cloudflare Workers Builds

- Repositório: `Flavio-Grillo/gestro-aula-mvp`
- Branch: `main`
- Build command: `pnpm run build`
- Deploy command: `npx wrangler deploy --name gestro-aula-mvp`

O build padrão já é de demonstração e não inclui binding D1 nem migrações remotas. Habilite o endereço workers.dev após publicar para compartilhar a demonstração.

## Como testar

Navegue por Visão geral, Alunos, Agenda e Mensalidades. Cadastre exemplos, registre presença, agende uma reposição e simule pagamentos. Cada aba usa sessionStorage independente; as alterações persistem ao recarregar a mesma aba e são descartadas ao encerrar a sessão. Não use dados reais. As regras de negócio são ilustrativas e não substituem a versão funcional com banco.

## Desenvolvimento

Node 22+ e pnpm 11.25.0. Instale com `pnpm install --frozen-lockfile`, execute `pnpm dev` ou `pnpm build`.
