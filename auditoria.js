(function(){
  'use strict';

  const TABELAS_AUDITADAS=new Set(['tarefas','usuarios','usuario_perfis','bloco_notas_usuario']);
  const FILTROS=new Set(['eq','neq','gt','gte','lt','lte','like','ilike','is','in','contains','containedBy','overlaps','match','filter','not']);
  let suspenso=0;
  let instalado=false;
  let rawFrom=null;

  function norm(v){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase()}
  function getUser(){try{return JSON.parse(localStorage.getItem('usuarioLogado')||'null')}catch(_){return null}}
  function currentModule(){
    const f=(location.pathname.split('/').pop()||'menu.html').toLowerCase();
    if(f.includes('dashboard'))return 'Dashboard';
    if(f.includes('usuario'))return 'Usuários';
    if(f.includes('config'))return 'Configurações';
    if(f.includes('calend'))return 'Calendário';
    if(f.includes('relatorio'))return 'Relatórios';
    if(f.includes('minhas'))return 'Tarefas';
    if(f.includes('historico'))return 'Auditoria';
    return 'Tarefas';
  }
  function actor(){
    const u=getUser()||{};
    return {
      usuario_id:u.id==null?null:Number(u.id),
      perfil_id:u.perfil_id==null?null:Number(u.perfil_id),
      usuario_nome:[u.patente,u.nome_guerra||u.nome].filter(Boolean).join(' ').trim()||'Usuário',
      perfil_secao:u.secao||'',
      perfil_posicao:u.posicao||''
    };
  }
  function clone(v){
    try{return JSON.parse(JSON.stringify(v))}catch(_){return v}
  }
  function sanitize(value){
    if(value==null)return value;
    if(Array.isArray(value))return value.map(sanitize);
    if(typeof value!=='object')return value;
    const out={};
    for(const [k,v] of Object.entries(value)){
      const key=norm(k);
      if(key==='senha'||key==='password'){out[k]='[NÃO REGISTRADO]';continue}
      if(key==='avatar'||key==='avatar_url'||key==='foto_url'){
        out[k]=v?'[IMAGEM]':v;continue;
      }
      if(key==='arquivos'){
        out[k]=Array.isArray(v)?`[${v.length} anexo(s)]`:v?'[ANEXOS]':v;continue;
      }
      out[k]=sanitize(v);
    }
    return out;
  }
  function fields(payload){
    if(!payload||typeof payload!=='object'||Array.isArray(payload))return [];
    return Object.keys(payload);
  }
  function reversible(table,op,payload){
    const f=fields(payload);
    if(op==='update'&&table==='tarefas'){
      const proibidos=['arquivos','historico','responsavel','criado_por','criado_por_perfil_id'];
      return !f.some(x=>proibidos.includes(x));
    }
    if(op==='update'&&table==='usuarios'){
      return !f.some(x=>['senha','avatar','avatar_url','foto_url','auth_user_id'].includes(x));
    }
    if(op==='update'&&table==='usuario_perfis')return true;
    if(op==='delete'&&table==='usuario_perfis')return true;
    if(op==='insert'&&table==='usuario_perfis'){
      const sec=norm(Array.isArray(payload)?payload[0]?.secao:payload?.secao);
      return !['admin','comandante'].includes(sec);
    }
    if(op==='insert'&&table==='bloco_notas_usuario')return true;
    if(op==='update'&&table==='bloco_notas_usuario')return true;
    if(op==='delete'&&table==='bloco_notas_usuario')return true;
    return false;
  }
  function ignored(table,op,payload){
    if(!TABELAS_AUDITADAS.has(table))return true;
    if(table==='tarefas'&&op==='insert'&&payload?.recorrencia_modelo===true)return true;
    if(table==='tarefas'&&op==='update'){
      const f=fields(payload);
      if(f.length&&f.every(x=>['historico','responsavel'].includes(x)))return true;
    }
    return false;
  }
  function action(table,op,payload){
    if(op==='insert')return 'CRIAÇÃO';
    if(op==='delete')return 'EXCLUSÃO';
    if(op==='update'&&table==='tarefas'&&fields(payload).some(x=>['status','andamento'].includes(x)))return 'STATUS';
    return 'ALTERAÇÃO';
  }
  function moduleName(table){
    if(table==='tarefas')return 'Tarefas';
    if(table==='usuarios')return currentModule()==='Configurações'?'Configurações':'Usuários';
    if(table==='usuario_perfis')return 'Perfis';
    if(table==='bloco_notas_usuario')return 'Notas';
    return currentModule();
  }
  function rowId(table,row,payload){
    const r=row||payload||{};
    if(r.id!=null)return String(r.id);
    if(table==='tarefas'&&r.codigo)return String(r.codigo);
    if(table==='usuarios'&&r.cpf)return String(r.cpf);
    return null;
  }
  function desc(table,op,row,payload){
    const r=row||payload||{};
    if(table==='tarefas'){
      const ref=r.codigo||('#'+(r.id??'?'));
      if(op==='insert')return `Criou a tarefa ${ref}${r.titulo?' — '+r.titulo:''}.`;
      if(op==='delete')return `Excluiu a tarefa ${ref}${r.titulo?' — '+r.titulo:''}.`;
      const f=fields(payload);
      if(f.includes('status'))return `Alterou o status da tarefa ${ref} para "${payload.status}".`;
      if(f.includes('andamento'))return `Alterou o andamento da tarefa ${ref}.`;
      if(f.includes('prazo'))return `Alterou o prazo da tarefa ${ref}.`;
      return `Alterou a tarefa ${ref}${r.titulo?' — '+r.titulo:''}.`;
    }
    if(table==='usuarios'){
      const nome=[r.patente,r.nome_guerra].filter(Boolean).join(' ')||r.nome_completo||r.cpf||'usuário';
      if(op==='insert')return `Criou o usuário ${nome}.`;
      if(op==='delete')return `Excluiu o usuário ${nome}.`;
      if(fields(payload).includes('senha'))return `Alterou a senha de ${nome}.`;
      if(fields(payload).includes('cpf'))return `Alterou o CPF de login de ${nome}.`;
      return `Alterou os dados de ${nome}.`;
    }
    if(table==='usuario_perfis'){
      const label=[r.secao,r.posicao].filter(Boolean).join(' — ')||'perfil';
      if(op==='insert')return `Adicionou o perfil ${label}.`;
      if(op==='delete')return `Excluiu o perfil ${label}.`;
      return `Alterou o perfil ${label}.`;
    }
    if(table==='bloco_notas_usuario'){
      const titulo=r.titulo||payload?.titulo||'nota';
      if(op==='insert')return `Criou a nota "${titulo}".`;
      if(op==='delete')return `Excluiu a nota "${titulo}".`;
      return `Alterou a nota "${titulo}".`;
    }
    return 'Ação registrada.';
  }

  async function registrarManual(ev){
    try{
      const a=actor();
      if(!a.usuario_id||typeof supabaseClient==='undefined')return null;
      const {data,error}=await supabaseClient.rpc('registrar_evento_auditoria_26pel',{
        p_usuario_id:a.usuario_id,
        p_perfil_id:a.perfil_id,
        p_usuario_nome:a.usuario_nome,
        p_perfil_secao:a.perfil_secao,
        p_perfil_posicao:a.perfil_posicao,
        p_acao:ev.acao||'ALTERAÇÃO',
        p_modulo:ev.modulo||currentModule(),
        p_tabela:ev.tabela||'sistema',
        p_registro_id:ev.registro_id==null?null:String(ev.registro_id),
        p_descricao:ev.descricao||'Ação registrada.',
        p_antes:ev.antes==null?null:sanitize(ev.antes),
        p_depois:ev.depois==null?null:sanitize(ev.depois),
        p_detalhes:sanitize(ev.detalhes||{}),
        p_reversivel:!!ev.reversivel
      });
      if(error)throw error;
      return data;
    }catch(err){
      console.warn('Auditoria: não foi possível registrar o evento.',err?.message||err);
      return null;
    }
  }

  async function rawSelect(table,filters){
    let q=rawFrom(table).select('*');
    for(const f of filters){
      try{q=q[f.name](...f.args)}catch(_){}
    }
    const r=await q;
    if(r.error)throw r.error;
    return Array.isArray(r.data)?r.data:(r.data?[r.data]:[]);
  }

  async function auditMutation(target,table,op,filters){
    if(suspenso>0||ignored(table,op.type,op.payload)){
      return await target;
    }

    let before=[];
    if(op.type==='update'||op.type==='delete'){
      try{before=await rawSelect(table,filters)}catch(err){console.warn('Auditoria snapshot anterior:',err?.message||err)}
    }

    const result=await target;
    if(result?.error)return result;

    let after=[];
    if(op.type==='update'){
      try{after=await rawSelect(table,filters)}catch(err){console.warn('Auditoria snapshot posterior:',err?.message||err)}
    }else if(op.type==='insert'){
      const d=result?.data;
      if(Array.isArray(d))after=d;
      else if(d)after=[d];
      else if(Array.isArray(op.payload))after=op.payload;
      else after=[op.payload];
    }

    const acao=action(table,op.type,op.payload);
    const modulo=moduleName(table);
    const rev=reversible(table,op.type,op.payload);
    const campos=fields(op.payload);
    const base=before.length?before:after;

    if(!base.length&&op.payload)base.push(op.payload);

    // Em mutações em lote, um evento por registro.
    for(let i=0;i<base.length;i++){
      const b=before[i]||null;
      let a=null;
      if(op.type==='update'){
        const id=b?.id;
        a=id!=null?after.find(x=>String(x.id)===String(id))||after[i]||null:after[i]||null;
      }else if(op.type==='insert')a=after[i]||base[i]||null;

      const ref=b||a||op.payload;
      await registrarManual({
        acao,
        modulo,
        tabela:table,
        registro_id:rowId(table,ref,op.payload),
        descricao:desc(table,op.type,ref,op.payload),
        antes:b,
        depois:a,
        detalhes:{campos,operacao:op.type},
        reversivel:rev
      });
    }

    return result;
  }

  function wrap(builder,table,op=null,filters=[]){
    if(!builder||typeof builder!=='object')return builder;
    return new Proxy(builder,{
      get(target,prop,receiver){
        if(prop==='then'){
          if(!op)return target.then.bind(target);
          return (resolve,reject)=>auditMutation(target,table,op,filters).then(resolve,reject);
        }

        const value=Reflect.get(target,prop,receiver);
        if(typeof value!=='function')return value;

        if(prop==='update'){
          return payload=>wrap(target.update(payload),table,{type:'update',payload:clone(payload)},filters);
        }
        if(prop==='insert'){
          return (payload,...args)=>wrap(target.insert(payload,...args),table,{type:'insert',payload:clone(payload)},filters);
        }
        if(prop==='delete'){
          return (...args)=>wrap(target.delete(...args),table,{type:'delete',payload:null},filters);
        }

        return (...args)=>{
          const next=value.apply(target,args);
          const nextFilters=FILTROS.has(String(prop))
            ?[...filters,{name:String(prop),args:clone(args)}]
            :filters;
          return wrap(next,table,op,nextFilters);
        };
      }
    });
  }

  function instalarProxy(){
    if(instalado||typeof supabaseClient==='undefined')return;
    rawFrom=supabaseClient.from.bind(supabaseClient);
    supabaseClient.from=function(table){
      const b=rawFrom(table);
      if(!TABELAS_AUDITADAS.has(table))return b;
      return wrap(b,table,null,[]);
    };
    instalado=true;
  }

  async function executarSemAuditoria(fn){
    suspenso++;
    try{return await fn()}finally{suspenso=Math.max(0,suspenso-1)}
  }

  function injectNav(){
    const u=getUser();
    if(norm(u?.secao)!=='admin')return;
    const sidebar=document.querySelector('.sidebar');
    if(!sidebar||document.querySelector('[data-auditoria-nav]'))return;

    const lista=sidebar.querySelector('ul');
    if(!lista)return;

    const li=document.createElement('li');
    li.dataset.auditoriaNav='1';
    li.title='Histórico / Auditoria';
    li.innerHTML='🛡️ Histórico / Auditoria';
    li.onclick=()=>location.href='historico_auditoria.html';

    const config=[...lista.children].find(x=>(x.textContent||'').toLowerCase().includes('config'));
    if(config)lista.insertBefore(li,config);
    else lista.appendChild(li);
  }

  function init(){
    instalarProxy();
    injectNav();
  }

  window.Auditoria26={registrarManual,executarSemAuditoria,instalarProxy,injectNav,norm};

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();