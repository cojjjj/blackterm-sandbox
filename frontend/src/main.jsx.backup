import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, Box, Braces, CirclePause, Clock3, Cpu, Download, FileWarning,
  Gauge, HardDrive, MemoryStick, Network, Play, Radio, RotateCcw, Search,
  ShieldAlert, Square, Workflow, Monitor, Folder, File, Terminal, Brain, Layers, Wifi, Key, MousePointer2, Puzzle, Globe2
} from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const SPEEDS = { '0.5x': 1200, '1x': 650, '2x': 325, '4x': 150 };

function severityClass(value) {
  return `severity severity-${value}`;
}

function formatClock(seconds) {
  const value = Math.max(0, Number(seconds) || 0);
  const minutes = String(Math.floor(value / 60)).padStart(2, '0');
  const secs = String(Math.floor(value % 60)).padStart(2, '0');
  return `${minutes}:${secs}`;
}

function eventSeconds(timestamp) {
  const parts = timestamp.split(':').map(Number);
  return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
}

function ProcessTree({ events }) {
  const processes = useMemo(() => {
    const roots = [{ name: 'explorer.exe', pid: 1884, level: 0, status: 'system' }];
    const seen = new Set(['explorer.exe:1884']);

    events.forEach((event) => {
      const key = `${event.process}:${event.pid ?? 'na'}`;
      if (!seen.has(key)) {
        roots.push({
          name: event.process,
          pid: event.pid,
          level: event.process === 'explorer.exe' ? 0 : 1,
          status: event.severity,
        });
        seen.add(key);
      }
      if (event.event_type === 'process' && event.target.endsWith('.exe')) {
        const targetPid = event.details?.target_pid || '—';
        const targetKey = `${event.target}:${targetPid}`;
        if (!seen.has(targetKey)) {
          roots.push({ name: event.target, pid: targetPid, level: 2, status: event.severity });
          seen.add(targetKey);
        }
      }
    });
    return roots;
  }, [events]);

  return (
    <div className="process-tree">
      {processes.map((process, index) => (
        <div className="process-row" key={`${process.name}-${process.pid}-${index}`} style={{ '--indent': process.level }}>
          <span className={`process-dot ${process.status}`} />
          <div>
            <strong>{process.name}</strong>
            <small>PID {process.pid ?? '—'}</small>
          </div>
          <span className="process-state">{process.level === 0 ? 'HOST' : process.status.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}

function NetworkMap({ events, sample }) {
  const networkEvents = events.filter((event) => event.event_type === 'network');
  const latest = networkEvents.at(-1);
  const destination = latest?.details?.remote_ip || '192.0.2.0';
  const domain = latest?.target?.replace(/^https?:\/\//, '').split('/')[0] || 'awaiting connection';

  return (
    <div className="network-map">
      <div className="net-node host"><Cpu size={22}/><strong>SANDBOX-VM</strong><small>10.10.40.25</small></div>
      <div className={`net-link ${networkEvents.length ? 'active' : ''}`}><span/></div>
      <div className="net-node gateway"><Network size={22}/><strong>SIM-GATEWAY</strong><small>isolated network</small></div>
      <div className={`net-link ${networkEvents.length ? 'active' : ''}`}><span/></div>
      <div className={`net-node remote ${networkEvents.length ? 'hot' : ''}`}><Radio size={22}/><strong>{destination}</strong><small>{domain}</small></div>
      <div className="geo-route"><Globe2 size={16}/><span>ISOLATED VM</span><i/> <span>SIMULATED DNS</span><i/> <span>RESERVED C2</span></div>
      <div className="network-meta">
        <span><b>{networkEvents.length}</b> connections</span>
        <span><b>{latest?.details?.port || '—'}</b> destination port</span>
        <span><b>{sample.name}</b> profile</span>
      </div>
    </div>
  );
}

function AttackMatrix({ techniques, activeEvents }) {
  const cells = [
    ['INITIAL ACCESS', 'T1204.002'],
    ['EXECUTION', 'T1059'],
    ['PERSISTENCE', 'T1060'],
    ['DEFENSE EVASION', 'T1055'],
    ['COMMAND & CONTROL', 'T1071.001'],
    ['COLLECTION', 'T1114'],
    ['IMPACT', 'T1486'],
    ['DISCOVERY', 'T1082'],
  ];
  const observed = new Set(activeEvents.map((event) => event.mitre_technique).filter(Boolean));

  return (
    <div className="attack-matrix">
      {cells.map(([tactic, technique]) => {
        const available = techniques.includes(technique);
        const active = observed.has(technique);
        return (
          <div className={`attack-cell ${available ? 'available' : ''} ${active ? 'active' : ''}`} key={tactic}>
            <small>{tactic}</small>
            <strong>{available ? technique : '—'}</strong>
            <span>{active ? 'OBSERVED' : available ? 'PENDING' : 'NO DATA'}</span>
          </div>
        );
      })}
    </div>
  );
}


function DesktopReplay({ events, sample, playing }) {
  const latest = events.at(-1);
  const hasProcess = events.some((event) => event.event_type === 'process');
  const hasFile = events.some((event) => event.event_type === 'file');
  const hasRegistry = events.some((event) => event.event_type === 'registry');
  const hasNetwork = events.some((event) => event.event_type === 'network');
  const terminalVisible = hasProcess || hasRegistry;
  const explorerVisible = hasFile;
  const phase = Math.min(events.length, 5);
  const cursorPositions = [[18,72],[31,55],[48,42],[67,64],[81,28],[73,38]];
  const [cursorX, cursorY] = cursorPositions[phase] || cursorPositions[0];

  return (
    <div className="vm-stage">
      <div className="vm-toolbar">
        <span><span className={`vm-dot ${playing ? 'live' : ''}`}/>{playing ? 'RECORDING' : 'REPLAY PAUSED'}</span>
        <span>SANDBOX-VM-01</span>
        <span>NETWORK: SIMULATED</span>
      </div>
      <div className="desktop-canvas">
        <div className="desktop-icons">
          <div><Monitor size={24}/><span>This PC</span></div>
          <div><Folder size={24}/><span>Artifacts</span></div>
          <div><File size={24}/><span>{sample.name}.bin</span></div>
        </div>

        <div className="simulated-cursor" style={{left: `${cursorX}%`, top: `${cursorY}%`}}><MousePointer2 size={20}/><span/></div>

        {explorerVisible && (
          <div className="fake-window explorer-window">
            <div className="window-title"><Folder size={14}/> File Explorer <span>— □ ×</span></div>
            <div className="window-body explorer-body">
              <aside>Quick access<br/>Desktop<br/>Downloads<br/>ProgramData</aside>
              <section>
                <p>C:\ProgramData\{sample.name}</p>
                {events.filter((event) => event.event_type === 'file').map((event) => (
                  <div className="fake-file" key={event.id}><File size={14}/><span>{event.target.split('\\').at(-1)}</span><small>JUST CREATED</small></div>
                ))}
              </section>
            </div>
          </div>
        )}

        {terminalVisible && (
          <div className="fake-window terminal-window">
            <div className="window-title"><Terminal size={14}/> Windows PowerShell <span>— □ ×</span></div>
            <div className="terminal-body">
              <p>PS C:\Users\Public&gt; Start-Process .\{sample.name.toLowerCase()}-loader.exe</p>
              {events.slice(-3).map((event) => <p key={event.id}><b>[{event.timestamp}]</b> {event.action}: {event.target}</p>)}
              <span className="terminal-cursor">_</span>
            </div>
          </div>
        )}

        {hasRegistry && <div className="desktop-toast"><Key size={15}/><div><b>Registry modification detected</b><span>Persistence telemetry captured</span></div></div>}
        {hasNetwork && <div className="network-toast"><Wifi size={15}/><div><b>Outbound connection</b><span>{latest?.target}</span></div></div>}
        {hasNetwork && <div className="packet-overlay"><span/><span/><span/></div>}
        {!events.length && <div className="desktop-idle"><Monitor size={34}/><strong>ISOLATED WINDOWS REPLAY</strong><span>Run the profile to visualize activity.</span></div>}

        <div className="fake-taskbar"><span className="start-button">⊞</span><span>⌕</span><span>▣</span><div/><small>{events.length ? latest?.timestamp : '00:00:00'}</small></div>
      </div>
    </div>
  );
}

function ArtifactExplorer({ events, mode }) {
  const isRegistry = mode === 'registry';
  const rows = events.filter((event) => event.event_type === (isRegistry ? 'registry' : 'file'));
  return (
    <div className="artifact-explorer">
      <aside className="artifact-tree">
        <strong>{isRegistry ? 'REGISTRY HIVES' : 'FILE SYSTEM'}</strong>
        {(isRegistry ? ['HKEY_CURRENT_USER', 'HKEY_LOCAL_MACHINE', 'HKEY_USERS'] : ['C:\\', 'Users', 'ProgramData', 'Windows', 'Temp']).map((item, index) => (
          <div className={index < 2 ? 'tree-active' : ''} key={item}>{index ? '└─' : '▾'} {item}</div>
        ))}
      </aside>
      <section className="artifact-table">
        <div className="artifact-head"><span>{isRegistry ? 'KEY / VALUE' : 'PATH'}</span><span>OPERATION</span><span>STATUS</span></div>
        {!rows.length && <div className="artifact-empty">No {isRegistry ? 'registry' : 'file-system'} telemetry observed yet.</div>}
        {rows.map((event) => (
          <div className="artifact-row" key={event.id}>
            <code>{event.target}</code><span>{event.action}</span><b className={event.severity}>CAPTURED</b>
          </div>
        ))}
      </section>
    </div>
  );
}

function MemoryView({ events }) {
  const processEvents = events.filter((event) => event.event_type === 'process');
  const regions = [
    ['IMAGE', 24, 'RX'], ['HEAP', 38, 'RW'], ['STACK', 18, 'RW'],
    ['PRIVATE', processEvents.length ? 72 : 12, processEvents.length ? 'RWX' : 'RW'],
    ['MAPPED DLL', 45, 'RX'], ['INJECTED', processEvents.length > 1 ? 88 : 4, processEvents.length > 1 ? 'RWX' : 'NONE'],
  ];
  return (
    <div className="memory-view">
      <div className="memory-map">
        {regions.map(([name, level, protection]) => (
          <div className={`memory-region ${protection === 'RWX' ? 'danger' : ''}`} key={name}>
            <div><strong>{name}</strong><span>{protection}</span></div>
            <div className="memory-bar"><span style={{width: `${level}%`}}/></div>
            <small>0x{Math.floor(level * 92831).toString(16).toUpperCase().padStart(8, '0')}</small>
          </div>
        ))}
      </div>
      <div className="hex-panel">
        <div>OFFSET&nbsp;&nbsp; 00 01 02 03 04 05 06 07&nbsp;&nbsp; ASCII</div>
        {Array.from({length: 10}, (_, index) => (
          <code key={index}>00{(index * 16).toString(16).padStart(2, '0')}F0&nbsp;&nbsp; {index % 3 === 0 ? '4D 5A 90 00 03 00 00 00' : '00 FF A1 7C 2E 10 4B 9D'}&nbsp;&nbsp; {index % 3 === 0 ? 'MZ......' : '..¡|..K.'}</code>
        ))}
      </div>
    </div>
  );
}

function DllViewer({ events, sample }) {
  const injected = events.some((event) => event.event_type === 'process' && event.severity === 'critical');
  const modules = [
    ['ntdll.dll', 'System32', 'Microsoft', 'SIGNED'],
    ['kernel32.dll', 'System32', 'Microsoft', 'SIGNED'],
    ['advapi32.dll', 'System32', 'Microsoft', 'SIGNED'],
    ['ws2_32.dll', 'System32', 'Microsoft', 'SIGNED'],
    [`${sample.name.toLowerCase()}-core.dll`, 'ProgramData', sample.name, injected ? 'SUSPICIOUS' : 'PENDING'],
  ];
  return (
    <div className="dll-viewer">
      <div className="dll-summary"><Puzzle size={26}/><div><strong>{modules.length} LOADED MODULES</strong><span>{injected ? 'Unsigned module mapped into remote process.' : 'Waiting for injection telemetry.'}</span></div></div>
      <div className="dll-table">
        <div className="dll-head"><span>MODULE</span><span>LOCATION</span><span>PUBLISHER</span><span>TRUST</span></div>
        {modules.map(([name, location, publisher, trust]) => (
          <div className={`dll-row ${trust === 'SUSPICIOUS' ? 'danger' : ''}`} key={name}>
            <code>{name}</code><span>{location}</span><span>{publisher}</span><b>{trust}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalystPanel({ events, summary }) {
  const messages = [];
  events.forEach((event) => {
    if (event.event_type === 'process') messages.push(`Process activity observed from ${event.process}; review parent-child relationships.`);
    if (event.event_type === 'file') messages.push(`A new artifact was written to ${event.target}.`);
    if (event.event_type === 'registry') messages.push('Persistence behavior detected through a registry modification.');
    if (event.event_type === 'network') messages.push(`Outbound simulated beacon detected: ${event.target}.`);
  });
  if (events.length === summary.event_count) messages.push(`Replay complete. Overall verdict: ${summary.verdict} (${summary.risk_score}/100).`);
  return (
    <div className="analyst-feed">
      {!messages.length && <div className="analyst-idle"><Brain size={24}/><span>Analyst waiting for telemetry.</span></div>}
      {messages.slice(-5).map((message, index) => (
        <div className="analyst-message" key={`${message}-${index}`}><Brain size={14}/><p>{message}</p></div>
      ))}
    </div>
  );
}

function App() {
  const [samples, setSamples] = useState([]);
  const [selectedId, setSelectedId] = useState('emotet');
  const [sample, setSample] = useState(null);
  const [summary, setSummary] = useState(null);
  const [visibleEvents, setVisibleEvents] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState('1x');
  const [activeTab, setActiveTab] = useState('timeline');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/samples`)
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('API unavailable')))
      .then(setSamples)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/samples/${selectedId}`).then((r) => r.json()),
      fetch(`${API}/samples/${selectedId}/summary`).then((r) => r.json()),
    ]).then(([detail, analysis]) => {
      setSample(detail);
      setSummary(analysis);
      setVisibleEvents(0);
      setPlaying(false);
      setActiveTab('timeline');
    }).catch(() => setError('Could not load sample data.'));
  }, [selectedId]);

  useEffect(() => {
    if (!playing || !sample) return;
    if (visibleEvents >= sample.events.length) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setVisibleEvents((count) => count + 1), SPEEDS[speed]);
    return () => window.clearTimeout(timer);
  }, [playing, visibleEvents, sample, speed]);

  const displayedEvents = useMemo(() => sample?.events.slice(0, visibleEvents) || [], [sample, visibleEvents]);
  const filteredSamples = useMemo(() => samples.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase())), [samples, query]);
  const progress = sample ? (visibleEvents / sample.events.length) * 100 : 0;
  const elapsed = displayedEvents.length ? eventSeconds(displayedEvents.at(-1).timestamp) : 0;
  const totalTime = sample?.events.length ? eventSeconds(sample.events.at(-1).timestamp) : 0;
  const latestEvent = displayedEvents.at(-1);
  const networkCount = displayedEvents.filter((event) => event.event_type === 'network').length;
  const processCount = new Set(displayedEvents.map((event) => `${event.process}-${event.pid}`)).size;
  const cpu = Math.min(92, 14 + visibleEvents * 11);
  const memory = Math.min(88, 31 + visibleEvents * 7);

  if (error) return <main className="boot-error"><ShieldAlert size={42}/><h1>BACKEND OFFLINE</h1><p>{error}</p><code>cd backend && uvicorn app.main:app --reload</code></main>;
  if (!sample || !summary) return <main className="loading">INITIALIZING SAFE REPLAY ENGINE...</main>;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">BLACKTERM SECURITY RESEARCH</p>
          <h1>BLACKTERM <span>// SANDBOX</span></h1>
        </div>
        <div className="runtime-strip">
          <div><span className="pulse"/><b>{playing ? 'ANALYZING' : visibleEvents ? 'PAUSED' : 'READY'}</b><small>SAFE REPLAY</small></div>
          <div><Cpu size={15}/><b>{cpu}%</b><small>CPU</small></div>
          <div><MemoryStick size={15}/><b>{memory}%</b><small>RAM</small></div>
          <div><Clock3 size={15}/><b>{formatClock(elapsed)}</b><small>ELAPSED</small></div>
        </div>
      </header>

      <aside className="sidebar">
        <p className="section-label">BEHAVIOR LIBRARY</p>
        <label className="search-box"><Search size={14}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search profiles..."/></label>
        <div className="sample-list">
          {filteredSamples.map((item) => (
            <button className={item.id === selectedId ? 'sample active' : 'sample'} key={item.id} onClick={() => setSelectedId(item.id)}>
              <span><strong>{item.name}</strong><small>{item.category}</small></span>
              <b>{item.risk_score}</b>
            </button>
          ))}
        </div>
        <div className="sidebar-foot"><span>LIBRARY</span><strong>{samples.length} PROFILES</strong><small>Synthetic telemetry only</small></div>
      </aside>

      <main className="workspace">
        <section className="hero card">
          <div>
            <p className="section-label">SELECTED BEHAVIOR PROFILE</p>
            <h2>{sample.name}</h2>
            <p>{sample.description}. This profile contains inert, synthetic telemetry only.</p>
            <div className="tags">{sample.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </div>
          <div className="score-ring" style={{'--score': `${summary.risk_score * 3.6}deg`}}>
            <div><strong>{summary.risk_score}</strong><span>{summary.verdict}</span></div>
          </div>
        </section>

        <section className="control-row">
          <button className="primary" onClick={() => setPlaying(!playing)} disabled={visibleEvents === sample.events.length}>
            {playing ? <CirclePause size={17}/> : <Play size={17}/>} {playing ? 'PAUSE' : visibleEvents ? 'RESUME' : 'RUN REPLAY'}
          </button>
          <button onClick={() => { setVisibleEvents(0); setPlaying(false); }}><RotateCcw size={17}/> RESET</button>
          <button onClick={() => { setVisibleEvents(sample.events.length); setPlaying(false); }}><Square size={15}/> COMPLETE</button>
          <a href={`${API}/samples/${selectedId}/report.md`}><Download size={17}/> REPORT</a>
          <select value={speed} onChange={(event) => setSpeed(event.target.value)} aria-label="Replay speed">
            {Object.keys(SPEEDS).map((option) => <option key={option}>{option}</option>)}
          </select>
          <div className="progress-wrap">
            <input type="range" min="0" max={sample.events.length} value={visibleEvents} onChange={(event) => { setVisibleEvents(Number(event.target.value)); setPlaying(false); }}/>
            <div className="progress"><span style={{width: `${progress}%`}}/></div>
            <time>{formatClock(elapsed)} / {formatClock(totalTime)}</time>
          </div>
        </section>

        <section className="stats-grid">
          <article className="card stat"><Activity/><span>EVENTS</span><strong>{visibleEvents}/{sample.events.length}</strong></article>
          <article className="card stat"><Workflow/><span>PROCESSES</span><strong>{processCount}</strong></article>
          <article className="card stat"><Network/><span>CONNECTIONS</span><strong>{networkCount}</strong></article>
          <article className="card stat"><Gauge/><span>THREAT LEVEL</span><strong>{visibleEvents ? summary.verdict : 'IDLE'}</strong></article>
          <article className="card stat"><Braces/><span>TECHNIQUES</span><strong>{summary.techniques.length}</strong></article>
          <article className="card stat"><FileWarning/><span>ARTIFACTS</span><strong>{summary.iocs.files.length + summary.iocs.registry_keys.length}</strong></article>
        </section>

        <section className="analysis-tabs">
          {[
            ['timeline', Activity, 'Timeline'],
            ['vm', Monitor, 'VM Replay'],
            ['processes', Workflow, 'Process Tree'],
            ['network', Network, 'Network Map'],
            ['files', Folder, 'File System'],
            ['registry', Key, 'Registry'],
            ['memory', Layers, 'Memory'],
            ['dlls', Puzzle, 'DLLs'],
            ['attack', Box, 'ATT&CK Matrix'],
          ].map(([id, Icon, label]) => (
            <button className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)} key={id}><Icon size={16}/>{label}</button>
          ))}
        </section>

        <section className="dashboard-grid">
          <article className="card primary-panel">
            <div className="panel-title">
              {activeTab === 'timeline' && <Activity size={18}/>}
              {activeTab === 'vm' && <Monitor size={18}/>}
              {activeTab === 'processes' && <Workflow size={18}/>}
              {activeTab === 'network' && <Network size={18}/>}
              {activeTab === 'files' && <Folder size={18}/>}
              {activeTab === 'registry' && <Key size={18}/>}
              {activeTab === 'memory' && <Layers size={18}/>}
              {activeTab === 'dlls' && <Puzzle size={18}/>}
              {activeTab === 'attack' && <Box size={18}/>}
              <h3>{{ timeline: 'BEHAVIOR TIMELINE', vm: 'WINDOWS VM REPLAY', processes: 'PROCESS TREE', network: 'NETWORK TOPOLOGY', files: 'FILE SYSTEM EXPLORER', registry: 'REGISTRY EXPLORER', memory: 'MEMORY MAP', dlls: 'LOADED DLL MODULES', attack: 'MITRE ATT&CK MATRIX' }[activeTab]}</h3>
              <span className="panel-status">{playing ? 'LIVE' : 'SNAPSHOT'}</span>
            </div>

            {activeTab === 'timeline' && (
              <div className="timeline">
                {!displayedEvents.length && <div className="empty"><Activity size={28}/><span>Press RUN REPLAY to begin analysis.</span></div>}
                {displayedEvents.map((event) => (
                  <div className="timeline-event" key={event.id}>
                    <time>{event.timestamp}</time>
                    <span className="node"/>
                    <div><div className="event-head"><strong>{event.action}</strong><span className={severityClass(event.severity)}>{event.severity}</span></div><code>{event.target}</code><p>{event.process} {event.pid ? `• PID ${event.pid}` : ''}</p></div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'vm' && <DesktopReplay events={displayedEvents} sample={sample} playing={playing}/>}
            {activeTab === 'processes' && <ProcessTree events={displayedEvents}/>}
            {activeTab === 'network' && <NetworkMap events={displayedEvents} sample={sample}/>}
            {activeTab === 'files' && <ArtifactExplorer events={displayedEvents} mode="files"/>}
            {activeTab === 'registry' && <ArtifactExplorer events={displayedEvents} mode="registry"/>}
            {activeTab === 'memory' && <MemoryView events={displayedEvents}/>}
            {activeTab === 'dlls' && <DllViewer events={displayedEvents} sample={sample}/>}
            {activeTab === 'attack' && <AttackMatrix techniques={summary.techniques} activeEvents={displayedEvents}/>}
          </article>

          <aside className="inspector-stack">
            <article className="card inspector">
              <div className="panel-title"><Activity size={18}/><h3>LIVE EVENT INSPECTOR</h3></div>
              {latestEvent ? (
                <div className="event-inspector">
                  <span className={severityClass(latestEvent.severity)}>{latestEvent.severity}</span>
                  <h4>{latestEvent.action}</h4>
                  <code>{latestEvent.target}</code>
                  <dl>
                    <div><dt>TYPE</dt><dd>{latestEvent.event_type}</dd></div>
                    <div><dt>PROCESS</dt><dd>{latestEvent.process}</dd></div>
                    <div><dt>PID</dt><dd>{latestEvent.pid || '—'}</dd></div>
                    <div><dt>MITRE</dt><dd>{latestEvent.mitre_technique || '—'}</dd></div>
                  </dl>
                </div>
              ) : <div className="inspector-empty">No telemetry observed.</div>}
            </article>

            <article className="card inspector">
              <div className="panel-title"><HardDrive size={18}/><h3>EXTRACTED IOCS</h3></div>
              <div className="ioc-list">
                {[...summary.iocs.ips, ...summary.iocs.domains, ...summary.iocs.files, ...summary.iocs.registry_keys].map((ioc) => <code key={ioc}>{ioc}</code>)}
              </div>
            </article>

            <article className="card inspector analyst-card">
              <div className="panel-title"><Brain size={18}/><h3>BLACKTERM ANALYST</h3><span className="panel-status">LOCAL</span></div>
              <AnalystPanel events={displayedEvents} summary={summary}/>
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
