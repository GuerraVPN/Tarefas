# TAREFAS Android / PWA

Primeira base mobile do TAREFAS, criada sem alterar o comportamento do GitHub Pages em produção.

## Arquitetura

- O frontend oficial continua na raiz do repositório.
- `npm run build:web` copia os arquivos do frontend para `dist/` e injeta apenas a camada PWA/mobile.
- O Capacitor usa `dist/` como `webDir`, portanto o APK executa a mesma base HTML/CSS/JS do site.
- A lógica V7.5.2, inclusive `v7_5_2_service_labels.js`, é copiada para o bundle Android pelo build.
- Supabase continua sendo o backend compartilhado entre web e Android.

## Gerar localmente

Requisitos: Node 22+, Android Studio/SDK e Java 21.

```bash
npm install
npm run build:web
npx cap add android
npm run assets:android
npx cap sync android
npx cap open android
```

No Android Studio, use **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

## APK automático

O workflow `.github/workflows/android-debug.yml` gera um APK de depuração e publica o arquivo como artifact `tarefas-android-debug`.

## Offline

O Service Worker mantém em cache o shell principal e páginas visitadas. Dados que dependem do Supabase continuam exigindo rede para sincronizar; a interface previamente carregada pode ser aberta offline.

## Ícone

O arquivo `assets/logo.svg` é a fonte vetorial do ícone. `@capacitor/assets` gera os recursos Android nas densidades exigidas pela plataforma.

## Próximos passos

1. Validar login e navegação em aparelho Android.
2. Refinar cache de dados de escala para consulta offline completa.
3. Adicionar notificações locais/push de serviço.
4. Configurar assinatura release e geração de AAB para Play Store.
