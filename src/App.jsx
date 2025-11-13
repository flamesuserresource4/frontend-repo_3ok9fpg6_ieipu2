import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Splash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(() => onDone && onDone(), 1800)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 text-white">
      <div className="flex flex-col items-center gap-6">
        <div className="w-40 h-40 rounded-full border-4 border-white/30 flex items-center justify-center relative animate-spin-slow">
          <div className="absolute inset-3 rounded-full border-4 border-white/70" />
          <div className="absolute inset-6 rounded-full bg-white/10 backdrop-blur" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-wide text-center">
          Lender Service Provider
        </h1>
      </div>
      <style>{`@keyframes spin-slow{from{transform:rotate(0)}to{transform:rotate(360deg)}}.animate-spin-slow{animation:spin-slow 1.4s ease-in-out}`}</style>
    </div>
  )
}

function Home({ onChoose }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white/80 backdrop-blur p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8">Welcome</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <button onClick={() => onChoose('borrower')} className="h-32 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition">Borrower</button>
          <button onClick={() => onChoose('lender')} className="h-32 rounded-xl bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition">Lender</button>
          <button onClick={() => onChoose('services')} className="h-32 rounded-xl bg-amber-500 text-white font-semibold shadow hover:bg-amber-600 transition">Daily Services</button>
        </div>
      </div>
    </div>
  )
}

function BorrowerLanding({ go, setMobileForStatus }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6 space-y-4">
        <h3 className="text-2xl font-semibold text-gray-800">Borrower</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <button onClick={() => go('apply-choose') } className="h-28 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Apply for Loan</button>
          <button onClick={() => go('status')} className="h-28 rounded-xl bg-gray-800 text-white font-semibold hover:bg-black">View My Loan Status</button>
        </div>
        <div className="text-xs text-gray-500">Tip: Keep 3 photos and a 15s video link handy.</div>
      </div>
    </div>
  )
}

