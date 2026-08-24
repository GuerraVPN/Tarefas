(function(){
'use strict';
const MQ=window.matchMedia('(max-width: 900px)');
let sidebar=null,bar=null,backdrop=null,toggle=null;

function closeMenu(){
  document.body.classList.remove('v62-menu-open');
  if(toggle) toggle.setAttribute('aria-expanded','false');
}
function openMenu(){
  if(!MQ.matches)return;
  document.body.classList.add('v62-menu-open');
  if(toggle) toggle.setAttribute('aria-expanded','true');
}
function toggleMenu(){document.body.classList.contains('v62-menu-open')?closeMenu():openMenu();}

function makeBar(){
  bar=document.createElement('div');
  bar.className='v62-mobile-bar';
  bar.id='v62MobileBar';
  bar.innerHTML='<button class="v62-menu-toggle" id="v62MenuToggle" type="button" aria-label="Abrir menu lateral" aria-expanded="false"><span class="v62-dots" aria-hidden="true"><i></i><i></i><i></i></span></button><div class="v62-mobile-brand"><strong>TAREFAS</strong><small>26º Pel PE Mec</small></div>';
  document.body.insertBefore(bar,document.body.firstChild);
  toggle=bar.querySelector('#v62MenuToggle');
  toggle.addEventListener('click',toggleMenu);

  backdrop=document.createElement('div');
  backdrop.className='v62-mobile-backdrop';
  backdrop.id='v62MobileBackdrop';
  backdrop.addEventListener('click',closeMenu);
  document.body.appendChild(backdrop);
}

function wireSidebar(){
  sidebar.addEventListener('click',function(e){
    const arrow=e.target.closest('.v6-orc-arrow');
    if(arrow && MQ.matches){
      e.preventDefault();e.stopPropagation();
      const parent=arrow.closest('.v6-orc-parent');
      if(parent) parent.classList.toggle('v62-subopen');
      return;
    }
    const nav=e.target.closest('a,button,.v6-nav-item,li');
    if(nav && MQ.matches){
      window.setTimeout(closeMenu,120);
    }
  });
}

function init(){
  sidebar=document.querySelector('.sidebar');
  if(!sidebar || document.getElementById('v62MobileBar'))return;
  document.body.classList.add('v62-mobile-ready');
  makeBar();
  wireSidebar();
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  const onChange=()=>{if(!MQ.matches)closeMenu();};
  if(MQ.addEventListener)MQ.addEventListener('change',onChange);else MQ.addListener(onChange);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

/* V6.5 loader — mantém a V6.2 mobile e carrega a camada comum da versão atual. */
(function(){
  if(document.querySelector('script[data-v65-loader],script[src*="v6_5_patch.js"]'))return;
  const s=document.createElement('script');
  s.src='v6_5_patch.js?v=6.5';
  s.defer=true;
  s.dataset.v65Loader='1';
  document.head.appendChild(s);
})();
