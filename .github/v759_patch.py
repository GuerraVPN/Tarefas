from pathlib import Path

p=Path('pessoal_v7.js')
s=p.read_text()
def rep(old,new):
    global s
    if old not in s:
        raise SystemExit('Trecho não encontrado:\n'+old[:180])
    s=s.replace(old,new,1)

rep("const ESCALA_UI_VERSION='7.4.6';","const ESCALA_UI_VERSION='7.5.9';")
rep("let user=null,canManage=false,view=new Date(),users=new Map(),externals=new Map();","let user=null,canManage=false,canServiceSelf=false,view=new Date(),users=new Map(),externals=new Map();")
rep("function eligible(row,date){return !vacationFor(row,date)&&!adaptationFor(row,date)}",'''function projectedNear(row,date){
 const key=personKey(row);
 if(rotationServices.some(x=>samePerson(x,row)&&Math.abs(diffDays(x.data_servico,date))<=2))return true;
 for(const list of projections.values())for(const x of list){const d=x?.item?.data_servico||x?.date;if(x?.key===key&&d&&Math.abs(diffDays(d,date))<=2)return true}
 return false;
}
function eligible(row,date,checkInterval=false){return !vacationFor(row,date)&&!adaptationFor(row,date)&&(!checkInterval||!projectedNear(row,date))}''')
rep("const real=[...list].reverse().find(x=>x.date<date)||null;","const real=[...list].reverse().find(x=>x.date<date&&x.type==='actual')||null;")
rep("const r=await supabaseClient.rpc('v7_2_pode_gerenciar_pessoal',{p_usuario_id:Number(user.id),p_perfil_id:profileId()});\n canManage=!r.error&&r.data===true;\n $('manageMembers').hidden=!canManage;$('manageHolidays').hidden=!canManage;\n if(!canManage)$('scaleInfo').insertAdjacentHTML('beforeend',' Seu perfil possui acesso somente para consulta.');",'''const r=await supabaseClient.rpc('v7_2_pode_gerenciar_pessoal',{p_usuario_id:Number(user.id),p_perfil_id:profileId()});
 canManage=!r.error&&r.data===true;
 const rs=await supabaseClient.rpc('v7_5_9_pode_operar_escala',{p_usuario_id:Number(user.id),p_perfil_id:profileId()});
 canServiceSelf=!rs.error&&rs.data===true;
 $('manageMembers').hidden=!canManage;$('manageHolidays').hidden=!canManage;
 if(!canManage&&canServiceSelf)$('scaleInfo').insertAdjacentHTML('beforeend',' Você pode confirmar, trocar ou tirar os seus próprios serviços.');
 else if(!canManage)$('scaleInfo').insertAdjacentHTML('beforeend',' Seu perfil possui acesso somente para consulta.');''')
rep("if(row&&eligible(row,date)){selectedIndex=i;break}","if(row&&eligible(row,date,true)){selectedIndex=i;break}")
rep("let cls=['v7-day',dayClass(date),canManage?'manage':''],text='-',title=hol(date)?.nome||'';","const selfService=canServiceSelf&&row.usuario_id&&String(row.usuario_id)===String(user.id);\n    let cls=['v7-day',dayClass(date),(canManage||selfService)?'manage':''],text='-',title=hol(date)?.nome||'';")
rep("if(canManage)$('scaleBoard').querySelectorAll('[data-date]').forEach(td=>td.onclick=()=>openCell(td));",'''$('scaleBoard').querySelectorAll('[data-date]').forEach(td=>{
  const own=canServiceSelf&&td.dataset.user&&String(td.dataset.user)===String(user.id);
  if(canManage||own)td.onclick=()=>openCell(td);
 });''')
rep("const next=list.find(x=>x.date>date)||null;\n return{lane,prev,next,folgas:prev?countLaneDays(prev.date,date,lane):null,diasAte:next?countLaneDays(date,next.date,lane):null,diasCorridos:next?Math.max(0,diffDays(date,next.date)):null};",'''const nextConfirmed=list.find(x=>x.date>date&&x.type==='actual')||null;
 const nextPredicted=list.find(x=>x.date>date&&x.type==='predicted')||null;
 return{lane,prev,nextConfirmed,nextPredicted,folgas:prev?countLaneDays(prev.date,date,lane):null,diasAte:nextPredicted?countLaneDays(date,nextPredicted.date,lane):null,diasCorridos:nextPredicted?Math.max(0,diffDays(date,nextPredicted.date)):null};''')
rep("$('serviceFolgas').value=ctx.prev?`${ctx.folgas} dia(s) da ${ctx.lane==='vermelha'?'Vermelha':'Preta'} · último SV ${br(ctx.prev.date)}`:'Sem serviço anterior calculado nesta escala';\n $('serviceNext').value=ctx.next?`${ctx.next.type==='predicted'?'Previsto':'Confirmado'} · ${br(ctx.next.date)}`:'Sem próximo serviço calculado';\n $('serviceNextDays').value=ctx.next?`${ctx.diasAte} dia(s) desta escala · ${ctx.diasCorridos} dia(s) corridos`:'Sem previsão';",'''$('serviceFolgas').value=ctx.prev?`${ctx.folgas} dia(s) da ${ctx.lane==='vermelha'?'Vermelha':'Preta'} · último serviço confirmado ${br(ctx.prev.date)}`:'Sem serviço confirmado anterior nesta escala';
 $('serviceNext').value=ctx.nextConfirmed?`Confirmado · ${br(ctx.nextConfirmed.date)}`:'Sem próximo serviço confirmado';
 $('serviceForecast').value=ctx.nextPredicted?`Previsto · ${br(ctx.nextPredicted.date)}`:'Sem previsão automática';
 $('serviceNextDays').value=ctx.nextPredicted?`${ctx.diasAte} dia(s) desta escala · ${ctx.diasCorridos} dia(s) corridos`:'Sem previsão automática';''')