function ChooseLoanType({ onSelect, back }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">Apply for Loan</h3>
          <button onClick={back} className="text-sm text-indigo-600">Back</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 border rounded-xl">
            <h4 className="font-semibold mb-2">Vehicle Loan</h4>
            <div className="flex flex-wrap gap-2">
              {['2-wheeler','3-wheeler','4-wheeler'].map(s => (
                <button key={s} onClick={() => onSelect({category:'vehicle', subtype:s})} className="px-3 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700">{s}</button>
              ))}
            </div>
          </div>
          <div className="p-4 border rounded-xl">
            <h4 className="font-semibold mb-2">Personal / Electronics Loan</h4>
            <div className="flex flex-wrap gap-2">
              {['laptop','mobile','other'].map(s => (
                <button key={s} onClick={() => onSelect({category:'electronics', subtype:s})} className="px-3 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700 capitalize">{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ApplyForm({ preAsset, back, onSubmitted }) {
  const [borrower, setBorrower] = useState({ name: '', mobile: '', city: '' })
  const [asset, setAsset] = useState({ ...preAsset, make:'', model:'', year:'', condition:'good', notes:'' })
  const [photoUrls, setPhotoUrls] = useState(['','',''])
  const [videoUrl, setVideoUrl] = useState('')
  const [estim, setEstim] = useState(null)
  const [loading, setLoading] = useState(false)
  const canEstimate = borrower.name && borrower.mobile && borrower.city && asset.subtype

  const mediaItems = useMemo(() => {
    const photos = photoUrls.filter(Boolean).map((u, i) => ({ kind:'photo', url:u, filename:`photo-${i+1}` }))
    const videos = videoUrl ? [{ kind:'video', url:videoUrl, filename:'video-1' }] : []
    return [...photos, ...videos]
  }, [photoUrls, videoUrl])

  const estimate = async () => {
    if (!canEstimate || mediaItems.length < 3 || !videoUrl) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/estimate`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ asset: { ...asset, year: asset.year? Number(asset.year): null } }) })
      const data = await res.json()
      setEstim(data)
    } finally { setLoading(false) }
  }

  const submit = async () => {
    if (!estim) return
    setLoading(true)
    try {
      const payload = { borrower, asset: { ...asset, year: asset.year? Number(asset.year): null }, media: mediaItems }
      const res = await fetch(`${API_BASE}/api/loan-requests`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      const data = await res.json()
      onSubmitted && onSubmitted(data)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">{asset.category === 'vehicle' ? 'Vehicle' : 'Electronics'} - {asset.subtype}</h3>
          <button onClick={back} className="text-sm text-indigo-600">Back</button>
        </div>

        <section className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3 font-semibold text-gray-700">Borrower Details</div>
          <input placeholder="Full name" className="border rounded px-3 py-2" value={borrower.name} onChange={e=>setBorrower(v=>({...v,name:e.target.value}))} />
          <input placeholder="Mobile" className="border rounded px-3 py-2" value={borrower.mobile} onChange={e=>setBorrower(v=>({...v,mobile:e.target.value}))} />
          <input placeholder="City" className="border rounded px-3 py-2" value={borrower.city} onChange={e=>setBorrower(v=>({...v,city:e.target.value}))} />
        </section>

        <section className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3 font-semibold text-gray-700">Asset Details</div>
          <input placeholder="Make (optional)" className="border rounded px-3 py-2" value={asset.make} onChange={e=>setAsset(v=>({...v,make:e.target.value}))} />
          <input placeholder="Model (optional)" className="border rounded px-3 py-2" value={asset.model} onChange={e=>setAsset(v=>({...v,model:e.target.value}))} />
          <input placeholder="Year (yyyy)" className="border rounded px-3 py-2" value={asset.year} onChange={e=>setAsset(v=>({...v,year:e.target.value}))} />
          <select className="border rounded px-3 py-2" value={asset.condition} onChange={e=>setAsset(v=>({...v,condition:e.target.value}))}>
            {['excellent','good','fair','poor'].map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder="Notes" className="border rounded px-3 py-2 sm:col-span-2" value={asset.notes} onChange={e=>setAsset(v=>({...v,notes:e.target.value}))} />
        </section>

        <section className="space-y-2">
          <div className="font-semibold text-gray-700">Add Media (URLs)</div>
          <div className="grid sm:grid-cols-3 gap-3">
            {photoUrls.map((u, i)=> (
              <input key={i} placeholder={`Photo URL ${i+1}`} className="border rounded px-3 py-2" value={u} onChange={e=>{
                const arr=[...photoUrls]; arr[i]=e.target.value; setPhotoUrls(arr)
              }} />
            ))}
          </div>
          <input placeholder="Video URL (15s)" className="border rounded px-3 py-2 w-full" value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} />
          <p className="text-xs text-gray-500">Minimum 3 photos and 1 short video link required.</p>
        </section>

        <section className="space-y-2">
          <button disabled={!canEstimate || mediaItems.length < 3 || !videoUrl || loading} onClick={estimate} className="w-full bg-indigo-600 disabled:opacity-60 text-white rounded py-3 font-semibold">Estimate Value</button>
          {estim && (
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded border bg-gray-50">
                <div className="text-gray-500">Estimated Value</div>
                <div className="text-lg font-semibold">₹ {Number(estim.estimated_value).toLocaleString()}</div>
              </div>
              <div className="p-3 rounded border bg-gray-50">
                <div className="text-gray-500">Suggested Loan (LTV)</div>
                <div className="text-lg font-semibold">₹ {Number(estim.suggested_loan).toLocaleString()} <span className="text-xs text-gray-500">({Math.round(estim.ltv*100)}%)</span></div>
              </div>
              <div className="p-3 rounded border bg-gray-50">
                <div className="text-gray-500">Condition</div>
                <div className="text-lg font-semibold capitalize">{asset.condition}</div>
              </div>
            </div>
          )}
          {estim && (
            <button onClick={submit} className="w-full bg-emerald-600 text-white rounded py-3 font-semibold">Proceed to Submit</button>
          )}
        </section>
      </div>
    </div>
  )
}

function BorrowerStatus({ back }) {
  const [mobile, setMobile] = useState('')
  const [items, setItems] = useState(null)

  const fetchReqs = async () => {
    if (!mobile) return
    const res = await fetch(`${API_BASE}/api/borrower/requests?mobile=${encodeURIComponent(mobile)}`)
    const data = await res.json()
    setItems(data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">My Loan Status</h3>
          <button onClick={back} className="text-sm text-indigo-600">Back</button>
        </div>
        <div className="flex gap-2">
          <input placeholder="Enter your mobile number" className="border rounded px-3 py-2 flex-1" value={mobile} onChange={e=>setMobile(e.target.value)} />
          <button onClick={fetchReqs} className="px-4 bg-gray-800 text-white rounded">View</button>
        </div>
        <div className="space-y-3">
          {items && items.length === 0 && <div className="text-sm text-gray-600">No requests found.</div>}
          {items && items.map(item => (
            <div key={item.id} className="p-4 rounded border">
              <div className="flex justify-between">
                <div className="font-semibold">{item.borrower?.name}</div>
                <div className="text-sm px-2 py-1 rounded bg-gray-100">{item.status}</div>
              </div>
              <div className="text-sm text-gray-600">{item.asset?.category} - {item.asset?.subtype}</div>
              <div className="text-sm">Est. ₹ {Number(item.estimation?.estimated_value || 0).toLocaleString()} | Suggest: ₹ {Number(item.estimation?.suggested_loan || 0).toLocaleString()}</div>
              {item.offer_amount && <div className="text-sm text-emerald-700">Offer: ₹ {Number(item.offer_amount).toLocaleString()}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LenderDashboard({ goDetail, goBYOB, back }) {
  const [items, setItems] = useState(null)
  const load = async () => {
    const res = await fetch(`${API_BASE}/api/loan-requests`)
    const data = await res.json()
    setItems(data)
  }
  useEffect(() => { load() }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-gray-800">Lender Dashboard</h3>
          <div className="flex gap-2">
            <button onClick={goBYOB} className="px-4 py-2 rounded bg-emerald-600 text-white">Bring Your Own Borrower</button>
            <button onClick={back} className="px-4 py-2 rounded border">Home</button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {items?.map(item => (
            <div key={item.id} className="p-4 rounded-xl border bg-white space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{item.borrower?.name}</div>
                  <div className="text-sm text-gray-600">{item.asset?.category} - {item.asset?.subtype}</div>
                </div>
                <div className="text-xs px-2 py-1 rounded bg-gray-100">{item.status}</div>
              </div>
              <div className="text-sm">Est. ₹ {Number(item.estimation?.estimated_value || 0).toLocaleString()}</div>
              <div className="text-sm">Suggest: ₹ {Number(item.estimation?.suggested_loan || 0).toLocaleString()}</div>
              <button onClick={() => goDetail(item)} className="mt-2 w-full rounded bg-gray-900 text-white py-2">View Details</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LenderDetail({ item, back, onAction }) {
  const [offer, setOffer] = useState(item.offer_amount || '')
  const act = async (action) => {
    const payload = action === 'Modify' ? { action, data: { offer_amount: Number(offer) } } : { action }
    const res = await fetch(`${API_BASE}/api/loan-requests/${item.id}/status`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    const data = await res.json()
    onAction && onAction(data)
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Request Details</h3>
          <button onClick={back} className="text-sm text-emerald-700">Back</button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <div className="font-semibold">{item.borrower?.name}</div>
            <div className="text-sm text-gray-600">{item.borrower?.mobile} · {item.borrower?.city}</div>
            <div className="text-sm">{item.asset?.category} - {item.asset?.subtype} · {item.asset?.make} {item.asset?.model} {item.asset?.year}</div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {(item.media || []).filter(m=>m.kind==='photo').slice(0,3).map((m,i)=> (
                <img key={i} src={m.url} alt="media" className="h-24 w-full object-cover rounded" />
              ))}
            </div>
            {(item.media || []).find(m=>m.kind==='video') && (
              <a href={(item.media || []).find(m=>m.kind==='video')?.url} target="_blank" className="text-sm text-emerald-700 underline">Open video</a>
            )}
          </div>
          <div className="space-y-2">
            <div className="p-3 rounded border bg-gray-50">
              <div className="text-gray-500">Estimated Value</div>
              <div className="text-lg font-semibold">₹ {Number(item.estimation?.estimated_value || 0).toLocaleString()}</div>
            </div>
            <div className="p-3 rounded border bg-gray-50">
              <div className="text-gray-500">Suggested Loan</div>
              <div className="text-lg font-semibold">₹ {Number(item.estimation?.suggested_loan || 0).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => act('Approve')} className="flex-1 bg-emerald-600 text-white rounded py-2">Approve</button>
              <button onClick={() => act('Reject')} className="flex-1 bg-red-600 text-white rounded py-2">Reject</button>
            </div>
            <div className="flex gap-2">
              <input value={offer} onChange={e=>setOffer(e.target.value)} placeholder="Modify offer" className="flex-1 border rounded px-3 py-2" />
              <button onClick={() => act('Modify')} className="px-4 bg-gray-900 text-white rounded">Update</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BYOBForm({ back, onSubmitted }) {
  const [lender, setLender] = useState({ name: '', mobile: '', company: '' })
  const [borrower, setBorrower] = useState({ name: '', mobile: '', city: '' })
  const [asset, setAsset] = useState({ category:'vehicle', subtype:'2-wheeler', make:'', model:'', year:'', condition:'good' })
  const submit = async () => {
    const res = await fetch(`${API_BASE}/api/byob`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ lender, borrower, asset: { ...asset, year: asset.year? Number(asset.year): null } }) })
    const data = await res.json()
    onSubmitted && onSubmitted(data)
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Bring Your Own Borrower</h3>
          <button onClick={back} className="text-sm text-emerald-700">Back</button>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-3 font-semibold">Lender</div>
          <input placeholder="Name" className="border rounded px-3 py-2" value={lender.name} onChange={e=>setLender(v=>({...v,name:e.target.value}))} />
          <input placeholder="Mobile" className="border rounded px-3 py-2" value={lender.mobile} onChange={e=>setLender(v=>({...v,mobile:e.target.value}))} />
          <input placeholder="Company" className="border rounded px-3 py-2" value={lender.company} onChange={e=>setLender(v=>({...v,company:e.target.value}))} />
          <div className="sm:col-span-3 font-semibold mt-2">Borrower</div>
          <input placeholder="Name" className="border rounded px-3 py-2" value={borrower.name} onChange={e=>setBorrower(v=>({...v,name:e.target.value}))} />
          <input placeholder="Mobile" className="border rounded px-3 py-2" value={borrower.mobile} onChange={e=>setBorrower(v=>({...v,mobile:e.target.value}))} />
          <input placeholder="City" className="border rounded px-3 py-2" value={borrower.city} onChange={e=>setBorrower(v=>({...v,city:e.target.value}))} />
          <div className="sm:col-span-3 font-semibold mt-2">Asset</div>
          <select className="border rounded px-3 py-2" value={asset.category} onChange={e=>setAsset(v=>({...v,category:e.target.value}))}>
            <option value="vehicle">Vehicle</option>
            <option value="electronics">Electronics</option>
          </select>
          <input placeholder="Subtype (e.g., 2-wheeler / laptop)" className="border rounded px-3 py-2 sm:col-span-2" value={asset.subtype} onChange={e=>setAsset(v=>({...v,subtype:e.target.value}))} />
          <input placeholder="Make" className="border rounded px-3 py-2" value={asset.make} onChange={e=>setAsset(v=>({...v,make:e.target.value}))} />
          <input placeholder="Model" className="border rounded px-3 py-2" value={asset.model} onChange={e=>setAsset(v=>({...v,model:e.target.value}))} />
          <input placeholder="Year" className="border rounded px-3 py-2" value={asset.year} onChange={e=>setAsset(v=>({...v,year:e.target.value}))} />
          <select className="border rounded px-3 py-2" value={asset.condition} onChange={e=>setAsset(v=>({...v,condition:e.target.value}))}>
            {['excellent','good','fair','poor'].map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={submit} className="w-full bg-emerald-600 text-white rounded py-3 font-semibold">Create BYOB Lead</button>
      </div>
    </div>
  )
}

function Services({ back }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Daily Services</h3>
          <button onClick={back} className="text-sm text-amber-700">Back</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border bg-gray-50">
            <div className="font-semibold mb-1">Quick vehicle valuation</div>
            <div className="text-sm text-gray-600">Know approximate market value instantly.</div>
          </div>
          <div className="p-4 rounded-xl border bg-gray-50">
            <div className="font-semibold mb-1">Service reminder</div>
            <div className="text-sm text-gray-600">Get gentle nudges for your next service.</div>
          </div>
          <div className="p-4 rounded-xl border bg-gray-50">
            <div className="font-semibold mb-1">Insurance reminder</div>
            <div className="text-sm text-gray-600">Never miss a renewal date.</div>
          </div>
          <div className="p-4 rounded-xl border bg-gray-50">
            <div className="font-semibold mb-1">Contact partner shops</div>
            <div className="text-sm text-gray-600">Find nearby partner service centers.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [stage, setStage] = useState('splash')
  const [flow, setFlow] = useState('home')
  const [tempAsset, setTempAsset] = useState(null)
  const [lenderDetailItem, setLenderDetailItem] = useState(null)

  useEffect(() => {
    if (stage === 'splash') return
  }, [stage])

  if (stage === 'splash') return <Splash onDone={() => setStage('home')} />

  if (flow === 'home') return <Home onChoose={(x) => setFlow(x)} />

  if (flow === 'borrower') return (
    <BorrowerLanding go={(next) => setFlow(next)} />
  )

  if (flow === 'apply-choose') return (
    <ChooseLoanType back={() => setFlow('borrower')} onSelect={(asset) => { setTempAsset(asset); setFlow('apply-form') }} />
  )

  if (flow === 'apply-form') return (
    <ApplyForm preAsset={tempAsset} back={() => setFlow('apply-choose')} onSubmitted={() => setFlow('borrower-submitted')} />
  )

  if (flow === 'borrower-submitted') return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center space-y-4">
        <div className="text-3xl">✅</div>
        <h3 className="text-xl font-semibold">Request submitted</h3>
        <p className="text-gray-600 text-sm">Your loan request is saved as Pending. You can track status anytime.</p>
        <div className="grid grid-cols-2 gap-2">
          <button className="rounded bg-indigo-600 text-white py-2" onClick={() => setFlow('status')}>View Status</button>
          <button className="rounded border py-2" onClick={() => setFlow('home')}>Home</button>
        </div>
      </div>
    </div>
  )

  if (flow === 'status') return <BorrowerStatus back={() => setFlow('borrower')} />

  if (flow === 'lender') return <LenderDashboard back={() => setFlow('home')} goBYOB={() => setFlow('byob')} goDetail={(it)=> { setLenderDetailItem(it); setFlow('lender-detail') }} />

  if (flow === 'lender-detail') return <LenderDetail item={lenderDetailItem} back={() => setFlow('lender')} onAction={() => setFlow('lender')} />

  if (flow === 'byob') return <BYOBForm back={() => setFlow('lender')} onSubmitted={() => setFlow('lender')} />

  if (flow === 'services') return <Services back={() => setFlow('home')} />

  return null
}
