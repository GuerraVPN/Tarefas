# TAREFAS — 26º Pel PE Mec

Gerenciador de tarefas com versão Web e aplicativo Android, usando a mesma base de dados do sistema.

> Este README serve como documentação principal do repositório no GitHub. O aplicativo e a Web possuem seus próprios canais de atualização.

## Android

Os APKs públicos ficam na seção **Releases** do GitHub. As versões de teste posteriores à Beta 2.4.1 podem ser entregues pelo Gerenciador de Patches `.tpatch` do próprio aplicativo.

| Canal | Versão | Build | Base Web | Indicação |
|---|---:|---:|---:|---|
| **Release / Oficial** | **2.4.0** | **274** | **7.9.1** | Uso normal |
| **Pré-release / Beta** | **2.4.1** | **276** | **7.9.1** | Base nativa atual de testes |
| **Alpha / Patch** | **2.4.1.10** — corrige o menu móvel para deixar somente **Escalas**, removendo **Pessoal / Escalas** e **Missões** e mantendo os links de Motorista, Patrulheiro e Permanência.

### Download

- [Abrir Releases](https://github.com/GuerraVPN/Tarefas/releases)
- [Última versão oficial](https://github.com/GuerraVPN/Tarefas/releases/latest)
- [TAREFAS 2.4.0 Oficial](https://github.com/GuerraVPN/Tarefas/releases/tag/android-v2.4.0)
- [TAREFAS 2.4.1 Beta](https://github.com/GuerraVPN/Tarefas/releases/tag/android-v2.4.1-beta)
- [Catálogo oficial de patches](https://raw.githubusercontent.com/GuerraVPN/Tarefas/app/releases/patches/catalog-v1.json)

Baixe o arquivo **.apk** da versão desejada nos *Assets* da release. Para Alphas/Betas distribuídas por patch, use o **Gerenciador de Patches** dentro do TAREFAS.

## Instalação no Android

1. Baixe o APK pela página de Releases.
2. Abra o arquivo baixado.
3. Se o Android solicitar, permita **Instalar apps desconhecidos** para o navegador ou gerenciador de arquivos usado no download.
4. Confirme a instalação.

Ao atualizar uma instalação existente, mantenha o APK assinado do projeto para preservar os dados e permitir a instalação por cima da versão anterior.

## Canais de atualização

**Oficial** é o canal estável, destinado ao uso normal.

**Beta** recebe novidades antes do canal oficial. A **2.4.1 / build 276** é a base nativa atual e inclui a ponte Android necessária para recursos como o seletor de ícones.

**Alpha** é destinada aos usuários elegíveis que habilitaram esse canal. A partir da base 2.4.1, as próximas Betas e Alphas podem ser entregues como **`.tpatch`**, seguindo as mesmas preferências de notificação dos canais APK.

### Patch Alpha atual

**2.4.1.10** — corrige o menu móvel para deixar somente **Escalas**, removendo **Pessoal / Escalas** e **Missões** e mantendo os links de Motorista, Patrulheiro e Permanência.

## Web

**Versão Web atual: 7.9.5** — Módulo Orçamentários com o novo tipo de Guia **Fornecimento**, além das correções anteriores.

A versão Web continua disponível pelo GitHub Pages:

https://guerravpn.github.io/Tarefas/

## Tecnologias

- HTML, CSS e JavaScript
- Supabase
- Capacitor / Android
- GitHub Pages
- GitHub Actions

## Integridade dos APKs

As Releases incluem um arquivo **.sha256** junto do APK para permitir a conferência da integridade do download.

---

Projeto TAREFAS — 26º Pel PE Mec.