rep("$('serviceNote').value=item?.observacao||'';fillServiceContext(row,g,date,item);$('serviceChangedBy').textContent=changedBy(item);$('removeService').hidden=!item;$('swapService').hidden=!item;modal('serviceModal');",'''$('serviceNote').value=item?.observacao||'';fillServiceContext(row,g,date,item);$('serviceChangedBy').textContent=changedBy(item);
 const own=canServiceSelf&&row.usuario_id&&String(row.usuario_id)===String(user.id),allowed=canManage||own;
 $('removeService').hidden=!(item&&allowed);$('swapService').hidden=!(item&&allowed);$('markVacation').hidden=!canManage;
 const confirmBtn=$('serviceForm')?.querySelector('button[type="submit"]');if(confirmBtn)confirmBtn.hidden=!allowed;
 $('serviceMark').disabled=!allowed;$('serviceNote').disabled=!allowed;modal('serviceModal');''')
rep("const r=g==='canil'?await supabaseClient.rpc('v7_4_2_definir_servico_canil',{p_usuario_alvo_id:uid,p_pessoa_externa_id:eid,...common}):await supabaseClient.rpc('v7_2_3_definir_servico',{p_grupo:g,p_usuario_alvo_id:uid,p_pessoa_externa_id:eid,...common});",'''let r;
 if(canManage)r=g==='canil'?await supabaseClient.rpc('v7_4_2_definir_servico_canil',{p_usuario_alvo_id:uid,p_pessoa_externa_id:eid,...common}):await supabaseClient.rpc('v7_2_3_definir_servico',{p_grupo:g,p_usuario_alvo_id:uid,p_pessoa_externa_id:eid,...common});
 else{
  if(!uid||String(uid)!==String(user.id)||eid)return alert('Você só pode operar o seu próprio serviço.');
  r=await supabaseClient.rpc('v7_5_9_definir_meu_servico',{p_grupo:g,p_data_servico:common.p_data_servico,p_marcacao:common.p_marcacao,p_observacao:common.p_observacao,p_usuario_id:Number(user.id),p_perfil_id:profileId()});
 }''')
rep("const r=g==='canil'?await supabaseClient.rpc('v7_4_2_transferir_servico_canil',{p_modo:'troca',...common}):await supabaseClient.rpc('v7_2_3_trocar_servico',{p_grupo:g,...common});",'''const r=canManage?(g==='canil'?await supabaseClient.rpc('v7_4_2_transferir_servico_canil',{p_modo:'troca',...common}):await supabaseClient.rpc('v7_2_3_trocar_servico',{p_grupo:g,...common})):await supabaseClient.rpc('v7_5_9_transferir_meu_servico',{p_modo:'troca',p_grupo:g,p_data_servico:common.p_data_servico,p_destino_usuario_id:common.p_destino_usuario_id,p_destino_pessoa_externa_id:common.p_destino_pessoa_externa_id,p_observacao:common.p_observacao,p_usuario_id:Number(user.id),p_perfil_id:profileId()});''')
rep("const r=g==='canil'?await supabaseClient.rpc('v7_4_2_transferir_servico_canil',{p_modo:'substituicao',...common}):await supabaseClient.rpc('v7_2_3_substituir_servico',{p_grupo:g,...common});",'''const r=canManage?(g==='canil'?await supabaseClient.rpc('v7_4_2_transferir_servico_canil',{p_modo:'substituicao',...common}):await supabaseClient.rpc('v7_2_3_substituir_servico',{p_grupo:g,...common})):await supabaseClient.rpc('v7_5_9_transferir_meu_servico',{p_modo:'substituicao',p_grupo:g,p_data_servico:common.p_data_servico,p_destino_usuario_id:common.p_destino_usuario_id,p_destino_pessoa_externa_id:common.p_destino_pessoa_externa_id,p_observacao:common.p_observacao,p_usuario_id:Number(user.id),p_perfil_id:profileId()});''')
p.write_text(s)

h=Path('pessoal.html'); t=h.read_text()
old='''   <div class="v7-field"><label>Folgas desde o último serviço</label><input id="serviceFolgas" disabled value="-"></div>
   <div class="v7-field"><label>Próximo serviço confirmado ou previsto</label><input id="serviceNext" disabled value="-"></div>
   <div class="v7-field full"><label>Estimativa até o próximo serviço</label><input id="serviceNextDays" disabled value="-"></div>'''
new='''   <div class="v7-field"><label>Folgas desde o último serviço confirmado</label><input id="serviceFolgas" disabled value="-"></div>
   <div class="v7-field"><label>Próximo serviço confirmado</label><input id="serviceNext" disabled value="-"></div>
   <div class="v7-field"><label>Próxima previsão automática</label><input id="serviceForecast" disabled value="-"></div>
   <div class="v7-field"><label>Estimativa até a próxima previsão</label><input id="serviceNextDays" disabled value="-"></div>'''
if old not in t: raise SystemExit('Campos do modal não encontrados')
t=t.replace(old,new,1).replace('pessoal_v7.js?v=7.4.7','pessoal_v7.js?v=7.5.9')
h.write_text(t)

v=Path('v7_5_1_version.js'); z=v.read_text()
z=z.replace('__TAREFAS_V758_VERSION__','__TAREFAS_V759_VERSION__').replace("VERSION='7.5.8'","VERSION='7.5.9'")
v.write_text(z)
