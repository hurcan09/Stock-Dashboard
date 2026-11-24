import accounts from './accounts.json';
import assets from './assets.json';
import login from './login.html';
import css from './gate.css';
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
const random=n=>hex(crypto.getRandomValues(new Uint8Array(n)));
const encode=s=>new TextEncoder().encode(s);
const digest=async s=>hex(await crypto.subtle.digest('SHA-256',encode(s)));
async function derive(password,salt){
 const key=await crypto.subtle.importKey('raw',encode(password),'PBKDF2',false,['deriveBits']);
 return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',iterations:100000,salt:Uint8Array.from(salt.match(/../g),s=>parseInt(s,16))},key,256));
}
const send=(body,type,status=200,extra={})=>new Response(body,{status,headers:{'Content-Type':type,'Cache-Control':'no-store',...extra}});
const json=(v,status=200,extra)=>send(JSON.stringify(v),'application/json',status,extra);
const cookie=(v,age)=>({'Set-Cookie':'ege_v6='+v+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age='+age});
export default {async fetch(req,env){
 const path=new URL(req.url).pathname, db=env.DB;
 if(path==='/gate.css')return send(css,'text/css');
 const token=(req.headers.get('Cookie')||'').match(/(?:^|;\s*)ege_v6=([a-f0-9]{64})/)?.[1];
 const session=token?await db.prepare('SELECT member FROM sessions WHERE token=? AND expires>?').bind(await digest(token),Date.now()).first():null;
 if(req.method==='POST'){
  if(req.headers.get('X-Ege-Request')!=='1')return json({},403);
  if(path==='/api/logout'){if(token)await db.prepare('DELETE FROM sessions WHERE token=?').bind(await digest(token)).run();return json({},200,cookie('',0));}
  if(!['/api/register','/api/login'].includes(path))return json({},404);
  const p=await req.json().catch(()=>({}));const email=String(p.email||'').trim().toLowerCase(),name=String(p.name||'').trim(),pw=p.password;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof pw!=='string'||!pw||pw.length>256)return json({error:'E-posta ve şifreyi kontrol edin.'},400);
  let u=accounts.find(m=>m.email===email)||await db.prepare('SELECT * FROM members WHERE email=?').bind(email).first();
  if(path==='/api/register'){
   if(u||!name||name.length>80||pw.length<10)return json({error:'Kayıt tamamlanamadı. E-posta, ad ve şifreyi kontrol edin.'},400);
   const salt=random(16);u={id:crypto.randomUUID(),email,name,salt,hash:await derive(pw,salt)};
   const r=await db.prepare('INSERT OR IGNORE INTO members VALUES(?,?,?,?,?)').bind(u.id,email,name,salt,u.hash).run();if(!r.meta.changes)return json({error:'Bu e-posta kullanımda.'},409);
  }else{
   const derived=await derive(pw,(u||accounts[0]).salt);if(!u||derived!==u.hash)return json({error:'E-posta veya şifre hatalı.'},401);
  }
  const raw=random(32);await db.batch([db.prepare('DELETE FROM sessions WHERE expires<=? OR token=?').bind(Date.now(),await digest(token||'')),db.prepare('INSERT INTO sessions VALUES(?,?,?)').bind(await digest(raw),u.id,Date.now()+28800000)]);
  return json({},200,cookie(raw,28800));
 }
 if(path==='/api/me'){
  if(!session)return json({},401);
  const u=accounts.find(m=>m.id===session.member)||await db.prepare('SELECT id,name,email FROM members WHERE id=?').bind(session.member).first();
  return u?json({id:u.id,email:u.email,name:u.name,role:u.role||'staff',department:u.department||''}):json({},401);
 }
 if(!session&&(path==='/'||path==='/index.html'))return send(login,'text/html; charset=utf-8');
 if(!session&&path!=='/ege-envanter.png')return json({},401);
 const key=path==='/'?'/index.html':path;if(!Object.hasOwn(assets,key))return json({},404);
 const mime={js:'text/javascript',css:'text/css',png:'image/png',html:'text/html; charset=utf-8',svg:'image/svg+xml'}[key.split('.').pop()];
 return send(Uint8Array.from(atob(assets[key]),c=>c.charCodeAt(0)),mime||'application/octet-stream');
}};
