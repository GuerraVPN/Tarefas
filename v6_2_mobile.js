/* V7.7.1 hotfix — loader por página e mobile sem cadeia global desnecessária. */
(function(){
'use strict';
const page=(location.pathname.split('/').pop()||'').toLowerCase();
if(page!=='pessoal.html'||window.__TAREFAS_V751_ROTATION_PATCH__)return;
window.__TAREFAS_V751_ROTATION_PATCH__=true;
function install(){
  let c=null;try{c=typeof supabaseClient!=='undefined'?supabaseClient:null}catch(_){}
  if(!c||c.__v751RotationInstalled)return false;
  const originalRpc=c.rpc.bind(c);
  c.rpc=function(name,args,options){
    if(name==='v7_2_3_substituir_servico')return originalRpc('v7_5_1_substituir_servico',args,options);
    if(name==='v7_4_2_transferir_servico_canil'&&args?.p_modo==='substituicao'){
      const next={...args};delete next.p_modo;return originalRpc('v7_5_1_substituir_servico_canil',next,options);
    }
    return originalRpc(name,args,options);
  };
  const originalFrom=c.from.bind(c);
  c.from=function(relation){
    const query=originalFrom(relation);if(relation!=='escala_servicos')return query;
    const originalSelect=query.select.bind(query);
    query.select=function(){
      const builder=originalSelect.apply(query,arguments);let ini=null,fim=null;
      if(typeof builder.gte==='function'){const old=builder.gte.bind(builder);builder.gte=function(col,val){if(col==='data_servico')ini=String(val||'');return old(col,val)}}
      if(typeof builder.lte==='function'){const old=builder.lte.bind(builder);builder.lte=function(col,val){if(col==='data_servico')fim=String(val||'');return old(col,val)}}
      if(typeof builder.then==='function'){
        const oldThen=builder.then.bind(builder);builder.then=function(resolve,reject){
          return oldThen(function(res){
            let wide=false;
            if(ini&&fim){const a=Date.parse(ini+'T12:00:00Z'),b=Date.parse(fim+'T12:00:00Z');wide=Number.isFinite(a)&&Number.isFinite(b)&&((b-a)/86400000)>400}
            if(wide&&Array.isArray(res?.data)){
              const data=res.data.map(row=>row?.rodizio_usuario_id!=null||row?.rodizio_pessoa_externa_id!=null
                ?{...row,_executor_usuario_id:row.usuario_id,_executor_pessoa_externa_id:row.pessoa_externa_id,usuario_id:row.rodizio_usuario_id??null,pessoa_externa_id:row.rodizio_pessoa_externa_id??null}:row);
              res={...res,data};
            }
            return resolve?resolve(res):res;
          },reject);
        };
      }
      return builder;
    };
    return query;
  };
  c.__v751RotationInstalled=true;return true;
}
if(!install()){
  const timer=setInterval(()=>{if(install())clearInterval(timer)},100);
  setTimeout(()=>clearInterval(timer),5000);
}
})();

