import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'motion/react';
import { Swords, Gamepad2, Globe2, Users, Trophy, Settings2, UserRound, Volume2, VolumeX, Maximize, X, Keyboard, ShieldCheck, Monitor, Code2, CircleHelp, Search, Play, ChevronRight } from 'lucide-react';
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
  const [error, setError] = useState('');
  useEffect(() => { const controller = new AbortController(); fetch('/game/characters.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('Không tải được danh sách nhân vật'); return r.json();}).then(setFighters).catch(e=>{if(e.name!=='AbortError')setError(String(e));}); return ()=>controller.abort(); }, []);
  const updateVolume = (n:number) => { setVolume(n); try { localStorage.setItem('bvn-volume',String(n)); } catch { /* Browser may disable storage. */ } };
  return <div className="app-shell">
    <header><a className="brand" href="#" aria-label="Bleach vs Naruto trang chủ"><span className="brand-icon"><Swords size={26}/></span><span>BVN<span className="brand-sub">ONLINE</span></span></a><nav aria-label="Menu chính"><button className="nav-active" onClick={()=>{setPlaying(false);setPanel(null);}}>ĐẤU TRƯỜNG</button><button onClick={()=>setPanel('characters')}>NHÂN VẬT</button><button disabled title="Chưa khả dụng — Phase 3">XẾP HẠNG <span className="soon">SOON</span></button></nav><div className="header-right"><span className="local-label">LOCAL BUILD <span>3.4</span></span><button className="icon-button" aria-label="Cài đặt" onClick={()=>setPanel('settings')}><Settings2 size={20}/></button><button className="profile" disabled title="Tài khoản chưa khả dụng"><UserRound size={19}/> GUEST</button></div></header>
    {playing ? <GameScreen volume={volume} setVolume={updateVolume} onExit={()=>setPlaying(false)}/> : <main>
      <section className="hero"><div className="hero-grid"/><div className="hero-art"><img className="hero-ichigo" src="/art/ichigo.jpg" alt="Ichigo Kurosaki — artwork gốc"/><img className="hero-naruto" src="/art/naruto.jpg" alt="Naruto Uzumaki — artwork gốc"/><div className="versus">VS</div></div><div className="hero-content"><div className="eyebrow"><span/> TWO WORLDS. ONE ARENA.</div><h1>BLEACH<span className="title-vs">VS</span><span className="naruto-title">NARUTO</span></h1><p className="hero-description">Hai thế giới. Một trận chiến huyền thoại.<br/>Trở lại đấu trường với gameplay nguyên bản.</p><div className="hero-actions"><button className="primary" onClick={()=>setPanel('offline')}><Gamepad2 size={22}/> PLAY OFFLINE</button><button className="secondary" onClick={()=>setPanel('characters')}><Users size={19}/> Khám phá nhân vật</button></div><div className="hero-details"><span><ShieldCheck size={16}/> Engine gốc 5DPLAY</span><span><Keyboard size={16}/> Chơi bằng bàn phím</span><span>OPEN BVN 3.4</span></div></div><div className="art-caption">SHINIGAMI <span>×</span> SHINOBI</div></section>
      <section className="mode-section"><div className="section-heading"><div><span className="eyebrow small">CHOOSE YOUR BATTLE</span><h2>Đấu theo cách của bạn<span>.</span></h2></div><span className="section-note">Bản tích hợp trình duyệt · Phase 1</span></div><div className="mode-grid"><button className="mode-card offline-card" onClick={()=>setPanel('offline')}><span className="card-top"><Gamepad2 size={27}/><span className="tag available">OFFLINE</span></span><h3>Vào trận ngay</h3><p>Đấu CPU, đối kháng cùng bạn bè hoặc luyện tập trong game gốc.</p><span className="card-bottom">OFFLINE MODE <ChevronRight size={19}/></span></button><div className="mode-card locked"><span className="card-top"><Globe2 size={27}/><span className="tag">CHƯA KHẢ DỤNG</span></span><h3>Thách đấu online</h3><p>Quick Match, tạo phòng và đấu riêng. Remote Play dự kiến ở Phase 2.</p><button disabled>PLAY ONLINE</button></div><button className="mode-card roster-card" onClick={()=>setPanel('characters')}><span className="card-top"><Swords size={27}/><span className="tag">ORIGINAL ROSTER</span></span><h3>Gặp lại huyền thoại</h3><p>Khám phá dàn nhân vật và các dạng biến hình từ bản 3.4.</p><span className="card-bottom">CHARACTERS <ChevronRight size={19}/></span></button></div></section>
      <section className="bottom-strip"><div className="strip-icon"><Monitor size={25}/></div><div><h3>Trải nghiệm gốc. Một diện mạo mới.</h3><p>ActionScript nguyên bản chạy bằng Ruffle. Không viết lại hệ thống chiến đấu.</p></div><button onClick={()=>setPanel('about')}>Thông tin bản tích hợp <CircleHelp size={17}/></button></section>
      {error && <p role="alert" className="error-inline">{error}</p>}
    </main>}
    <footer><span>FAN PROJECT <i/> GAME BY 5DPLAY GAME STUDIO</span><div><button onClick={()=>setPanel('about')}>Nguồn & giấy phép</button><a href="https://github.com/5DPLAY-Game-Studio/OpenBleachVsNaruto" target="_blank" rel="noreferrer"><Code2 size={16}/> Mã nguồn gốc</a></div><span>BLEACH × NARUTO · 3.4</span></footer>
    <AnimatePresence>{panel && <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setPanel(null)}><motion.section role="dialog" aria-modal="true" aria-labelledby="modal-title" className={`modal ${panel==='characters'?'wide':''}`} initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} onClick={e=>e.stopPropagation()}><ModalContent panel={panel} onClose={()=>setPanel(null)} fighters={fighters} search={search} setSearch={setSearch} volume={volume} setVolume={updateVolume} onPlay={()=>{setPanel(null);setPlaying(true);}}/></motion.section></motion.div>}</AnimatePresence>
  </div>;
}

