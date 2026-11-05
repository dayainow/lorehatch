import {earn,dayKey} from './domain.mjs';
export const ACTIVITY_SECONDS=60;
export function connectActivity(state,enabled,now=Date.now()){
 return {...state,activity:{enabled:!!enabled,lastBucket:Math.floor(now/60000),since:now}};
}
export function creditActivity(state,timestamp,now=Date.now()){
 const a=state.activity;
 if(!a?.enabled||state.mode!=='normal'||!state.tutorialClaimed||!Number.isSafeInteger(timestamp)||timestamp<=a.since||timestamp>now||now-timestamp>60000)return state;
 const bucket=Math.floor(timestamp/60000);
 if(bucket<=a.lastBucket)return state;
 let next={...state,activity:{...a,lastBucket:bucket}};
 for(let n=0;n<ACTIVITY_SECONDS;n+=5)next=earn(next,5,dayKey(new Date(timestamp)));
 return next;
}
