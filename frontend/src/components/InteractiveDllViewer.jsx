import React, { useMemo, useState } from 'react';
import {
  Binary,
  ChevronRight,
  Clock3,
  FileCode2,
  Fingerprint,
  Link2,
  ShieldCheck,
  ShieldX,
  X,
} from 'lucide-react';

function deterministicHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Array.from({ length: 8 }, (_, index) =>
    ((hash >>> ((index % 4) * 8)) & 255).toString(16).padStart(2, '0'),
  ).join('').repeat(4);
}

function moduleRisk(module) {
  if (module.trust === 'SUSPICIOUS') return 94;
  if (module.trust === 'PENDING') return 42;
  return 3;
}

export default function InteractiveDllViewer({
  events = [],
  sample,
  activeEvent,
  onCrossHighlight,
}) {
  const injected = events.some(
    (event) =>
      event.event_type === 'process' &&
      (event.severity === 'critical' || event.action?.toLowerCase().includes('thread')),
  );

  const modules = useMemo(() => {
    const observedAt = events.find(
      (event) => event.event_type === 'process' && event.severity === 'critical',
    )?.timestamp;

    return [
      {
        name: 'ntdll.dll',
        location: 'C:\\Windows\\System32',
        publisher: 'Microsoft Windows',
        trust: 'SIGNED',
        compileTime: '2025-10-14 08:21 UTC',
        entropy: 6.21,
        imports: ['NtAllocateVirtualMemory', 'NtProtectVirtualMemory'],
      },
      {
        name: 'kernel32.dll',
        location: 'C:\\Windows\\System32',
        publisher: 'Microsoft Windows',
        trust: 'SIGNED',
        compileTime: '2025-10-14 08:21 UTC',
        entropy: 6.08,
        imports: ['CreateProcessW', 'VirtualAlloc', 'WriteProcessMemory'],
      },
      {
        name: 'advapi32.dll',
        location: 'C:\\Windows\\System32',
        publisher: 'Microsoft Windows',
        trust: 'SIGNED',
        compileTime: '2025-10-14 08:21 UTC',
        entropy: 5.92,
        imports: ['RegSetValueExW', 'OpenSCManagerW'],
      },
      {
        name: 'ws2_32.dll',
        location: 'C:\\Windows\\System32',
        publisher: 'Microsoft Windows',
        trust: 'SIGNED',
        compileTime: '2025-10-14 08:21 UTC',
        entropy: 5.74,
        imports: ['connect', 'send', 'recv', 'getaddrinfo'],
      },
      {
        name: `${sample.name.toLowerCase().replace(/\s+/g, '-')}-core.dll`,
        location: `C:\\ProgramData\\${sample.name}`,
        publisher: sample.name,
        trust: injected ? 'SUSPICIOUS' : 'PENDING',
        compileTime: 'Unknown / synthetic',
        entropy: injected ? 7.83 : 7.11,
        imports: ['VirtualAllocEx', 'WriteProcessMemory', 'CreateRemoteThread'],
        observedAt: observedAt || 'Awaiting replay',
      },
    ].map((module) => ({
      ...module,
      sha256: deterministicHash(`${sample.name}:${module.name}`),
      risk: moduleRisk(module),
      sections:
        module.trust === 'SUSPICIOUS'
          ? ['.text', '.rdata', '.data', '.rsrc', '.packed']
          : ['.text', '.rdata', '.data', '.pdata', '.reloc'],
    }));
  }, [events, injected, sample]);

  const suspiciousName = modules.at(-1).name;
  const eventTargetsSuspicious =
    activeEvent &&
    (
      activeEvent.severity === 'critical' ||
      activeEvent.action?.toLowerCase().includes('thread') ||
      activeEvent.target?.toLowerCase().includes('explorer.exe')
    );

  const [selectedName, setSelectedName] = useState(
    eventTargetsSuspicious ? suspiciousName : modules[0].name,
  );

  const selected =
    modules.find((module) => module.name === selectedName) || modules[0];

  const chooseModule = (module) => {
    setSelectedName(module.name);
    onCrossHighlight?.({
      type: 'dll',
      value: module.name,
      suspicious: module.trust === 'SUSPICIOUS',
    });
  };

  return (
    <div className="dll2">
      <section className="dll2-list">
        <div className="dll2-summary">
          <Binary size={25} />
          <div>
            <strong>{modules.length} LOADED MODULES</strong>
            <span>
              {injected
                ? 'Remote-thread telemetry correlates with an unsigned module.'
                : 'Waiting for suspicious module telemetry.'}
            </span>
          </div>
          <div className="dll2-summary-score">
            <small>MAX RISK</small>
            <b>{Math.max(...modules.map((module) => module.risk))}</b>
          </div>
        </div>

        <div className="dll2-head">
          <span>MODULE</span>
          <span>RISK</span>
          <span>PUBLISHER</span>
          <span>TRUST</span>
          <span />
        </div>

        {modules.map((module, index) => {
          const highlighted =
            module.name === selected.name ||
            (module.name === suspiciousName && eventTargetsSuspicious);

          return (
            <button
              type="button"
              className={[
                'dll2-row',
                module.trust === 'SUSPICIOUS' ? 'danger' : '',
                highlighted ? 'highlighted' : '',
                index === modules.length - 1 && injected ? 'dll2-arrival' : '',
              ].join(' ')}
              key={module.name}
              onClick={() => chooseModule(module)}
            >
              <span className="dll2-name">
                {module.trust === 'SUSPICIOUS' ? (
                  <ShieldX size={16} />
                ) : (
                  <ShieldCheck size={16} />
                )}
                <code>{module.name}</code>
                <small>{module.location}</small>
              </span>

              <span className="dll2-risk">
                <b>{module.risk}</b>
                <i>
                  <em style={{ width: `${module.risk}%` }} />
                </i>
              </span>

              <span>{module.publisher}</span>

              <span className={`dll2-trust dll2-${module.trust.toLowerCase()}`}>
                {module.trust}
              </span>

              <ChevronRight size={16} />
            </button>
          );
        })}
      </section>

      <aside className="dll2-drawer">
        <div className="dll2-drawer-title">
          <div>
            <small>MODULE INSPECTOR</small>
            <h4>{selected.name}</h4>
          </div>
          <span className={`dll2-trust dll2-${selected.trust.toLowerCase()}`}>
            {selected.trust}
          </span>
        </div>

        <div className="dll2-score-card">
          <div>
            <span>RISK SCORE</span>
            <strong>{selected.risk}</strong>
          </div>
          <div className="dll2-large-bar">
            <i style={{ width: `${selected.risk}%` }} />
          </div>
          <p>
            {selected.trust === 'SUSPICIOUS'
              ? 'Unsigned high-entropy module correlated with remote-thread activity.'
              : 'Publisher and path are consistent with a trusted Windows component.'}
          </p>
        </div>

        <dl className="dll2-details">
          <div>
            <dt><Fingerprint size={14} /> SHA256</dt>
            <dd><code>{selected.sha256}</code></dd>
          </div>
          <div>
            <dt><Clock3 size={14} /> OBSERVED</dt>
            <dd>{selected.observedAt || activeEvent?.timestamp || 'Baseline image'}</dd>
          </div>
          <div>
            <dt><FileCode2 size={14} /> PE SECTIONS</dt>
            <dd className="dll2-tags">
              {selected.sections.map((section) => <span key={section}>{section}</span>)}
            </dd>
          </div>
          <div>
            <dt><Binary size={14} /> ENTROPY</dt>
            <dd>{selected.entropy.toFixed(2)} / 8.00</dd>
          </div>
          <div>
            <dt><Link2 size={14} /> IMPORTS</dt>
            <dd className="dll2-imports">
              {selected.imports.map((item) => <code key={item}>{item}</code>)}
            </dd>
          </div>
        </dl>

        {selected.trust === 'SUSPICIOUS' && (
          <button
            type="button"
            className="dll2-jump"
            onClick={() =>
              onCrossHighlight?.({
                type: 'event',
                value: activeEvent?.id,
                tab: 'timeline',
              })
            }
          >
            JUMP TO CORRELATED EVENT
          </button>
        )}
      </aside>
    </div>
  );
}
