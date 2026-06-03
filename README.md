# Vyracare App Dashboard MFE

Micro-frontend da plataforma Vyracare responsavel pelos indicadores e pela visao inicial do sistema.

## Objetivo

O `vyracare-app-dashboard-mfe` concentra a experiencia de dashboard consumida pelo shell da plataforma.

## Integracao com o shell

O shell espera:

- um `remoteEntry.js` publicado pelo MFE;
- uma rota principal exposta por `./Routes`;
- compatibilidade de versoes Angular e do `@vyracare/design-system`.

## Execucao local

```bash
npm install
npm start
```

## Testes

```bash
npm test
```

## Convencao de commits

Os commits deste repositorio devem ser escritos em portugues.

Padrao recomendado:

- `feat: adiciona cards do dashboard principal`
- `fix: corrige carregamento dos indicadores iniciais`
- `docs: atualiza explicacao do mfe de dashboard`
