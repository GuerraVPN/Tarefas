(function(){
'use strict';
if(window.__TAREFAS_PROFILE_REQUIRED_V769__)return;
window.__TAREFAS_PROFILE_REQUIRED_V769__=true;

const CONFIG_PAGE='configuracoes.html';
const HOME_PAGE='dashboard.html';
const CHECK_INTERVAL=2500;
let checking=false,overlay=null,lastChecked=0;

function loggedUser(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
function digits(v){return String(v||'').replace(/\D/g,'')}
function page(){return (location.pathname.split('/').pop()||'index.html').toLowerCase()}
function isAdmin(u){return Number(u?.id)===1||String(u?.nome_guerra||u?.nome_completo||'').trim().toLowerCase()==='admin'}
function isDefaultCpf(v){const c=digits(v);return /^0{9}\d{2}$/.test(c)||/^0{11}$/.test(c)}
function validCpf(v){
 const c=digits(v);if(c.length!==11||isDefaultCpf(c)||/^(\d)\1{10}$/.test(c))return false;
 let s=0;for(let i=0;i<9;i++)s+=Number(c[i])*(10-i);let d=(s*10)%11;if(d===10)d=0;if(d!==Number(c[9]))return false;
 s=0;for(let i=0;i<10;i++)s+=Number(c[i])*(11-i);d=(s*10)%11;if(d===10)d=0;return d===Number(c[10]);
}
function validPhone(v){const p=digits(v);return p.length>=10&&p.length<=13}
function validEmail(v){const e=String(v||'').trim();return e.length>=6&&e.length<=180&&/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)&&!/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(e)}
function pending(row){const a=[];if(!validCpf(row?.cpf))a.push('CPF');if(!validPhone(row?.telefone))a.push('telefone');if(!validEmail(row?.email))a.push('e-mail');return a}
function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function waitClient(){for(let i=0;i<20;i++){const c=client();if(c)return c;await sleep(100)}return null}

function style(){
 if(document.getElementById('profileRequiredV769Style'))return;
 const s=document.createElement('style');s.id='profileRequiredV769Style';s.textContent=`
 #profileRequiredV769{position:fixed;inset:0;z-index:2147483646;background:rgba(4,8,8,.88);backdrop-filter:blur(7px);display:flex;align-items:center;justify-content:center;padding:18px;font-family:Inter,Arial,sans-serif}
 #profileRequiredV769 .pr-card{width:min(520px,100%);max-height:calc(100vh - 36px);overflow:auto;background:var(--v4-surface,#fff);color:var(--v4-text,#111827);border:1px solid var(--v4-border,#d1d5db);border-radius:18px;box-shadow:0 24px 80px rgba(0,0,0,.45);padding:22px}
 #profileRequiredV769 .pr-icon{width:52px;height:52px;border-radius:15px;background:#f59e0b;color:#111827;display:grid;place-items:center;font-size:27px;margin-bottom:14px}
 #profileRequiredV769 h2{margin:0 0 8px;font-size:21px}#profileRequiredV769 p{margin:0 0 14px;color:var(--v4-muted,#6b7280);font-size:13px;line-height:1.5}
 #profileRequiredV769 .pr-pending{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 15px}#profileRequiredV769 .pr-chip{padding:6px 9px;border-radius:999px;background:#fff7ed;color:#9a3412;border:1px solid #fed7aa;font-size:11px;font-weight:700}
 #profileRequiredV769 label{display:block;font-size:12px;font-weight:700;margin:12px 0 5px}#profileRequiredV769 input{width:100%;box-sizing:border-box;padding:12px;border-radius:9px;border:1px solid var(--v4-border-strong,#cbd5e1);background:var(--v4-surface,#fff);color:var(--v4-text,#111827);font-size:15px;outline:none}
 #profileRequiredV769 input:focus{border-color:#047857;box-shadow:0 0 0 3px rgba(4,120,87,.12)}#profileRequiredV769 .pr-msg{min-height:18px;margin-top:10px;color:#b91c1c;font-size:12px;font-weight:600}
 #profileRequiredV769 button{width:100%;margin-top:8px;border:0;border-radius:10px;padding:12px 14px;background:#047857;color:#fff;font-size:14px;font-weight:800;cursor:pointer}#profileRequiredV769 button:disabled{opacity:.55;cursor:wait}
 #profileRequiredV769 .pr-foot{font-size:10px;color:var(--v4-muted,#6b7280);text-align:center;margin-top:12px}
 `;document.head.appendChild(s);
}
function formatCpf(v){let c=digits(v).slice(0,11);return c.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2')}
function formatPhone(v){let p=digits(v).slice(0,13);if(p.length===11)return p.replace(/(\d{2})(\d{5})(\d{4})/,'($1) $2-$3');if(p.length===10)return p.replace(/(\d{2})(\d{4})(\d{4})/,'($1) $2-$3');return String(v||'')}
function updateLocal(row){const u=loggedUser();if(!u)return;localStorage.setItem('usuarioLogado',JSON.stringify({...u,cpf:row.cpf,telefone:row.telefone,email:row.email}))}

function render(row,missing){
 if(overlay)return;
 style();
 overlay=document.createElement('div');overlay.id='profileRequiredV769';
 overlay.innerHTML=`<div class="pr-card" role="dialog" aria-modal="true" aria-labelledby="prTitle">
   <div class="pr-icon">⚠️</div><h2 id="prTitle">Atualização cadastral obrigatória</h2>
   <p>Antes de continuar usando o TAREFAS, confirme seus dados. O acesso será liberado assim que CPF, telefone e e-mail estiverem válidos.</p>
   <div class="pr-pending">${missing.map(x=>`<span class="pr-chip">Pendente: ${x}</span>`).join('')}</div>
   <form id="profileRequiredV769Form" novalidate>
    <label for="prCpf">CPF</label><input id="prCpf" inputmode="numeric" autocomplete="off" maxlength="14" value="${formatCpf(row.cpf||'')}" placeholder="000.000.000-00">
    <label for="prPhone">Telefone</label><input id="prPhone" inputmode="tel" autocomplete="tel" maxlength="18" value="${String(formatPhone(row.telefone||'')).replace(/"/g,'&quot;')}" placeholder="(55) 99999-9999">
    <label for="prEmail">E-mail</label><input id="prEmail" type="email" autocomplete="email" maxlength="180" value="${String(row.email||'').replace(/"/g,'&quot;')}" placeholder="nome@exemplo.com">
    <div class="pr-msg" id="prMsg"></div><button id="prSave" type="submit">Salvar dados e continuar</button>
   </form><div class="pr-foot">WEB 7.6.9 • seus dados serão conferidos no servidor antes de liberar o sistema.</div>
  </div>`;
 document.body.appendChild(overlay);
 const cpf=overlay.querySelector('#prCpf'),phone=overlay.querySelector('#prPhone'),email=overlay.querySelector('#prEmail'),form=overlay.querySelector('form'),btn=overlay.querySelector('#prSave'),msg=overlay.querySelector('#prMsg');
 cpf.addEventListener('input',()=>{cpf.value=formatCpf(cpf.value)});
 form.addEventListener('submit',async e=>{
  e.preventDefault();msg.textContent='';
  const cpfValue=digits(cpf.value),phoneValue=digits(phone.value),emailValue=email.value.trim().toLowerCase();
  if(!validCpf(cpfValue)){msg.textContent='Informe um CPF válido e diferente do CPF padrão.';cpf.focus();return}
  if(!validPhone(phoneValue)){msg.textContent='Informe um telefone válido com DDD.';phone.focus();return}
  if(!validEmail(emailValue)){msg.textContent='Informe um e-mail válido.';email.focus();return}
  btn.disabled=true;btn.textContent='Salvando e conferindo...';
  try{
   const c=await waitClient();const u=loggedUser();if(!c||!u?.id)throw new Error('Sessão indisponível. Entre novamente no sistema.');
   const r=await c.from('usuarios').update({cpf:cpfValue,telefone:phoneValue,email:emailValue}).eq('id',Number(u.id)).select('id,cpf,telefone,email,nome_guerra').single();
   if(r.error||!r.data)throw new Error(r.error?.message||'Não foi possível salvar os dados.');
   const still=pending(r.data);if(still.length)throw new Error('Ainda há dados pendentes: '+still.join(', ')+'.');
   updateLocal(r.data);msg.style.color='#047857';msg.textContent='Cadastro atualizado. Liberando acesso...';
   setTimeout(()=>location.replace(HOME_PAGE),250);
  }catch(err){msg.style.color='#b91c1c';msg.textContent=err?.message||String(err);btn.disabled=false;btn.textContent='Salvar dados e continuar'}
 });
 try{history.pushState({profileRequiredV769:true},'',location.href);window.addEventListener('popstate',()=>{if(overlay)history.pushState({profileRequiredV769:true},'',location.href)})}catch(_){}
}

async function check(force=false){
 const u=loggedUser();if(!u?.id||isAdmin(u)||checking)return;
 if(!force&&Date.now()-lastChecked<1500)return;checking=true;lastChecked=Date.now();
 try{
  const c=await waitClient();if(!c)return;
  const r=await c.from('usuarios').select('id,cpf,telefone,email,nome_guerra,nome_completo,ativo').eq('id',Number(u.id)).maybeSingle();
  if(r.error||!r.data)return;
  const missing=pending(r.data);if(!missing.length){updateLocal(r.data);return}
  if(page()!==CONFIG_PAGE){location.replace(CONFIG_PAGE+'?cadastro_obrigatorio=1');return}
  render(r.data,missing);
 }catch(e){console.warn('[TAREFAS WEB 7.6.9] falha ao conferir cadastro',e?.message||e)}finally{checking=false}
}
function boot(){check(true);setInterval(()=>check(false),CHECK_INTERVAL);window.addEventListener('focus',()=>check(true));document.addEventListener('visibilitychange',()=>{if(!document.hidden)check(true)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
