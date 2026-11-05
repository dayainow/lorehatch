import { desktop } from './platform.mjs';
let promptEvent=null,waitingWorker=null,requestedUpdate=false;
export const installed=()=>!!desktop||window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
export function installationAvailable(){return !!promptEvent;}
export async function installApp(){
 if(!promptEvent)return false;
 const event=promptEvent;promptEvent=null;await event.prompt();await event.userChoice;return true;
}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;window.dispatchEvent(new Event('lorehatch-install-ready'));});
window.addEventListener('appinstalled',()=>{promptEvent=null;window.dispatchEvent(new Event('lorehatch-installed'));});
export function applyUpdate(){if(waitingWorker){requestedUpdate=true;waitingWorker.postMessage({type:'SKIP_WAITING'});}}
export async function registerApp(){
 if(desktop||!('serviceWorker' in navigator))return;
 try{
  const registration=await navigator.serviceWorker.register(new URL('../service-worker.js',import.meta.url),{updateViaCache:'none'});
  const ready=()=>{waitingWorker=registration.waiting;if(waitingWorker&&navigator.serviceWorker.controller)window.dispatchEvent(new Event('lorehatch-update-ready'));};
  ready();registration.addEventListener('updatefound',()=>{registration.installing?.addEventListener('statechange',ready);});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(requestedUpdate)location.reload();});
 }catch{window.dispatchEvent(new Event('lorehatch-offline-unavailable'));}
}
