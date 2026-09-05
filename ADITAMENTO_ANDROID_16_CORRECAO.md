# Correção do Aditamento PDF/ODT — Android 16 e anteriores

Pacote isolado para o TAREFAS Android 2.3.20.3 (build 255).

## Diagnóstico confirmado

- As versões 2.0.0, 2.1.0 e 2.2.0 usavam o mesmo fluxo estável: `saveBase64ToDownloads` + `MediaStore.Downloads`, salvando em `Downloads/TAREFAS`.
- A 2.3.20.2 trocou esse fluxo por `MediaStore.Files`, pasta Documentos e abertura automática.
- Havia ainda dois geradores concorrentes ligados ao botão do Aditamento. O patch 7.4.7 capturava o clique, interrompia o gerador PDF/ODT novo e sempre executava o PDF antigo.

## O que este pacote corrige

- Restaura o armazenamento comprovado de 2.0.0/2.1.0/2.2.0.
- Mantém um único dono do clique de geração.
- Gera PDF e ODT pelo formato realmente selecionado.
- Preserva o horário de passagem de serviço nos dois formatos.
- Mantém o jsPDF dentro do APK, sem depender de CDN.
- Compila com `compileSdk 36`/`targetSdk 36` (Android 16) e `minSdk 24`.
- Usa `WRITE_EXTERNAL_STORAGE` somente até o Android 9 (`maxSdkVersion=28`); Android 10 a 16 usam MediaStore sem acesso total aos arquivos.

## Arquivos do pacote

- `scripts/build-mobile-v23203.mjs`
- `scripts/verify-mobile-v23203.mjs`
- `scripts/test-aditamento-v23203.mjs`
- `.github/workflows/android-v23203-aditamento-check.yml`

## Teste local

```bash
npm ci
npm install --no-save --package-lock=false --ignore-scripts jspdf@2.5.2
node scripts/build-mobile-v23203.mjs
node scripts/verify-mobile-v23203.mjs dist
node scripts/test-aditamento-v23203.mjs dist
```

O workflow incluído repete os testes, monta o projeto Android SDK 36, compila um APK de debug e inspeciona os marcadores dentro do APK.
