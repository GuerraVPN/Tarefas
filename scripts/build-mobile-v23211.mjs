import { appendFile, copyFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const nativeEntry = path.join(root, 'app', 'native-mobile-entry.js');
const mutableSources = [
  nativeEntry,
  path.join(root, 'app', 'mobile-updates-v181.js'),
  path.join(root, 'app', 'android', 'StorageAccessPlugin.java')
];
const originalSources = new Map(
  await Promise.all(mutableSources.map(async file => [file, await readFile(file, 'utf8')]))
);

// 2.3.21.1 / build 258: primeira alpha distribuída pelo novo canal.
// O script 2.3.21 adapta temporariamente a pasta Alpha no fonte nativo.
try {
  await import(pathToFileURL(path.resolve('scripts/build-mobile-v2321.mjs')).href + '?v=23211');
} finally {
  await Promise.all([...originalSources].map(([file, source]) => writeFile(file, source, 'utf8')));
}

const dist = path.join(root, 'dist');
async function patchFile(rel, transform) {
  const file = path.join(dist, rel);
  const before = await readFile(file, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`2.3.21.1: alteração não aplicada em ${rel}`);
  await writeFile(file, after, 'utf8');
}
function replaceRequired(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`2.3.21.1: trecho ausente: ${label}`);
  return source.replace(before, after);
}

for (const name of await readdir(dist)) {
  if (!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const file = path.join(dist, name);
  const source = await readFile(file, 'utf8');
  await writeFile(file, source.replaceAll('2.3.21', '2.3.21.1').replaceAll('b257', 'b258'), 'utf8');
}

await patchFile('mobile-bootstrap.js', source => {
  source = replaceRequired(source, 'const APP_BUILD = 257;', 'const APP_BUILD = 258;', 'build do shell');
  source = replaceRequired(
    source,
    '<div class="tm-about-feature"><span>✓</span><div><strong>Sessão persistente</strong><small>Mantém o acesso do app e registra o aparelho para notificações.</small></div></div>',
    '<div class="tm-about-feature"><span>✓</span><div><strong>Sessão persistente</strong><small>Mantém o acesso do app e registra o aparelho para notificações.</small></div></div>\n        <div class="tm-about-feature"><span>✓</span><div><strong>Login biométrico</strong><small>Impressão digital ou rosto forte, com credencial cifrada pelo Android Keystore.</small></div></div>',
    'recurso biométrico no About'
  );
  return replaceRequired(
    source,
    '<h2>Novidades da ${APP_VERSION}</h2>\n        <ul>',
    '<h2>Novidades da ${APP_VERSION}</h2>\n        <ul>\n          <li>Login por impressão digital ou reconhecimento facial forte, sem armazenar a senha.</li>',
    'novidade biométrica no About'
  );
});

await patchFile('mobile-preload.js', source => source.replace("tarefasAppBuild = '257'", "tarefasAppBuild = '258'"));
await patchFile('mobile-schema-v239.js', source => source.replace('build:257', 'build:258'));
await patchFile('mobile-updates-v181.js', source => {
  source = replaceRequired(source, 'const APP_BUILD = 257;', 'const APP_BUILD = 258;', 'build do atualizador');
  source = replaceRequired(source, "const APP_CHANNEL = 'beta';", "const APP_CHANNEL = 'alpha';", 'canal instalado');
  source = replaceRequired(
    source,
    "if(APP_CHANNEL==='beta')return'Você está usando uma versão beta mais nova que o canal selecionado.';return'Aplicativo atualizado.'",
    "if(APP_CHANNEL==='alpha')return'Você está usando uma versão alpha mais nova que o canal selecionado.';if(APP_CHANNEL==='beta')return'Você está usando uma versão beta mais nova que o canal selecionado.';return'Aplicativo atualizado.'",
    'status da alpha instalada'
  );
  return replaceRequired(
    source,
    "${APP_CHANNEL==='beta'?'BETA':'OFICIAL'} ${APP_VERSION}",
    "${channelLabel(APP_CHANNEL)} ${APP_VERSION}",
    'selo da alpha instalada'
  );
});

await patchFile('mobile-login-v17.js', source => {
  const before = `      localStorage.setItem(PUSH_SESSION_KEY, String(autenticacao.session_token));
      localStorage.setItem('usuarioLogado', JSON.stringify({
        id: data.id,
        nome_completo: data.nome_completo,
        nome_guerra: data.nome_guerra,
        patente: data.patente,
        secao: data.secao,
        posicao: data.posicao,
        cpf: data.cpf
      }));
      localStorage.setItem(SESSION_ACTIVITY_KEY, String(Date.now()));
      location.replace('dashboard.html');`;
  const after = `      const currentUser = {
        id: data.id,
        nome_completo: data.nome_completo,
        nome_guerra: data.nome_guerra,
        patente: data.patente,
        secao: data.secao,
        posicao: data.posicao,
        cpf: data.cpf
      };
      localStorage.setItem(PUSH_SESSION_KEY, String(autenticacao.session_token));
      localStorage.setItem('usuarioLogado', JSON.stringify(currentUser));
      localStorage.setItem(SESSION_ACTIVITY_KEY, String(Date.now()));
      if (window.TarefasBiometricLogin?.afterPasswordLogin) {
        await window.TarefasBiometricLogin.afterPasswordLogin({
          sessionToken: String(autenticacao.session_token),
          user: currentUser
        });
      }
      location.replace('dashboard.html');`;
  return replaceRequired(source, before, after, 'gancho após login com senha');
});

await patchFile('v7_5_4_patch.js', source => replaceRequired(
  source,
  "  if(!confirm('Deseja sair da sua conta neste aparelho?'))return;\n  try{await window.TarefasNative?.notifications?.unregisterPush?.()}catch(_){}",
  "  if(!confirm('Deseja sair da sua conta neste aparelho?'))return;\n  localStorage.setItem('tarefasBiometricClearPending258','1');\n  try{await window.TarefasNative?.biometric?.clear?.();localStorage.removeItem('tarefasBiometricClearPending258')}catch(_){}\n  try{await window.TarefasNative?.notifications?.unregisterPush?.()}catch(_){}",
  'limpeza biométrica no logout confirmado'
));

await copyFile(
  path.join(root, 'app', 'mobile-biometric-v23211.js'),
  path.join(dist, 'mobile-biometric-v23211.js')
);

for (const name of (await readdir(dist)).filter(value => value.endsWith('.html'))) {
  const file = path.join(dist, name);
  let html = await readFile(file, 'utf8');
  if (!html.includes('mobile-biometric-v23211.js')) {
    const tag = '  <script src="mobile-biometric-v23211.js?v=2.3.21.1-b258"></script>';
    html = html.includes('<script src="native-mobile.js"></script>')
      ? html.replace('<script src="native-mobile.js"></script>', `<script src="native-mobile.js"></script>\n${tag}`)
      : html.replace(/<\/body>/i, `${tag}\n</body>`);
  }
  await writeFile(file, html, 'utf8');
}

await appendFile(
  path.join(dist, 'native-mobile.js'),
  "\n;globalThis.__TAREFAS_BIOMETRIC_NATIVE_V258__={version:'2.3.21.1',build:258,authenticator:'BIOMETRIC_STRONG',keystore:true};\n",
  'utf8'
);

console.log('TAREFAS Android 2.3.21.1 build 258 ALPHA: login biométrico protegido pelo Android Keystore.');
