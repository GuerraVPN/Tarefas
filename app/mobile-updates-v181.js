(() => {
  'use strict';

  const APP_VERSION = '1.8.1';
  const APP_BUILD = 181;
  const APP_CHANNEL = 'beta';
  const PUSH_SESSION_KEY = 'tarefasPushSession17';

  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const getClient = () => { try { return typeof supabaseClient !== 'undefined' ? supabaseClient : null; } catch (_) { return null; } };
  const sessionToken = () => localStorage.getItem(PUSH_SESSION_KEY) || '';

  function listItems(value){
    const rows=Array.isArray(value)?value:[];
    return rows.map(item=>`<li>${esc(item)}</li>`).join('');
  }

  function statusText(latest){
    if(!latest) return 'Não foi possível consultar a versão mais recente.';
    const build=Number(latest.build||0);
    if(build>APP_BUILD) return `Atualização ${latest.version_name} disponível.`;
    if(build===APP_BUILD) return 'Você está usando a versão mais recente deste canal.';
    if(APP_CHANNEL==='beta') return 'Você está usando uma versão beta mais nova que o canal selecionado.';
    return 'Aplicativo atualizado.';
  }

  async function rpc(name,args={}){
    const client=getClient();
    if(!client) throw new Error('Conexão com o servidor indisponível nesta tela.');
    const {data,error}=await client.rpc(name,args);
    if(error) throw error;
    return data;
  }

  async function loadState(){
    const token=sessionToken();
    const [beta,latestRows,history]=await Promise.all([
      rpc('v1_8_get_beta_updates',{p_session_token:token}).catch(()=>false),
      rpc('v1_8_latest_app_version',{p_session_token:token}),
      rpc('v1_8_app_version_history',{p_session_token:token})
    ]);
    return {
      beta: beta===true,
      latest: Array.isArray(latestRows)?latestRows[0]||null:latestRows||null,
      history: Array.isArray(history)?history:[]
    };
  }

  async function saveBeta(enabled){
    const token=sessionToken();
    if(!token) throw new Error('Faça login novamente para alterar o canal de atualizações.');
    const ok=await rpc('v1_8_set_beta_updates',{p_session_token:token,p_receive_beta:!!enabled});
    if(ok!==true) throw new Error('Não foi possível salvar a preferência de versões beta.');
    return true;
  }

  async function downloadUpdate(version){
    if(!version?.download_url) throw new Error('O download desta versão ainda não foi publicado.');
    const button=document.getElementById('tmUpdateDownload');
    if(button){button.disabled=true;button.textContent='Baixando atualização…';}
    try{
      const filename=`TAREFAS-${String(version.version_name||'update')}.apk`;
      if(window.TarefasNative?.files?.downloadUrl){
        if(button) button.textContent='Baixando e preparando instalação…';
        const result=await window.TarefasNative.files.downloadUrl(version.download_url,filename,{channel:version.channel||'official',autoInstall:true});
        if(result?.installerOpened) return;
        if(result?.saved){
          const extra=result?.installerError?`\n\nO Android não abriu o instalador automaticamente: ${result.installerError}`:'';
          alert(`Atualização salva em ${result.path}.${extra}\n\nSe for a primeira atualização pelo app, permita “Instalar apps desconhecidos” para o TAREFAS e tente novamente.`);
        }
        else if(result?.shared) alert('Escolha o instalador do Android para abrir o APK da atualização.');
      }else{
        location.href=version.download_url;
      }
    }finally{
      if(button){button.disabled=false;button.textContent='Baixar atualização';}
    }
  }

  function renderHistory(rows){
    if(!rows.length) return '<div class="tm-update-empty">Nenhuma versão publicada neste canal.</div>';
    return rows.map(v=>{
      const channel=v.channel==='beta'?'BETA':'OFICIAL';
      const current=Number(v.build)===APP_BUILD?'<span class="tm-update-current">INSTALADA</span>':'';
      return `<article class="tm-update-history-item"><div class="tm-update-history-head"><div><strong>${esc(v.version_name)}</strong><small>Build ${esc(v.build)} • ${esc(v.web_version||'')}</small></div><div><span class="tm-update-channel ${v.channel==='beta'?'beta':''}">${channel}</span>${current}</div></div><h4>${esc(v.title||'Atualização')}</h4><ul>${listItems(v.changelog)}</ul></article>`;
    }).join('');
  }

  function render(root,state){
    const latest=state.latest;
    const newer=latest && Number(latest.build)>APP_BUILD;
    const latestBadge=latest?.channel==='beta'?'BETA':'OFICIAL';
    root.innerHTML=`
      <section class="tm-update-card tm-update-main">
        <div class="tm-update-title"><div><span class="tm-update-eyebrow">ATUALIZAÇÕES</span><h2>Atualização do aplicativo</h2></div><span class="tm-update-installed">${APP_CHANNEL==='beta'?'BETA':'OFICIAL'} ${APP_VERSION}</span></div>
        <p class="tm-update-status ${newer?'available':''}">${esc(statusText(latest))}</p>
        ${latest?`<div class="tm-update-latest"><div><small>Versão mais recente para você</small><strong>${esc(latest.version_name)}</strong><span>Build ${esc(latest.build)}</span></div><span class="tm-update-channel ${latest.channel==='beta'?'beta':''}">${latestBadge}</span></div>`:''}
        ${newer?`<div class="tm-update-news"><strong>${esc(latest.title||'Nova versão')}</strong><ul>${listItems(latest.changelog)}</ul></div><button class="tm-primary tm-update-download" id="tmUpdateDownload" ${latest.download_url?'':'disabled'}>${latest.download_url?'Baixar e instalar atualização':'Download sendo preparado'}</button>`:''}
      </section>
      <section class="tm-update-card">
        <div class="tm-update-setting"><div><strong>Receber versões beta</strong><small>Ao ativar, versões de teste aparecem como atualização e você recebe push quando uma nova beta for publicada.</small></div><label class="tm-switch"><input id="tmBetaUpdates" type="checkbox" ${state.beta?'checked':''}><span></span></label></div>
        <div class="tm-update-note">${state.beta?'Canal beta ativado. Você receberá versões oficiais e betas.':'Canal oficial. Você só receberá notificações de versões estáveis.'}</div>
      </section>
      <section class="tm-update-card"><div class="tm-update-title"><div><span class="tm-update-eyebrow">HISTÓRICO</span><h2>Histórico de versões</h2></div></div><div class="tm-update-history">${renderHistory(state.history)}</div></section>`;

    document.getElementById('tmUpdateDownload')?.addEventListener('click',()=>downloadUpdate(latest).catch(err=>alert(err?.message||err)));
    document.getElementById('tmBetaUpdates')?.addEventListener('change',async event=>{
      const input=event.currentTarget;
      input.disabled=true;
      try{
        await saveBeta(input.checked);
        await refresh(root);
      }catch(err){
        input.checked=!input.checked;
        alert(err?.message||err);
      }finally{input.disabled=false;}
    });
  }

  async function refresh(root){
    root.innerHTML='<section class="tm-update-card"><div class="tm-update-loading">Consultando atualizações…</div></section>';
    try{render(root,await loadState());}
    catch(err){root.innerHTML=`<section class="tm-update-card"><div class="tm-update-error"><strong>Não foi possível consultar atualizações.</strong><small>${esc(err?.message||err)}</small><button id="tmUpdateRetry">Tentar novamente</button></div></section>`;document.getElementById('tmUpdateRetry')?.addEventListener('click',()=>refresh(root));}
  }

  function install(){
    const page=(location.pathname.split('/').pop()||'').toLowerCase();
    if(page!=='about.html') return;
    const about=document.querySelector('.tm-about-page');
    if(!about) return false;
    document.documentElement.classList.add('tm-update-center');
    let root=document.getElementById('tmAppUpdates');
    if(!root){
      root=document.createElement('div');
      root.id='tmAppUpdates';
      const hero=about.querySelector('.tm-about-grid');
      if(hero) hero.insertAdjacentElement('afterend',root); else about.prepend(root);
    }
    refresh(root);
    return true;
  }

  const start=()=>{
    if(install()) return;
    let attempts=0;
    const timer=setInterval(()=>{attempts++;if(install()||attempts>=20)clearInterval(timer);},100);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();