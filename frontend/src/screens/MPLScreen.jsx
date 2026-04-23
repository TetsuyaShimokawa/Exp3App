import React, { useState, useEffect, useRef } from 'react'
import { saveCEResult, formatYen } from '../utils'

export default function CEScreen({ sessionData, ceTrials, onComplete }) {
  const blocks = groupIntoBlocks(ceTrials)
  const totalBlocks = blocks.length

  const [blockIndex, setBlockIndex] = useState(0)
  const [trialIndex, setTrialIndex] = useState(0)
  const [ceAmount, setCeAmount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [allCollected, setAllCollected] = useState([])
  const startTimeRef = useRef(Date.now())

  const currentBlock = blocks[blockIndex]
  if (!currentBlock) return null
  const trial = currentBlock[trialIndex]
  if (!trial) return null

  useEffect(() => {
    setCeAmount(Math.round(trial.stake / 2))
    startTimeRef.current = Date.now()
  }, [blockIndex, trialIndex])

  const totalTrials = ceTrials.length
  const completedSoFar = blocks.slice(0, blockIndex).reduce((s, b) => s + b.length, 0) + trialIndex
  const progressPct = (completedSoFar / totalTrials) * 100

  async function handleConfirm() {
    if (submitting) return
    setSubmitting(true)

    const result = {
      session_id: sessionData.session_id,
      participant_id: sessionData.participant_id,
      trial_id: trial.trial_id,
      block: trial.block,
      stake: trial.stake,
      probability: trial.probability,
      ce_amount: ceAmount,
      response_time_ms: Date.now() - startTimeRef.current,
    }

    try {
      await saveCEResult(result)
    } catch (e) {
      console.error('CE save failed:', e)
    }

    const updated = [...allCollected, result]
    setAllCollected(updated)

    const nextTrial = trialIndex + 1
    if (nextTrial < currentBlock.length) {
      setTrialIndex(nextTrial)
    } else {
      const nextBlock = blockIndex + 1
      if (nextBlock < totalBlocks) {
        setBlockIndex(nextBlock)
        setTrialIndex(0)
      } else {
        onComplete(updated)
      }
    }
    setSubmitting(false)
  }

  const step = Math.max(100, Math.round(trial.stake / 100) * 100)

  return (
    <div style={s.container}>
      <div style={s.progressOuter}>
        <div style={{ ...s.progressInner, width: `${progressPct}%` }} />
      </div>

      <div style={s.card}>
        <div style={s.header}>
          <div style={s.headerItem}>
            <span style={s.headerLabel}>ブロック</span>
            <span style={s.headerValue}>{blockIndex + 1} / {totalBlocks}</span>
          </div>
          <div style={s.headerDivider} />
          <div style={s.headerItem}>
            <span style={s.headerLabel}>問</span>
            <span style={s.headerValue}>{trialIndex + 1} / {currentBlock.length}</span>
          </div>
          <div style={s.headerDivider} />
          <div style={s.headerItem}>
            <span style={s.headerLabel}>賭け金</span>
            <span style={s.headerValue}>{formatYen(trial.stake)}</span>
          </div>
        </div>

        <div style={s.questionBox}>
          <p style={s.questionText}>
            <strong>{formatYen(trial.stake)}</strong> を確率{' '}
            <strong>{trial.probability_percent}%</strong> で獲得できるくじがあります。
          </p>
          <p style={s.questionSub}>
            このくじと同じ価値だと感じる「今すぐ確実にもらえる金額」はいくらですか？
          </p>
        </div>

        <div style={s.ceDisplay}>
          <span style={s.ceLabel}>確実性等価額</span>
          <span style={s.ceValue}>{formatYen(ceAmount)}</span>
        </div>

        <div style={s.sliderSection}>
          <div style={s.sliderLabels}>
            <span style={{ color: '#666' }}>¥0（くじに価値なし）</span>
            <span style={{ color: '#1565c0' }}>{formatYen(trial.stake)}（くじと同等）</span>
          </div>
          <input
            style={s.slider}
            type="range"
            min={0}
            max={trial.stake}
            step={step}
            value={ceAmount}
            onChange={(e) => setCeAmount(Number(e.target.value))}
          />
        </div>

        <div style={s.fineButtons}>
          <button style={s.fineBtn} onClick={() => setCeAmount(Math.max(0, ceAmount - step))}>
            ◀ −{formatYen(step)}
          </button>
          <button style={s.fineBtn} onClick={() => setCeAmount(Math.min(trial.stake, ceAmount + step))}>
            +{formatYen(step)} ▶
          </button>
        </div>

        <button
          style={{ ...s.confirmBtn, opacity: submitting ? 0.6 : 1 }}
          onClick={handleConfirm}
          disabled={submitting}
        >
          確定
        </button>
      </div>
    </div>
  )
}

function groupIntoBlocks(trials) {
  const blockMap = new Map()
  for (const t of trials) {
    if (!blockMap.has(t.block)) blockMap.set(t.block, [])
    blockMap.get(t.block).push(t)
  }
  return Array.from(blockMap.values())
}

const s = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: '#f0f4f8' },
  progressOuter: { width: '100%', height: 6, background: '#e0e0e0' },
  progressInner: { height: '100%', background: '#388e3c', transition: 'width 0.4s' },
  card: { background: '#fff', borderRadius: 16, padding: '28px 32px', maxWidth: 640, width: '100%', margin: '24px 16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 20 },
  header: { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #e0e0e0' },
  headerItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  headerLabel: { fontSize: 11, fontWeight: 600, color: '#90a4ae', textTransform: 'uppercase' },
  headerValue: { fontSize: '1rem', fontWeight: 700, color: '#263238' },
  headerDivider: { width: 1, height: 32, background: '#e0e0e0' },
  questionBox: { background: '#e8eaf6', borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 },
  questionText: { margin: 0, fontSize: '1rem', lineHeight: 1.6, color: '#1a237e' },
  questionSub: { margin: 0, fontSize: '0.9rem', color: '#455a64' },
  ceDisplay: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: '#e3f2fd', border: '2px solid #90caf9', borderRadius: 12, padding: '16px' },
  ceLabel: { fontSize: 12, fontWeight: 700, color: '#1565c0', textTransform: 'uppercase' },
  ceValue: { fontSize: '2rem', fontWeight: 800, color: '#1565c0' },
  sliderSection: { display: 'flex', flexDirection: 'column', gap: 8 },
  sliderLabels: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#90a4ae' },
  slider: { width: '100%', accentColor: '#1565c0', cursor: 'pointer' },
  fineButtons: { display: 'flex', gap: 12 },
  fineBtn: { flex: 1, padding: '8px', fontSize: 13, fontWeight: 600, background: '#f5f5f5', border: '1px solid #cfd8dc', borderRadius: 8, cursor: 'pointer' },
  confirmBtn: { padding: '14px', fontSize: 16, fontWeight: 700, background: '#388e3c', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' },
}