(function(){
'use strict';
const MQ=window.matchMedia('(max-width: 900px)');
let sidebar=null,bar=null,backdrop=null,toggle=null;
function closeMenu(){document.body.classList.remove('v62-menu-open');if(toggle)toggle.setAttribute('aria-expanded','false')}
function openMenu(){if(!MQ.matches)return;document.body.classList.add('v62-menu-open');toggle?.setAttribute('aria-expanded','true')}
function toggleMenu(){document.body.classList.contains('v62-menu-open')?closeMenu():openMenu()}
function makeBar(){
  bar=document.createElement('div');bar.className='v62-mobile-bar';bar.id='v62MobileBar';
  bar.innerHTML='<button class="v62-menu-toggle" id="v62MenuToggle" type="button" aria-label="Abrir menu lateral" aria-expanded="false"><span class="v62-dots" aria-hidden="true"><i></i><i></i><i></i></span></button><div class="v62-mobile-brand"><strong>TAREFAS</strong><small>26º Pel PE Mec</small></div>';
  document.body.insertBefore(bar,document.body.firstChild);toggle=bar.querySelector('#v62MenuToggle');toggle.addEventListener('click',toggleMenu);
  backdrop=document.createElement('div');backdrop.className='v62-mobile-backdrop';backdrop.id='v62MobileBackdrop';backdrop.addEventListener('click',closeMenu);document.body.appendChild(backdrop);
}
function wireSidebar(){
  sidebar.addEventListener('click',function(e){
    if(!MQ.matches)return;
    const pessoalMain=e.target.closest('[data-v7-main]');
    if(pessoalMain){e.preventDefault();e.stopPropagation();const parent=pessoalMain.closest('.v7-pessoal-parent,.v6-orc-parent');if(parent){parent.classList.toggle('v62-subopen');pessoalMain.setAttribute('aria-expanded',parent.classList.contains('v62-subopen')?'true':'false')}return}
    const arrow=e.target.closest('.v6-orc-arrow');
    if(arrow){e.preventDefault();e.stopPropagation();const parent=arrow.closest('.v6-orc-parent');if(parent)parent.classList.toggle('v62-subopen');return}
    const nav=e.target.closest('a,button,.v6-nav-item,li');if(nav)window.setTimeout(closeMenu,120);
  });
}
function init(){
  sidebar=document.querySelector('.sidebar');if(!sidebar||document.getElementById('v62MobileBar'))return;
  document.body.classList.add('v62-mobile-ready');makeBar();wireSidebar();
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
  const onChange=()=>{if(!MQ.matches)closeMenu()};if(MQ.addEventListener)MQ.addEventListener('change',onChange);else MQ.addListener(onChange);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

/* V7.7.1 — loader condicional por página. */
(function(){
'use strict';
if(window.__TAREFAS_V771_PAGE_LOADER__)return;
window.__TAREFAS_V771_PAGE_LOADER__=true;
const page=(location.pathname.split('/').pop()||'dashboard.html').toLowerCase();
const heavy=new Set(['about.html','games.html','orcamentarios.html']);
function add(src,attr,done){
  const plain=src.split('?')[0];
  const old=document.querySelector(`script[${attr}],script[src*="${plain}"]`);
  if(old){done?.();return}
  const s=document.createElement('script');s.src=src;s.defer=true;s.setAttribute(attr,'1');
  if(done)s.onload=done;document.head.appendChild(s);
}
function chain(list,i=0){if(i>=list.length)return;const [src,attr]=list[i];add(src,attr,()=>chain(list,i+1))}
if(heavy.has(page)){
  const list=[
    ['v7_7_1_site_light.js?v=7.7.1','data-v771-site-light'],
    ['v6_5_patch.js?v=7.7.1-perf','data-v65-loader'],
    ['v7_6_5_webfix.js?v=7.7.1-perf','data-v765-webfix']
  ];
  if(page==='about.html')list.push(['v7_5_1_about.js?v=7.7.1','data-v751-about']);
  chain(list);
  if(page==='games.html'){
    const stamp=()=>{const el=document.getElementById('gamesVersionLabel');if(el&&el.textContent!=='WEB 7.7.1 · 26º PEL PE MEC')el.textContent='WEB 7.7.1 · 26º PEL PE MEC'};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',stamp,{once:true});else stamp();
  }
  return;
}
const list=[
  ['v7_4_12_site.js?v=7.7.1-perf','data-v7412-site'],
  ['v6_5_patch.js?v=7.7.1-perf','data-v65-loader'],
  ['v7_4_12_global.js?v=7.7.1-perf','data-v7412-global'],
  ['v7_5_1_version.js?v=7.7.1-perf','data-v751-version']
];
if(page==='missao.html'){
  list.push(['v7_4_7_mission_patch.js?v=7.7.1','data-v747-mission-patch']);
  list.push(['v7_4_7_aditamento_patch.js?v=7.7.1','data-v747-aditamento-patch']);
}
if(page==='pessoal.html'){
  list.push(['v7_4_3_period.js?v=7.7.1','data-v743-period']);
  list.push(['v7_4_3_pdf.js?v=7.7.1','data-v743-pdf']);
  list.push(['v7_4_2_search_order.js?v=7.7.1','data-v742-search-order']);
  list.push(['v7_4_2_transfer.js?v=7.7.1','data-v742-transfer']);
  list.push(['v7_4_2_replace.js?v=7.7.1','data-v742-replace']);
  list.push(['v7_5_service_editor.js?v=7.7.1','data-v75-service-editor']);
}
chain(list);
})();