function ModalContent({panel,onClose,fighters,search,setSearch,volume,setVolume,onPlay}:{panel:Exclude<Panel,null>;onClose:()=>void;fighters:Fighter[];search:string;setSearch:(s:string)=>void;volume:number;setVolume:(n:number)=>void;onPlay:()=>void}) {
  const closeRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{const previous=document.activeElement as HTMLElement;closeRef.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const root=closeRef.current?.closest('section');const nodes=root?.querySelectorAll<HTMLElement>('button:not(:disabled),input,a[href]');if(nodes?.length){const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}};window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);previous?.focus();};},[onClose]);
  return <><div className="modal-heading"><span className="eyebrow small">BVN / {panel.toUpperCase()}</span><button ref={closeRef} className="icon-button" onClick={onClose} aria-label="Đóng"><X/></button></div>
    <h2 id="modal-title">{({offline:'Đấu trường offline',characters:'Dàn nhân vật gốc',settings:'Cài đặt trải nghiệm',about:'Bản tích hợp 3.4'})[panel]}</h2>
    {panel==='offline' && <><p>Chạy bản Open BVN 3.4 chính thức trong Ruffle. Chọn chế độ từ giao diện gốc của game.</p><div className="offline-options"><span><Monitor/> Player vs CPU</span><span><Users/> Local 1v1</span><span><Swords/> Training</span></div><div className="notice">Chọn chế độ và nhân vật trong menu game gốc. Dùng W/S để di chuyển và J để xác nhận.</div><ControlGuide/><button className="primary full" onClick={onPlay}><Play size={20}/> MỞ GAME GỐC</button></>}
    {panel==='characters' && <><p>Dữ liệu đọc từ <code>fighter.xml</code> và chân dung trích từ <code>face.swf</code> của tác giả.</p><label className="search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm tên hoặc ID nhân vật…" aria-label="Tìm nhân vật"/></label><div className="fighter-grid">{fighters.filter(f=>`${f.name} ${f.id}`.toLowerCase().includes(search.toLowerCase())).map(f=><article className="fighter" key={f.id}><img src={f.portrait} alt="" loading="lazy"/><div><strong>{f.name}</strong><span>{f.id}</span><small>{f.universe}</small></div></article>)}</div>{!fighters.length && <p role="status">Chưa tải được dữ liệu nhân vật. Chạy npm run prepare:game.</p>}</>}
    {panel==='settings' && <><label className="volume-label">Âm lượng Ruffle <strong>{Math.round(volume*100)}%</strong><input aria-label="Âm lượng" type="range" min="0" max="1" step="0.05" value={volume} onChange={e=>setVolume(Number(e.target.value))}/></label><p>Âm lượng được lưu trên trình duyệt. Cài đặt nhạc và hiệu ứng riêng, cấu hình phím nằm trong menu Settings của game.</p><ControlGuide/><div className="notice">Hiển thị giữ nguyên tỷ lệ game gốc 800 × 600. Nút toàn màn hình có trên thanh công cụ khi mở game.</div></>}
    {panel==='about' && <><p>Game của 剑jian và 5DPLAY Game Studio. Dựa trên OpenBleachVsNaruto 3.4, bản debug phát hành ngày 31/10/2026.</p><div className="notice">Bản gốc phụ thuộc Adobe AIR. Bản vá trình duyệt chỉ thay lớp đọc file bằng HTTP; chi tiết và giới hạn kiểm chứng nằm trong docs/ENGINE-CHANGES.md.</div><p>Mã nguồn upstream theo GPL-3.0. Quyền thương hiệu, nhân vật, hình ảnh và âm thanh anime cần được xác minh riêng trước khi phân phối công khai.</p><a className="source-link" href="https://github.com/5DPLAY-Game-Studio/OpenBleachVsNaruto" target="_blank" rel="noreferrer"><Code2 size={18}/> Repository chính thức</a><p className="muted">Online, tài khoản, lịch sử trận và bảng xếp hạng chưa triển khai. Không ghi nhận kết quả trận từ client.</p></>}
  </>;
}

