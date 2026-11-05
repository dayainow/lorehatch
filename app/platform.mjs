export const desktop = window.lorehatchDesktop || null;
export const storage = desktop?.storage || {
  getItem:key=>localStorage.getItem(key),
  setItem:(key,value)=>localStorage.setItem(key,value),
  removeItem:key=>localStorage.removeItem(key)
};
export async function downloadFile(blob,name) {
  if(desktop){
    const encoded=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=reject;reader.readAsDataURL(blob);});
    desktop.download(name,encoded);return;
  }
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
}
export const SITE='https://dayainow.github.io/lorehatch/';
