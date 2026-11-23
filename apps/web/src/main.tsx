import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'motion/react';
import { Swords, Gamepad2, Users, Settings2, Volume2, VolumeX, Maximize, X, Keyboard, ShieldCheck, Monitor, Search, Play, ChevronRight } from 'lucide-react';
import { RufflePlayer } from './game/RufflePlayer';
import { guardGameKeys } from './game/InputManager';
import './styles.css';

type Panel = 'offline' | 'characters' | 'settings' | 'about' | null;
interface Fighter { id: string; name: string; universe: string; portrait: string }

function App() {
  const [panel, setPanel] = useState<Panel>(null);
  const [playing, setPlaying] = useState(false);
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [search, setSearch] = useState('');
  const [volume, setVolume] = useState(() => { try { const n=Number(localStorage.getItem('bvn-volume') ?? '0.7'); return Number.isFinite(n) ? Math.min(1,Math.max(0,n)) : .7; } catch { return .7; } });
  useEffect(() => { const controller = new AbortController(); fetch('/game/characters.json',{signal:controller.signal}).then(r=>r.ok?r.json():[]).then(setFighters).catch(()=>{}); return ()=>controller.abort(); }, []);
  const updateVolume = (n:number) => { setVolume(n); try { localStorage.setItem('bvn-volume',String(n)); } catch { /* Browser may disable storage. */ } };
  return <div className="app-shell">
    <header><a className="brand" href="#" aria-label="Bleach vs Naruto trang chủ"><span className="brand-icon"><Swords size={26}/></span><span>BVN<span className="brand-sub">ARENA</span></span></a><nav aria-label="Menu chính"><button className="nav-active" onClick={()=>{setPlaying(false);setPanel(null);}}>CHƠI NGAY</button><button onClick={()=>setPanel('characters')}>NHÂN VẬT</button><button onClick={()=>setPanel('offline')}>CHẾ ĐỘ</button></nav><div className="header-right"><span className="local-label">VERSION <span>3.4</span></span><button className="icon-button" aria-label="Cài đặt" onClick={()=>setPanel('settings')}><Settings2 size={20}/></button></div></header>
    {playing ? <GameScreen volume={volume} setVolume={updateVolume} onExit={()=>setPlaying(false)}/> : <main>
      <section className="hero"><div className="hero-grid"/><div className="hero-art"><img className="hero-ichigo" src="/art/ichigo.jpg" alt="Ichigo Kurosaki"/><img className="hero-naruto" src="/art/naruto.jpg" alt="Naruto Uzumaki"/><div className="versus">VS</div></div><div className="hero-content"><div className="eyebrow"><span/> ÁNH SÁNG CHỌN NGƯỜI CHIẾN THẮNG</div><h1>BLEACH<span className="title-vs">VS</span><span className="naruto-title">NARUTO</span></h1><p className="hero-description">Hai thế giới huyền thoại.<br/>Một đấu trường duy nhất.</p><div className="hero-actions"><button className="primary" onClick={()=>setPanel('offline')}><Gamepad2 size={22}/> CHƠI NGAY</button><button className="secondary" onClick={()=>setPanel('characters')}><Users size={19}/> CHỌN NHÂN VẬT</button></div><div className="hero-details"><span><ShieldCheck size={16}/> BẢN CHÍNH THỨC 3.4</span><span><Keyboard size={16}/> BÀN PHÍM</span></div></div><div className="art-caption">SHINIGAMI <span>×</span> SHINOBI</div></section>
      <section className="mode-section"><div className="section-heading"><div><span className="eyebrow small">CHỌN TRẬN ĐẤU</span><h2>Chế độ chiến đấu<span>.</span></h2></div></div><div className="mode-grid"><button className="mode-card offline-card" onClick={()=>setPanel('offline')}><span className="card-top"><Gamepad2 size={27}/><span className="tag available">BẮT ĐẦU</span></span><h3>ĐẤU NGAY</h3><p>Vào game và lựa chọn chế độ trong đấu trường.</p><span className="card-bottom">OFFLINE <ChevronRight size={19}/></span></button><button className="mode-card roster-card" onClick={()=>setPanel('characters')}><span className="card-top"><Swords size={27}/><span className="tag">DÀN CHIẾN BINH</span></span><h3>NHÂN VẬT</h3><p>Xem danh sách chiến binh trong bản 3.4.</p><span className="card-bottom">CHỌN CHIẾN BINH <ChevronRight size={19}/></span></button><button className="mode-card training-card" onClick={()=>setPanel('settings')}><span className="card-top"><Settings2 size={27}/><span className="tag">SYSTEM</span></span><h3>CÀI ĐẶT</h3><p>Điều chỉnh âm lượng và xem phím điều khiển.</p><span className="card-bottom">TÙY CHỈNH <ChevronRight size={19}/></span></button></div></section>
    </main>}
    <footer><span>5DPLAY GAME STUDIO</span><span>BLEACH × NARUTO · 3.4</span></footer>
    <AnimatePresence>{panel && <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setPanel(null)}><motion.section role="dialog" aria-modal="true" aria-labelledby="modal-title" className={`modal ${panel==='characters'?'wide':''}`} initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} onClick={e=>e.stopPropagation()}><ModalContent panel={panel} onClose={()=>setPanel(null)} fighters={fighters} search={search} setSearch={setSearch} volume={volume} setVolume={updateVolume} onPlay={()=>{setPanel(null);setPlaying(true);}}/></motion.section></motion.div>}</AnimatePresence>
  </div>;
}

