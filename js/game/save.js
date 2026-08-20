const KEY="zedempire-save-v2";
export const saveExists=()=>!!localStorage.getItem(KEY);
export const writeSave=(data)=>localStorage.setItem(KEY,JSON.stringify(data));
export const readSave=()=>{try{return JSON.parse(localStorage.getItem(KEY));}catch{return null;}};
export const deleteSave=()=>localStorage.removeItem(KEY);
