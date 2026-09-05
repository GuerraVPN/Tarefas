import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v23215.mjs')).href + '?v=2322');
const dist = path.join(root, 'dist');

async function patchFile(rel, transform) {
  const file = path.join(dist, rel);
  const before = await readFile(file, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`2.3.22: alteracao nao aplicada em ${rel}`);
  await writeFile(file, after, 'utf8');
}

for (const name of await readdir(dist)) {
  if (!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const file = path.join(dist, name);
  const source = await readFile(file, 'utf8');
  await writeFile(file, source.replaceAll('2.3.21.5', '2.3.22').replaceAll('b262', 'b263'), 'utf8');
}

await patchFile('mobile-bootstrap.js', source => {
  source = source.replace('const APP_BUILD = 262;', 'const APP_BUILD = 263;');
  source = source.replace('<span class="tm-about-chip">ANDROID</span><h1>TAREFAS</h1><p>Aplicativo móvel do sistema TAREFAS.</p>', '<span class="tm-about-chip">BETA</span><h1>TAREFAS</h1><p>Beta 2.3.22 — estabilidade, segurança, arquivos, notificações e IA.</p>');

  const anchor = `      <section class="tm-about-card">\n        <h2>Recursos do aplicativo</h2>`;
  const betaAbout = `      <section class="tm-about-card tm-about-beta">\n        <h2>Novidades da 2.3.22 Beta</h2>\n        <div class="tm-about-feature"><span>🧪</span><div><strong>Canal Alpha</strong><small>Administradores e moderadores podem optar por receber Alphas antes das próximas Betas.</small></div></div>\n        <div class="tm-about-feature"><span>☝️</span><div><strong>Login por biometria</strong><small>Acesso biométrico no Android com armazenamento seguro e manutenção da biometria após sair da conta quando previamente configurada.</small></div></div>\n        <div class="tm-about-feature"><span>🤖</span><div><strong>Assistente IA integrado</strong><small>A IA consulta dados e prepara alterações respeitando sempre o perfil ativo e exigindo confirmação antes da escrita.</small></div></div>\n        <div class="tm-about-feature"><span>📝</span><div><strong>Tarefas pela IA para Auxiliar</strong><small>Perfis Auxiliar podem criar tarefas pela IA quando já possuem permissão normal na própria seção, sem receber privilégios de chefia.</small></div></div>\n      </section>\n      <section class="tm-about-card tm-about-beta">\n        <h2>Correções</h2>\n        <div class="tm-about-feature"><span>⚙️</span><div><strong>Configurações</strong><small>Corrigido o carregamento e salvamento dos dados do próprio usuário por operações seguras vinculadas à sessão.</small></div></div>\n        <div class="tm-about-feature"><span>🔔</span><div><strong>Notificações</strong><small>Push e notificação local espelhada são removidos corretamente ao tocar; a Central também pode limpar todas as notificações.</small></div></div>\n        <div class="tm-about-feature"><span>#️⃣</span><div><strong>Criação de tarefas pela IA</strong><small>O sistema completa código e campos obrigatórios quando necessário e corrige o vínculo do responsável com a tarefa recém-criada.</small></div></div>\n        <div class="tm-about-feature"><span>🧭</span><div><strong>Erros da IA</strong><small>Falhas de integridade do banco não são mais apresentadas incorretamente como falta de permissão.</small></div></div>\n      </section>\n      <section class="tm-about-card tm-about-beta">\n        <h2>Arquivos e downloads</h2>\n        <div class="tm-about-feature"><span>📥</span><div><strong>Download com confirmação</strong><small>PDF, ODT, DOCX, XLSX, CSV, TXT, ZIP, imagens e outros formatos exibem confirmação após salvar em Downloads/TAREFAS.</small></div></div>\n        <div class="tm-about-feature"><span>📂</span><div><strong>Abertura automática</strong><small>Após o download, o app tenta abrir o arquivo automaticamente e usa o seletor do Android quando necessário.</small></div></div>\n        <div class="tm-about-feature"><span>📎</span><div><strong>Anexos das tarefas</strong><small>Anexos data: e blob: são convertidos em arquivos reais antes do salvamento e abertura.</small></div></div>\n      </section>\n      <section class="tm-about-card tm-about-beta">\n        <h2>Segurança</h2>\n        <div class="tm-about-feature"><span>🔐</span><div><strong>Sessão validada</strong><small>Configurações, notificações e ações da IA continuam vinculadas à sessão e ao perfil ativo.</small></div></div>\n        <div class="tm-about-feature"><span>🛡️</span><div><strong>Sem elevação de privilégios</strong><small>Auxiliares não recebem Admin, Chefe ou Comandante para usar a IA; permanecem limitados às permissões reais do perfil.</small></div></div>\n        <div class="tm-about-feature"><span>✅</span><div><strong>Confirmação de escrita</strong><small>Toda alteração preparada pela IA continua exigindo confirmação antes da gravação no TAREFAS.</small></div></div>\n      </section>\n`;
  if (!source.includes(anchor)) throw new Error('2.3.22: ancora do About nao encontrada');
  return source.replace(anchor, betaAbout + anchor);
});

await patchFile('mobile-preload.js', source => source.replace("tarefasAppBuild = '262'", "tarefasAppBuild = '263'"));
await patchFile('mobile-updates-v181.js', source => source.replace('const APP_BUILD = 262;', 'const APP_BUILD = 263;').replace("const APP_CHANNEL = 'alpha';", "const APP_CHANNEL = 'beta';"));
await patchFile('mobile-schema-v239.js', source => source.replace('build:262', 'build:263'));

await appendFile(
  path.join(dist, 'mobile-bootstrap.js'),
  "\n;globalThis.__TAREFAS_BETA_2322__={version:'2.3.22',build:263,channel:'beta',webVersion:'7.8.2',alphasConsolidated:['2.3.21.1','2.3.21.2','2.3.21.3','2.3.21.4','2.3.21.5']};\n",
  'utf8'
);

console.log('TAREFAS Android 2.3.22 build 263 BETA: consolidacao das Alphas 2.3.21.1 a 2.3.21.5 com About atualizado.');
