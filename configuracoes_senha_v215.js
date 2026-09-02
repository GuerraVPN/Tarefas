(()=>{
'use strict';
if(window.__TAREFAS_CONFIG_SENHA_V215__)return;
window.__TAREFAS_CONFIG_SENHA_V215__=true;

const page=()=>((location.pathname.split('/').pop()||'').toLowerCase());
const native=()=>!!window.__TAREFAS_NATIVE_APP__||!!window.Capacitor?.isNativePlatform?.();
function logged(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
function client(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){return null}}
function toast(message,bad=false){
 const existing=document.getElementById('toast');
 if(existing){existing.textContent=message;existing.classList.toggle('error',bad);existing.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>existing.classList.remove('show'),3600);return}
 alert(message);
}
function injectCss(){
 if(document.getElementById('v215PasswordCss'))return;
 const s=document.createElement('style');s.id='v215PasswordCss';s.textContent=`
 #v215PasswordCard{grid-column:1/-1}
 #v215PasswordCard .v215-pass-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
 #v215PasswordCard .v215-pass-field label{display:block;font-size:13px;font-weight:700;color:var(--v4-text-2,#374151);margin-bottom:6px}
 #v215PasswordCard .v215-pass-field input{width:100%;padding:11px;border:1px solid var(--v4-border-strong,#9ca3af);border-radius:8px;background:var(--v4-surface,#fff);color:var(--v4-text,#111827);outline:none}
 #v215PasswordCard .v215-pass-field input:focus{border-color:#047857;box-shadow:0 0 0 2px rgba(4,120,87,.12)}
 #v215PasswordCard .v215-pass-hint{margin-top:12px;padding:10px 11px;border-radius:8px;background:var(--v4-surface-2,#f8fafc);border:1px solid var(--v4-border,#e5e7eb);font-size:11px;line-height:1.45;color:var(--v4-muted,#6b7280)}
 #v215PasswordCard .v215-pass-btn{width:100%;margin-top:14px;border:0;border-radius:8px;padding:11px 14px;background:#047857;color:#fff;font-weight:800}
 #v215PasswordCard .v215-pass-btn:disabled{opacity:.6;cursor:not-allowed}
 @media(max-width:720px){#v215PasswordCard .v215-pass-grid{grid-template-columns:1fr}}
 `;document.head.appendChild(s);
}
function inject(){
 if(!native()||page()!=='configuracoes.html'||document.getElementById('v215PasswordCard'))return;
 const host=document.querySelector('.content .grid')||document.querySelector('.content')||document.querySelector('main');if(!host)return;
 injectCss();
 const card=document.createElement('section');card.id='v215PasswordCard';card.className='card';
 card.innerHTML=`<div class="card-title">🔐 Alterar senha</div><div class="card-body"><form id="v215PasswordForm" autocomplete="off"><div class="v215-pass-grid"><div class="v215-pass-field"><label for="v215SenhaAtual">Senha atual</label><input id="v215SenhaAtual" type="password" autocomplete="current-password" required></div><div class="v215-pass-field"><label for="v215SenhaNova">Nova senha</label><input id="v215SenhaNova" type="password" minlength="6" autocomplete="new-password" required></div><div class="v215-pass-field"><label for="v215SenhaConfirma">Confirmar nova senha</label><input id="v215SenhaConfirma" type="password" minlength="6" autocomplete="new-password" required></div></div><div class="v215-pass-hint">Informe a senha atual e escolha uma nova senha com pelo menos 6 caracteres. A mudança passa a valer no próximo login e mantém sua sessão atual no aplicativo.</div><button class="v215-pass-btn" type="submit">Alterar minha senha</button></form></div>`;
 host.appendChild(card);
 const form=card.querySelector('#v215PasswordForm'),btn=card.querySelector('.v215-pass-btn');
 form.addEventListener('submit',async e=>{
   e.preventDefault();
   const u=logged(),c=client(),current=card.querySelector('#v215SenhaAtual').value,newPass=card.querySelector('#v215SenhaNova').value,confirmPass=card.querySelector('#v215SenhaConfirma').value;
   if(!u?.id||!c){toast('Não foi possível identificar sua sessão.',true);return}
   if(newPass.length<6){toast('A nova senha precisa ter pelo menos 6 caracteres.',true);return}
   if(newPass!==confirmPass){toast('A confirmação da nova senha não confere.',true);return}
   if(current===newPass){toast('Escolha uma nova senha diferente da atual.',true);return}
   const old=btn.textContent;btn.disabled=true;btn.textContent='Alterando senha…';
   try{
     const check=await c.from('usuarios').select('id,senha').eq('id',Number(u.id)).single();
     if(check.error||!check.data)throw new Error('Não foi possível validar a senha atual.');
     if(String(check.data.senha??'')!==current)throw new Error('Senha atual incorreta.');
     const save=await c.from('usuarios').update({senha:newPass}).eq('id',Number(u.id)).select('id').single();
     if(save.error||!save.data)throw new Error(save.error?.message||'Não foi possível alterar a senha.');
     try{
       const refreshed=await c.rpc('v1_7_emitir_sessao_push',{p_usuario_id:Number(u.id),p_senha:newPass});
       if(!refreshed.error&&refreshed.data)localStorage.setItem('tarefasPushSession17',String(refreshed.data));
     }catch(_){}
     form.reset();toast('Senha alterada com sucesso.');
   }catch(err){toast(err?.message||'Não foi possível alterar a senha.',true)}finally{btn.disabled=false;btn.textContent=old}
 });
}
function start(){inject();const obs=new MutationObserver(()=>inject());obs.observe(document.body,{childList:true,subtree:true});setTimeout(inject,800)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
