let prefix = '';
export function selectAccount(id: string) { prefix = 'ege-v6:' + id + ':'; }
function key(name: string) { if (!prefix) throw Error('Oturum gerekli'); return prefix + name; }
export const accountStorage = {
  getItem: (name:string) => window.localStorage.getItem(key(name)),
  setItem: (name:string,value:string) => window.localStorage.setItem(key(name),value),
  removeItem: (name:string) => window.localStorage.removeItem(key(name)),
  clear() { for (const name of Object.keys(window.localStorage)) if (name.startsWith(key(''))) window.localStorage.removeItem(name); }
};