function ModalContent({panel,onClose,fighters,search,setSearch,volume,setVolume,onPlay}:{panel:Exclude<Panel,null>;onClose:()=>void;fighters:Fighter[];search:string;setSearch:(s:string)=>void;volume:number;setVolume:(n:number)=>void;onPlay:()=>void}) {
  const closeRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{const previous=document.activeElement as HTMLElement;closeRef.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const root=closeRef.current?.closest('section');const nodes=root?.querySelectorAll<HTMLElement>('button:not(:disabled),input,a[href]');if(nodes?.length){const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}};window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);previous?.focus();};},[onClose]);
  return <><div className="modal-heading"><span className="eyebrow small">BVN / {panel.toUpperCase()}</span><button ref={closeRef} className="icon-button" onClick={onClose} aria-label="Đóng"><X/></button></div>
    <h2 id="modal-title">{({offline:'Đấu trường offline',characters:'Dàn nhân vật gốc',settings:'Cài đặt trải nghiệm',about:'Bản tích hợp 3.4'})[panel]}</h2>
    {panel==='offline' && <><div className="offline-options"><span><Monitor/> ĐẤU CPU</span><span><Users/> ĐỐI KHÁNG</span><span><Swords/> LUYỆN TẬP</span></div><ControlGuide/><button className="primary full" onClick={onPlay}><Play size={20}/> BẮT ĐẦU</button></>}
    {panel==='characters' && <><label className="search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm nhân vật…" aria-label="Tìm nhân vật"/></label><div className="fighter-grid">{fighters.filter(f=>`${f.name} ${f.id}`.toLowerCase().includes(search.toLowerCase())).map(f=><article className="fighter" key={f.id}><img src={f.portrait} alt={f.name} loading="lazy"/><div><strong>{f.name}</strong><small>{f.universe}</small></div></article>)}</div>{!fighters.length && <p className="empty-roster">Đang tải danh sách chiến binh…</p>}</>}
    {panel==='settings' && <><label className="volume-label">ÂM LƯỢNG <strong>{Math.round(volume*100)}%</strong><input aria-label="Âm lượng" type="range" min="0" max="1" step="0.05" value={volume} onChange={e=>setVolume(Number(e.target.value))}/></label><ControlGuide/></>}
  </>;
}

function ControlGuide(){return <div className="controls-guide"><div><strong>PLAYER 1</strong><p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Di chuyển</p><p><kbd>J</kbd><kbd>K</kbd><kbd>L</kbd><kbd>U</kbd><kbd>I</kbd><kbd>O</kbd> Hành động</p></div><div><strong>PLAYER 2</strong><p><kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd> Di chuyển</p><p><kbd>1</kbd>–<kbd>6</kbd> Numpad · Hành động</p></div></div>}

function GameScreen({volume,setVolume,onExit}:{volume:number;setVolume:(n:number)=>void;onExit:()=>void}){
  const mount=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null),player=useRef<RufflePlayer|null>(null);
  const [status,setStatus]=useState(''),[error,setError]=useState(''),[expanded,setExpanded]=useState(false);
  useEffect(()=>{
    if(!expanded)return;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setExpanded(false);};
    const changed=()=>{if(!document.fullscreenElement)setExpanded(false);};
    window.addEventListener('keydown',escape);document.addEventListener('fullscreenchange',changed);
    return()=>{document.body.style.overflow=previousOverflow;window.removeEventListener('keydown',escape);document.removeEventListener('fullscreenchange',changed);};
  },[expanded]);
  useEffect(()=>{let active=true;let release=()=>{};try{const p=new RufflePlayer(mount.current!);player.current=p;release=guardGameKeys(mount.current!);p.load(message=>{if(active && /error|failed|无法|出错/i.test(message))setError('Không thể khởi động game');}).then(()=>{if(active){setStatus('');p.setVolume(volume);}}).catch((_error:unknown)=>{if(active)setError('Không thể khởi động game');});}catch(_error){setError('Không thể khởi động game');}return()=>{active=false;release();player.current?.destroy();player.current=null;};},[]);
  useEffect(()=>{player.current?.setVolume(volume);},[volume]);
  const fullscreen=()=>{
    setExpanded(true);setError('');
    // Keep a game-only viewport when an embedded browser denies native fullscreen.
    const focusGame=()=>player.current?.element.focus();
    if(stage.current?.requestFullscreen)stage.current.requestFullscreen().then(focusGame).catch(focusGame);
    else focusGame();
  };
  return <main className="game-page"><div className="game-heading"><div><span className="eyebrow small">CHẾ ĐỘ OFFLINE</span><h2>Bleach vs Naruto <em>3.4</em></h2></div><button className="secondary" onClick={onExit}><X size={18}/> RỜI GAME</button></div><div className={`game-stage${expanded?' is-expanded':''}`} ref={stage}><div className="game-toolbar"><span><Gamepad2 size={17}/> ĐẤU TRƯỜNG</span><div><button className="icon-button" aria-label={volume?'Tắt âm thanh':'Bật âm thanh'} onClick={()=>setVolume(volume?0:.7)}>{volume?<Volume2 size={19}/>:<VolumeX size={19}/>}</button><button className="icon-button" aria-label="Toàn màn hình" onClick={fullscreen}><Maximize size={18}/></button></div></div><div ref={mount} className="ruffle-mount"/>{status && <div className="game-status" role="status">{status}</div>}</div>{error && <div className="game-error" role="alert">{error}</div>}</main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);


