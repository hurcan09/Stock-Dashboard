import { useAuth } from './AuthContext.tsx';
import { dataService } from '../utils/dataService';

function displayTime(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(value + 'T00:00:00').toLocaleDateString('tr-TR', {dateStyle:'medium'});
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Tarih belirtilmemiş' : date.toLocaleString('tr-TR', {dateStyle:'medium',timeStyle:'short'});
}

export default function InventoryOverview({history = false, navigate}: {history?: boolean; navigate: (page: string) => void}) {
  const {canViewPage} = useAuth();
  const products = dataService.getMaterials().filter(p => p.isActive !== false);
  const byId = new Map(dataService.getMaterials().map(p => [p.id,p]));
  const sessions = dataService.getStockCountSessions().sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  const counts = dataService.getStockCounts().sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  const critical = products.filter(p => p.currentStock <= p.minStock).sort((a,b) => a.currentStock - b.currentStock);
  const tiles = [['Aktif ürün',products.length],['Kritik stok',critical.length],['Açık sayım',sessions.filter(s=>s.status==='devam-ediyor' || s.status==='planlı').length],['Sayım kaydı',counts.length]];
  return <section className="space-y-5">
    <header className="bg-gradient-to-r from-[#103854] to-[#135369] rounded-2xl p-6 text-white">
      <h1 className="text-2xl font-bold">{history ? 'Sayım geçmişi' : 'Stok özeti'}</h1>
      {canViewPage('stock-count') && <button className="mt-4 bg-white text-lagoon-800 font-semibold rounded-lg px-4 py-2" onClick={()=>navigate('stock-count')}>Stok sayımını aç</button>}
    </header>
    {!history && <><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{tiles.map(([label,value])=><div key={label} className="rounded-xl border p-4"><span className="text-sm text-gray-600">{label}</span><p className="text-2xl font-bold text-lagoon-800">{value}</p></div>)}</div>
    <section className="rounded-xl border p-4"><h2 className="font-bold mb-3">Kritik stoktaki ürünler</h2>{critical.length ? critical.slice(0,5).map(p=><p className="py-2 border-t" key={p.id}>{p.name} · {p.currentStock} {p.unit} / alt sınır {p.minStock}</p>) : <p>Alt sınıra ulaşan ürün yok.</p>}</section></>}
    <section className="rounded-xl border p-4"><h2 className="font-bold mb-3">{history ? 'Sayım oturumları' : 'Son sayımlar'}</h2>
    {(history ? sessions : sessions.slice(0,5)).map(s=>{
      const lines = counts.filter(r=>r.sessionId===s.id);
      return <details key={s.id} className="border-t py-3"><summary className="cursor-pointer font-semibold">{s.sessionNo} · {lines.length} kayıt <span className="block text-sm font-normal text-gray-600">{displayTime(s.createdAt)} · {s.countedBy}</span></summary>
      {lines.length ? lines.map(r=><div className="mt-3 pl-3 border-l-2 border-lagoon-300" key={r.id}><strong>{r.materialName || byId.get(r.materialId)?.name || r.barcode}</strong> · {r.countedQuantity} {r.materialUnit || byId.get(r.materialId)?.unit}<small className="block">{displayTime(r.countDate || r.createdAt)} · {r.countedBy}</small></div>) : <p className="mt-2">Bu oturuma ürün kaydedilmemiş.</p>}</details>;
    })}
    {!sessions.length && <p>Henüz sayım oturumu yok.</p>}
    {!history && canViewPage('count-history') && <button className="text-lagoon-700 font-semibold mt-3" onClick={()=>navigate('count-history')}>Tüm sayımları görüntüle</button>}</section>
  </section>;
}
