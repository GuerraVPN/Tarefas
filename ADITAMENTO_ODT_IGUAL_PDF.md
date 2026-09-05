# Aditamento ODT com o mesmo layout do PDF

Pacote isolado para o TAREFAS Android 2.3.20.4 (build 256).

## Referência conferida

O layout foi comparado com `Aditamento_04-09-2026.pdf`, gerado pelo próprio aplicativo.

O ODT anterior levava o conteúdo correto, mas não incluía todas as definições visuais do PDF. Faltavam principalmente o brasão, a moldura dupla, as larguras fixas das colunas, o fundo cinza do cabeçalho e os espaçamentos do documento.

## O que foi corrigido

- Incorpora o brasão do Exército dentro do ODT.
- Usa página A4 vertical com moldura dupla e margens equivalentes às do PDF.
- Mantém as colunas em 5,5 cm, 2,2 cm e 9,9 cm.
- Replica o cabeçalho cinza, as bordas e a altura das linhas da tabela.
- Replica alinhamentos, hierarquia, espaçamentos e bloco de assinatura.
- Mantém exatamente os mesmos dados e o horário de passagem de serviço.
- Continua editável no Word e no LibreOffice.
- Continua salvando em `Downloads/TAREFAS` no Android 7 ao Android 16.

## Arquivos do pacote

- `scripts/build-mobile-v23204.mjs`
- `scripts/verify-mobile-v23204.mjs`
- `scripts/test-aditamento-v23204.mjs`
- `.github/workflows/android-v23204-beta.yml`
- `ADITAMENTO_ODT_IGUAL_PDF.md`

## Teste local

```bash
npm ci
npm install --no-save --package-lock=false --ignore-scripts jspdf@2.5.2
node scripts/build-mobile-v23204.mjs
node scripts/verify-mobile-v23204.mjs dist
ADITAMENTO_FIXTURE_DIR=tmp/aditamento-v23204 node scripts/test-aditamento-v23204.mjs dist
soffice --headless --convert-to pdf --outdir tmp/aditamento-v23204/rendered-odt tmp/aditamento-v23204/Aditamento_04-09-2026.odt
```

O teste gera PDF e ODT com os mesmos dados, valida o pacote ODT e confirma sua abertura e renderização no LibreOffice.
