(function(){
  'use strict';

  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();

  function pessoa(u){
    return [u?.patente,u?.nome_guerra].filter(Boolean).join(' ').trim() || u?.nome || `Usuário ${u?.id??''}`.trim();
  }

  function label(r){
    if(!r)return 'Usuário';
    const nome=r.nome || pessoa(r);
    const perfil=[r.secao,r.posicao].filter(Boolean).join(' / ');
    return perfil ? `${nome} — ${perfil}` : nome;
  }

  function normalize(value){
    if(!value)return [];
    let raw=value;
    if(typeof raw==='string'){
      const t=raw.trim(); if(!t)return [];
      try{raw=JSON.parse(t)}catch(_){raw=t.split(/\s*[;|]\s*/).filter(Boolean)}
    }
    if(!Array.isArray(raw))raw=[raw];
    const map=new Map();
    raw.forEach(item=>{
      let r;
      if(item&&typeof item==='object'){
        const uid=item.usuario_id??item.id;
        r={
          id:uid==null||uid===''?null:String(uid),
          usuario_id:uid==null||uid===''?null:String(uid),
          perfil_id:item.perfil_id==null||item.perfil_id===''?null:String(item.perfil_id),
          nome:String(item.nome||item.name||item.nome_guerra||'').trim(),
          nome_guerra:item.nome_guerra||'',patente:item.patente||'',
          secao:item.secao||item.perfil_secao||'',posicao:item.posicao||item.perfil_posicao||'',
          principal:Boolean(item.principal??item.perfil_principal??false)
        };
      }else{
        const n=String(item||'').trim(); if(!n)return;
        r={id:null,usuario_id:null,perfil_id:null,nome:n,nome_guerra:'',patente:'',secao:'',posicao:'',principal:false};
      }
      if(!r.nome)r.nome=pessoa(r);
      const key=r.perfil_id?`p:${r.perfil_id}`:r.id?`u:${r.id}:${norm(r.secao)}:${norm(r.posicao)}`:`n:${norm(r.nome)}`;
      if(!map.has(key))map.set(key,r);
    });
    return [...map.values()];
  }

  function serialize(list){
    return JSON.stringify(normalize(list).map(r=>({
      id:r.id,usuario_id:r.id,perfil_id:r.perfil_id,nome:r.nome,
      nome_guerra:r.nome_guerra||'',patente:r.patente||'',secao:r.secao||'',
      posicao:r.posicao||'',principal:Boolean(r.principal)
    })));
  }

  function sameProfile(a,b){
    if(!a||!b)return false;
    if(a.perfil_id&&b.perfil_id)return String(a.perfil_id)===String(b.perfil_id);
    if(a.id&&b.id&&String(a.id)!==String(b.id))return false;
    return (!b.secao||norm(a.secao)===norm(b.secao)) && (!b.posicao||norm(a.posicao)===norm(b.posicao));
  }

  async function listProfiles(client,currentProfile){
    const rp=await client.from('usuario_perfis')
      .select('id,usuario_id,secao,posicao,principal,ativo')
      .eq('ativo',true).order('usuario_id',{ascending:true}).order('principal',{ascending:false}).order('id',{ascending:true});
    if(rp.error)throw rp.error;
    const ids=[...new Set((rp.data||[]).map(p=>String(p.usuario_id)))];
    let users=new Map();
    if(ids.length){
      const ru=await client.from('usuarios').select('id,nome_guerra,patente').in('id',ids);
      if(ru.error)throw ru.error;
      users=new Map((ru.data||[]).map(u=>[String(u.id),u]));
    }
    const admin=norm(currentProfile?.secao)==='admin';
    return (rp.data||[]).map(p=>{
      const u=users.get(String(p.usuario_id)); if(!u)return null;
      return {id:String(u.id),usuario_id:String(u.id),perfil_id:String(p.id),nome:pessoa(u),nome_guerra:u.nome_guerra||'',patente:u.patente||'',secao:p.secao||'',posicao:p.posicao||'',principal:Boolean(p.principal)};
    }).filter(Boolean).filter(r=>admin||norm(r.secao)!=='admin').sort((a,b)=>{
      const n=a.nome.localeCompare(b.nome,'pt-BR'); if(n)return n;
      const s=String(a.secao).localeCompare(String(b.secao),'pt-BR'); if(s)return s;
      return String(a.posicao).localeCompare(String(b.posicao),'pt-BR');
    });
  }

  async function hydrate(client,tasks){
    tasks=Array.isArray(tasks)?tasks:[]; if(!tasks.length)return true;
    const ids=tasks.map(t=>t.id).filter(v=>v!=null);
    const rv=await client.from('tarefa_responsaveis')
      .select('tarefa_id,usuario_id,perfil_id,atribuido_por,atribuido_por_perfil_id,atribuido_em').in('tarefa_id',ids);
    if(rv.error)throw rv.error;
    const pids=[...new Set((rv.data||[]).map(v=>v.perfil_id).filter(v=>v!=null).map(String))];
    let profiles=new Map();
    if(pids.length){
      const rp=await client.from('usuario_perfis').select('id,usuario_id,secao,posicao,principal,ativo').in('id',pids);
      if(rp.error)throw rp.error;
      profiles=new Map((rp.data||[]).map(p=>[String(p.id),p]));
    }
    const uids=[...new Set((rv.data||[]).map(v=>String(profiles.get(String(v.perfil_id))?.usuario_id??v.usuario_id??'')).filter(Boolean))];
    let users=new Map();
    if(uids.length){
      const ru=await client.from('usuarios').select('id,nome_guerra,patente').in('id',uids);
      if(ru.error)throw ru.error;
      users=new Map((ru.data||[]).map(u=>[String(u.id),u]));
    }
    const byTask=new Map();
    (rv.data||[]).forEach(v=>{
      const p=profiles.get(String(v.perfil_id));
      const uid=String(p?.usuario_id??v.usuario_id??'');
      const u=users.get(uid); if(!u)return;
      const r={id:uid,usuario_id:uid,perfil_id:v.perfil_id==null?null:String(v.perfil_id),nome:pessoa(u),nome_guerra:u.nome_guerra||'',patente:u.patente||'',secao:p?.secao||'',posicao:p?.posicao||'',principal:Boolean(p?.principal),atribuido_por:v.atribuido_por||null,atribuido_por_perfil_id:v.atribuido_por_perfil_id||null,atribuido_em:v.atribuido_em||null};
      const k=String(v.tarefa_id); if(!byTask.has(k))byTask.set(k,[]); byTask.get(k).push(r);
    });
    tasks.forEach(t=>{
      const list=byTask.get(String(t.id))||[];
      t.responsaveis_fase2=list;
      t.responsavel=serialize(list);
    });
    return true;
  }

  async function save(client,taskId,list,userId,profileId){
    const rows=normalize(list);
    const pids=[...new Set(rows.map(r=>String(r.perfil_id||'')).filter(x=>/^\d+$/.test(x)).map(Number))];

    if(pids.length!==rows.length){
      throw new Error('Todos os responsáveis precisam ter um perfil funcional selecionado.');
    }

    let antes=[];
    let tarefa=null;
    try{
      const [rv,rt]=await Promise.all([
        client.from('tarefa_responsaveis').select('*').eq('tarefa_id',Number(taskId)),
        client.from('tarefas').select('id,codigo,titulo').eq('id',Number(taskId)).maybeSingle()
      ]);
      if(!rv.error)antes=rv.data||[];
      if(!rt.error)tarefa=rt.data||null;
    }catch(_){}

    let ok=false;

    const rpc=await client.rpc('definir_responsaveis_perfis_tarefa',{
      p_tarefa_id:Number(taskId),
      p_perfil_ids:pids,
      p_atribuido_por:Number(userId),
      p_atribuido_por_perfil_id:profileId?Number(profileId):null
    });

    if(!rpc.error){
      ok=true;
    }else{
      const code=String(rpc.error?.code||'');
      const msg=String(rpc.error?.message||'').toLowerCase();
      const podeFallback=
        code==='PGRST202'||code==='42883'||code==='42702'||
        msg.includes('definir_responsaveis_perfis_tarefa')||
        msg.includes('ambiguous')||msg.includes('tarefa_id');

      if(!podeFallback)throw rpc.error;

      const executar=async()=>{
        const del=await client.from('tarefa_responsaveis').delete().eq('tarefa_id',Number(taskId));
        if(del.error)throw del.error;

        if(rows.length){
          const payload=rows.map(r=>({
            tarefa_id:Number(taskId),
            usuario_id:Number(r.id),
            perfil_id:Number(r.perfil_id),
            atribuido_por:Number(userId),
            atribuido_por_perfil_id:profileId?Number(profileId):null
          }));
          const ins=await client.from('tarefa_responsaveis').insert(payload);
          if(ins.error)throw ins.error;
        }
        return true;
      };

      if(window.Auditoria26)await Auditoria26.executarSemAuditoria(executar);
      else await executar();
      ok=true;
    }

    if(ok&&window.Auditoria26){
      try{
        const depoisResp=await client.from('tarefa_responsaveis').select('*').eq('tarefa_id',Number(taskId));
        const depois=depoisResp.error?[]:(depoisResp.data||[]);
        const destinos=rows.map(label).join(', ')||'nenhum perfil';
        await Auditoria26.registrarManual({
          acao:'DESPACHO',
          modulo:'Tarefas',
          tabela:'tarefa_responsaveis',
          registro_id:String(taskId),
          descricao:`Despachou ${tarefa?.codigo||('#'+taskId)}${tarefa?.titulo?' — '+tarefa.titulo:''} para ${destinos}.`,
          antes:null,
          depois:null,
          detalhes:{
            tarefa_codigo:tarefa?.codigo||null,
            tarefa_titulo:tarefa?.titulo||null,
            responsaveis_antes:antes,
            responsaveis_depois:depois
          },
          reversivel:true
        });
      }catch(err){console.warn('Auditoria do despacho:',err?.message||err)}
    }

    return true;
  }
  async function taskIds(client,userId,profileId){
    let q=client.from('tarefa_responsaveis').select('tarefa_id');
    q=profileId?q.eq('perfil_id',profileId):q.eq('usuario_id',userId);
    const r=await q; if(r.error)throw r.error;
    return [...new Set((r.data||[]).map(x=>x.tarefa_id))];
  }

  function assignedToProfile(task,profile,userId){
    if(!task)return false;
    const list=task.responsaveis_fase2?.length?task.responsaveis_fase2:normalize(task.responsavel);
    if(profile?.perfil_id)return list.some(r=>r.perfil_id&&String(r.perfil_id)===String(profile.perfil_id));
    return list.some(r=>String(r.id||'')===String(userId)&&norm(r.secao)===norm(profile?.secao)&&norm(r.posicao)===norm(profile?.posicao));
  }

  function canChangeSection(task,profile,userId){
    const s=norm(profile?.secao);
    return s==='admin'||s==='comandante'||assignedToProfile(task,profile,userId);
  }

  async function changeSection(client,taskId,newSection,userId,profileId){
    let antes=null;
    try{
      const old=await client.from('tarefas').select('*').eq('id',Number(taskId)).maybeSingle();
      if(!old.error)antes=old.data||null;
    }catch(_){}

    const r=await client.rpc('alterar_secao_tarefa_por_perfil_26pel',{
      p_tarefa_id:Number(taskId),
      p_nova_secao:newSection,
      p_usuario_id:Number(userId),
      p_perfil_id:profileId?Number(profileId):null
    });

    if(r.error)throw r.error;

    if(window.Auditoria26){
      try{
        const novo=await client.from('tarefas').select('*').eq('id',Number(taskId)).maybeSingle();
        const depois=novo.error?null:novo.data;
        await Auditoria26.registrarManual({
          acao:'SEÇÃO',
          modulo:'Tarefas',
          tabela:'tarefas',
          registro_id:String(taskId),
          descricao:`Alterou a seção responsável de "${antes?.secao||'-'}" para "${newSection}".`,
          antes,
          depois,
          detalhes:{campos:['secao']},
          reversivel:true
        });
      }catch(err){console.warn('Auditoria da seção:',err?.message||err)}
    }

    return true;
  }

  window.ResponsaveisPerfis26={norm,pessoa,label,normalize,serialize,sameProfile,listProfiles,hydrate,save,taskIds,assignedToProfile,canChangeSection,changeSection};
})();
