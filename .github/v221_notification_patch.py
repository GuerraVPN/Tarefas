from pathlib import Path

p=Path('app/native-mobile-entry.js')
s=p.read_text(encoding='utf-8')
marker='__TAREFAS_V221_NOTIFICATION_DISMISS__'
if marker not in s:
    old="""function navigateNotification(notification){const href=destinationFrom(notification);if(href)location.href=href}
async function installPushListeners(){if(pushListenersInstalled)return;pushListenersInstalled=true;await PushNotifications.addListener('registration',async({value})=>{await registerToken(value).catch(err=>console.warn('[TAREFAS PUSH] Registro:',err))});await PushNotifications.addListener('registrationError',error=>{console.error('[TAREFAS PUSH] Firebase registration error:',error);window.dispatchEvent(new CustomEvent('tarefas:push-status',{detail:{ready:false,reason:'registration_error'}}))});await PushNotifications.addListener('pushNotificationReceived',async notification=>{window.dispatchEvent(new CustomEvent('v6:notificacoes:update'));const body=notification.body||notification.data?.mensagem||'Você recebeu uma nova notificação.';await notify({title:notification.title||'TAREFAS',body,extra:notification.data||{}}).catch(()=>{})});await PushNotifications.addListener('pushNotificationActionPerformed',action=>navigateNotification(action.notification));await LocalNotifications.addListener('localNotificationActionPerformed',action=>navigateNotification({data:action.notification?.extra||{}}))}
"""
    new="""const __TAREFAS_V221_NOTIFICATION_DISMISS__=true;
function navigateNotification(notification){const href=destinationFrom(notification);if(href)location.href=href}
function notificationMatch(delivered,opened){
 const openedData=opened?.data||opened?.extra||{};
 const deliveredData=delivered?.data||delivered?.extra||{};
 const openedRemoteId=String(opened?.id||'').trim();
 const openedDbId=String(openedData.notification_id||'').trim();
 if(openedRemoteId&&String(delivered?.id||'').trim()===openedRemoteId)return true;
 return !!openedDbId&&String(deliveredData.notification_id||'').trim()===openedDbId;
}
async function dismissPushNotification(notification){
 try{
  const delivered=await PushNotifications.getDeliveredNotifications();
  const matches=(delivered?.notifications||[]).filter(item=>notificationMatch(item,notification));
  if(matches.length)await PushNotifications.removeDeliveredNotifications({notifications:matches});
 }catch(err){console.warn('[TAREFAS NOTIF] Falha ao remover push entregue:',err)}
}
async function dismissLocalNotification(notification){
 try{
  const delivered=await LocalNotifications.getDeliveredNotifications();
  const id=Number(notification?.id||0);
  const dbId=String(notification?.extra?.notification_id||'').trim();
  const matches=(delivered?.notifications||[]).filter(item=>{
   if(id&&Number(item?.id||0)===id)return true;
   return !!dbId&&String(item?.extra?.notification_id||'').trim()===dbId;
  });
  if(matches.length)await LocalNotifications.removeDeliveredNotifications({notifications:matches});
 }catch(err){console.warn('[TAREFAS NOTIF] Falha ao remover notificação local entregue:',err)}
}
async function openPushNotification(notification){await dismissPushNotification(notification);navigateNotification(notification)}
async function openLocalNotification(notification){await dismissLocalNotification(notification);navigateNotification({data:notification?.extra||{}})}
async function installPushListeners(){if(pushListenersInstalled)return;pushListenersInstalled=true;await PushNotifications.addListener('registration',async({value})=>{await registerToken(value).catch(err=>console.warn('[TAREFAS PUSH] Registro:',err))});await PushNotifications.addListener('registrationError',error=>{console.error('[TAREFAS PUSH] Firebase registration error:',error);window.dispatchEvent(new CustomEvent('tarefas:push-status',{detail:{ready:false,reason:'registration_error'}}))});await PushNotifications.addListener('pushNotificationReceived',async notification=>{window.dispatchEvent(new CustomEvent('v6:notificacoes:update'));const body=notification.body||notification.data?.mensagem||'Você recebeu uma nova notificação.';await notify({title:notification.title||'TAREFAS',body,extra:notification.data||{}}).catch(()=>{})});await PushNotifications.addListener('pushNotificationActionPerformed',action=>{openPushNotification(action.notification).catch(()=>navigateNotification(action.notification))});await LocalNotifications.addListener('localNotificationActionPerformed',action=>{openLocalNotification(action.notification).catch(()=>navigateNotification({data:action.notification?.extra||{}}))})}
"""
    if old not in s:
        raise SystemExit('native-mobile-entry.js: bloco de listeners esperado não encontrado')
    s=s.replace(old,new)
    p.write_text(s,encoding='utf-8')
    print('Patch 2.2.1 aplicado ao fluxo nativo de notificações.')
else:
    print('Patch 2.2.1 já aplicado.')
