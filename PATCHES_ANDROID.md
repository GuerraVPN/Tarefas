# Patches Android do TAREFAS (.tpatch v1)

A partir da Alpha 2.3.23.1 (build 270), o app pode aplicar hotfixes pequenos sem reinstalar o APK.

## O que pode entrar em patch
- ajustes de interface em JavaScript/CSS;
- correções de regras executadas no WebView;
- ajustes de navegação e comportamento em tempo de execução;
- pequenas correções que não dependam de recompilar a parte nativa.

## O que ainda exige APK novo
AndroidManifest, permissões, Java/Kotlin, plugins Capacitor, bibliotecas nativas e qualquer alteração que precise recompilar o APK.

## Estrutura
O arquivo .tpatch é JSON UTF-8 no formato tarefas-tpatch-v1. Ele contém metadados de compatibilidade, payload JavaScript/CSS e SHA-256 interno do payload.

## Gerar um patch
Crie um spec JSON apontando para um arquivo JS e/ou CSS e execute:

node scripts/make-tpatch-v1.mjs patches/src/meu-patch.json

A saída informa o SHA-256 do payload e o SHA-256 do arquivo completo.

## Distribuição oficial
Patches oficiais ficam no branch app/releases em /patches/. O catálogo é /patches/catalog-v1.json. O app só trata como OFICIAL arquivos baixados desse diretório cujo SHA-256 completo coincida com o catálogo.

## Importação no aparelho
No TAREFAS: Sobre o app > Atualizações > Gerenciador de patches > Importar .tpatch.

Patches importados manualmente ficam marcados como IMPORTADO. O app valida formato, base/build e SHA-256 interno antes de salvar.

## Rollback
Em Patches instalados, use Reverter / desativar. O patch é desativado e o app recarrega sem executá-lo. Também é possível reativar ou remover definitivamente o patch.
