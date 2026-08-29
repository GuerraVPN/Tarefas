(function(){
'use strict';
if(window.__TAREFAS_V755_PATCH__)return;
window.__TAREFAS_V755_PATCH__=true;
const VERSION='7.5.5';
const PERIOD_KEY='tarefas_v743_period';
const page=(location.pathname.split('/').pop()||'').toLowerCase();
function pad(n){return String(n).padStart(2,'0')}
function iso(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function parseIso(s){const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?new Date(+m[1],+m[2]-1,+m[3]):new Date()}
function readPeriod(){let x=null;try{x=JSON.parse(localStorage.getItem(PERIOD_KEY)||'null')}catch(_){}return{mode:['day','week','month'].includes(x?.mode)?x.mode:'day',anchor:/^\d{4}-\d{2}-\d{2}$/.test(x?.anchor||'')?x.anchor:iso(new Date())}}
function savePeriod(st){localStorage.setItem(PERIOD_KEY,JSON.stringify(st))}
function reloadPeriod(){const u=new URL(location.href);u.searchParams.set('_v755p',String(Date.now()));location.replace(u.href)}
function shiftService(dir){const st=readPeriod(),d=parseIso(st.anchor);if(st.mode==='day')d.setDate(d.getDate()+dir);else if(st.mode==='week')d.setDate(d.getDate()+7*dir);else d.setMonth(d.getMonth()+dir,1);savePeriod({mode:st.mode,anchor:iso(d)});reloadPeriod()}
function todayService(){const st=readPeriod();savePeriod({mode:st.mode,anchor:iso(new Date())});reloadPeriod()}
function serviceNav(){if(page!=='pessoal.html')return;document.addEventListener('click',e=>{const shift=e.target.closest?.('[data-v743-shift]');if(shift){e.preventDefault();e.stopImmediatePropagation();shiftService(Number(shift.dataset.v743Shift)||0);return}const btn=e.target.closest?.('button');if(!btn)return;if(btn.id==='prevMonth'||btn.id==='nextMonth'){e.preventDefault();e.stopImmediatePropagation();shiftService(btn.id==='prevMonth'?-1:1);return}if(btn.id==='todayMonth'){e.preventDefault();e.stopImmediatePropagation();todayService()}},true)}
function missionNav(){if(page!=='missao.html')return;document.getElementById('v743Period')?.remove();const style=document.createElement('style');style.id='v755MissionPeriodFix';style.textContent='html body .v7-head .v7-month{display:flex!important}';document.head.appendChild(style);const clean=()=>document.getElementById('v743Period')?.remove();setTimeout(clean,0);setTimeout(clean,300);setTimeout(clean,1000)}
function init(){document.documentElement.dataset.tarefasVersion=VERSION;serviceNav();missionNav()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();