function ControlGuide(){return <div className="controls-guide"><div><strong>PLAYER 1</strong><p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Di chuyển</p><p><kbd>J</kbd><kbd>K</kbd><kbd>L</kbd><kbd>U</kbd><kbd>I</kbd><kbd>O</kbd> Hành động</p></div><div><strong>PLAYER 2</strong><p><kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd> Di chuyển</p><p><kbd>1</kbd>–<kbd>6</kbd> Numpad · Hành động</p></div></div>}

function GameScreen({volume,setVolume,onExit}:{volume:number;setVolume:(n:number)=>void;onExit:()=>void}){
  const mount=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null),player=useRef<RufflePlayer|null>(null);
  const [status,setStatus]=useState('Đang tải Ruffle và SWF…'),[error,setError]=useState(''),[expanded,setExpanded]=useState(false);
  useEffect(()=>{
    if(!expanded)return;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setExpanded(false);};
    const changed=()=>{if(!document.fullscreenElement)setExpanded(false);};
    window.addEventListener('keydown',escape);document.addEventListener('fullscreenchange',changed);
    return()=>{document.body.style.overflow=previousOverflow;window.removeEventListener('keydown',escape);document.removeEventListener('fullscreenchange',changed);};
  },[expanded]);
  useEffect(()=>{let active=true;let release=()=>{};try{const p=new RufflePlayer(mount.current!);player.current=p;release=guardGameKeys(mount.current!);p.load(message=>{if(active && /error|failed|无法|出错/i.test(message))setError(message);}).then(()=>{if(active){setStatus('SWF đã tải · Nhấn vào game để điều khiển');p.setVolume(volume);}}).catch(e=>{if(active)setError(String(e));});}catch(e){setError(String(e));}return()=>{active=false;release();player.current?.destroy();player.current=null;};},[]);
  useEffect(()=>{player.current?.setVolume(volume);},[volume]);
  const fullscreen=()=>{
    setExpanded(true);setError('');
    // Keep a game-only viewport when an embedded browser denies native fullscreen.
    const focusGame=()=>player.current?.element.focus();
    if(stage.current?.requestFullscreen)stage.current.requestFullscreen().then(focusGame).catch(focusGame);
    else focusGame();
  };
  return <main className="game-page"><div className="game-heading"><div><span className="eyebrow small">ORIGINAL ENGINE / OFFLINE</span><h2>Bleach vs Naruto <em>3.4</em></h2></div><button className="secondary" onClick={onExit}><X size={18}/> Rời game</button></div><div className={`game-stage${expanded?' is-expanded':''}`} ref={stage}><div className="game-toolbar"><span><Gamepad2 size={17}/> BLEACH VS NARUTO · 3.4</span><div><button className="icon-button" aria-label={volume?'Tắt âm thanh':'Bật âm thanh'} onClick={()=>setVolume(volume?0:.7)}>{volume?<Volume2 size={19}/>:<VolumeX size={19}/>}</button><button className="icon-button" aria-label="Toàn màn hình" onClick={fullscreen}><Maximize size={18}/></button></div></div><div ref={mount} className="ruffle-mount"/><div className="game-status" role="status">{status}</div></div>{error && <div className="notice error" role="alert">{error}</div>}<p className="game-hint">Nhấn vào game để điều khiển. Dùng W/S và J trong menu; nhấn Esc để thoát toàn màn hình.</p><ControlGuide/></main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);


