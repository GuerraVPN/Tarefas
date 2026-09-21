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


## Canais e notificações

A partir do patch 2.3.23.3, cada entrada do catálogo possui um campo `channel` com `alpha`, `beta` ou `official`.

- Patch `alpha`: aviso somente para usuários elegíveis com recebimento de Alpha ativado.
- Patch `beta`: aviso para usuários com recebimento de Beta ativado.
- Patch `official`: aviso permitido para todos os usuários do canal oficial.

O cliente consulta o catálogo ao abrir/retomar o app, ao voltar a ficar online e periodicamente enquanto estiver ativo. Patches já instalados são marcados como vistos para evitar notificação retroativa ou duplicada.


## Patches cumulativos

A partir do 2.3.23.4, os patches seguem o modelo cumulativo.

O catálogo principal expõe somente o patch instalável mais recente da mesma base. Patches anteriores ficam apenas em `history`.

Cada novo patch deve:
- manter as correções e recursos necessários dos patches anteriores;
- usar `cumulative: true`;
- usar `replacementMode: "replace-older-same-base"`;
- informar os IDs antigos em `replaces`;
- remover automaticamente do IndexedDB os patches da mesma base com versão inferior à atual.

Resultado esperado: depois da instalação e recarga automática, o aparelho mantém apenas o patch cumulativo mais recente da base.


## Evitar notificação atrasada

A partir do patch 2.3.23.5, a checagem de patches é imediata ao iniciar/retomar o app e usa proteção contra corrida:

- sincroniza os IDs já instalados antes de avaliar notificações;
- confere novamente se o patch foi instalado imediatamente antes do aviso;
- reserva o ID como visto antes da chamada assíncrona de notificação;
- ao tocar em "Baixar e aplicar", marca o patch como visto antes do download;
- se a notificação falhar e o patch ainda não tiver sido instalado, libera o ID para uma tentativa futura.

Isso impede que uma notificação de "patch disponível" apareça depois que a instalação já começou ou foi concluída.
