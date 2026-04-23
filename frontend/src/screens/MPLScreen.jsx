import React, { useState } from 'react'
import { saveMPLResult } from '../utils'

export default function MPLScreen({ sessionData, mplTrials, onComplete }) {
  const blocks = groupIntoBlocks(mplTrials)
  const totalBlocks = blocks.length

  const [blockIndex, setBlockIndex] = useState(0)
  const [choices, setChoices] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [allCollected, setAllCollected] = useState([])

  const currentBlock = blocks[blockIndex]
  if (!currentBlock) return null

  const probability = currentBlock[0].probability_percent
  const progressPct = ((blockIndex + 1) / totalBlocks) * 100
  const answered = currentBlock.filter((t) => choices[t.id]).length

  function handleChoice(clickedId, choice) {
    const idx = currentBlock.findIndex((t) => t.id === clickedId)
    setChoices((prev) => {
      const next = { ...prev, [clickedId]: choice }
      if (choice === 'B') {
        for (let i = idx + 1; i < currentBlock.length; i++)
          next[currentBlock[i].id] = 'B'
      } else {
        for (let i = 0; i < idx; i++)
          next[currentBlock[i].id] = 'A'
      }
      return next
    })
  }

  const allAnswered = currentBlock.every((t) => choices[t.id])

  async function handleNext() {
    if (!allAnswered || submitting) return
    setSubmitting(true)

    try {
      await Promise.all(
        currentBlock.map((trial) =>
          saveMPLResult({
            session_id: sessionData.session_id,
            participant_id: sessionData.participant_id,
            trial_id: trial.id,
            probability: trial.probability,
            option_b_amount: trial.option_b_amount,
            choice: choices[trial.id],
            row_index: trial.row_index,
            block_index: trial.block_index,
          })
        )
      )
    } catch (e) {
      console.error('MPL save failed:', e)
    }

    const newCollected = [
      ...allCollected,
      ...currentBlock.map((t) => ({
        id: t.id,
        probability: t.probability,
        option_b_amount: t.option_b_amount,
        choice: choices[t.id],
      })),
    ]
    setAllCollected(newCollected)

    if (blockIndex + 1 < totalBlocks) {
      setBlockIndex(blockIndex + 1)
      setSubmitting(false)
    } else {
      onComplete(newCollected)
    }
  }

  return (
    <div style={s.container}>
      <div style={s.card}>
        {/* Progress */}
        <div style={s.progressOuter}>
          <div style={{ ...s.progressInner, width: `${progressPct}%` }} />
        </div>
        <div style={s.headerRow}>
          <span style={s.headerLabel}>問 {blockIndex + 1} / {totalBlocks}</span>
          <span style={s.headerSub}>（全 {mplTrials.length} 選択）</span>
        </div>

        {/* Probability badge */}
        <div style={s.probBadge}>
          <span style={s.probLabel}>くじの当選確率：</span>
          <span style={s.probValue}>{probability}%</span>
        </div>

        <p style={s.hint}>
          ヒント：AかBをクリックすると上下の行が自動補完されます。変更したい行は押し直せます。
        </p>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.thOpt}>選択肢A（くじ）</th>
                <th style={s.thBtn}>A</th>
                <th style={s.thBtn}>B</th>
                <th style={s.thOpt}>選択肢B（確実）</th>
              </tr>
            </thead>
            <tbody>
              {currentBlock.map((trial) => {
                const c = choices[trial.id]
                return (
                  <tr
                    key={trial.id}
                    style={{ ...s.row, background: c === 'A' ? '#e8f5e9' : c === 'B' ? '#e3f2fd' : 'transparent' }}
                  >
                    <td style={s.tdOpt}>
                      <span style={{ color: '#2e7d32', fontSize: '0.88rem' }}>
                        {probability}% で <strong>1,000円</strong>
                      </span>
                    </td>
                    <td style={s.tdBtn}>
                      <button
                        onClick={() => handleChoice(trial.id, 'A')}
                        style={{ ...s.btn, background: c === 'A' ? '#2e7d32' : '#e8f5e9', color: c === 'A' ? '#fff' : '#2e7d32', border: '1px solid #2e7d32' }}
                      >A</button>
                    </td>
                    <td style={s.tdBtn}>
                      <button
                        onClick={() => handleChoice(trial.id, 'B')}
                        style={{ ...s.btn, background: c === 'B' ? '#1565c0' : '#e3f2fd', color: c === 'B' ? '#fff' : '#1565c0', border: '1px solid #1565c0' }}
                      >B</button>
                    </td>
                    <td style={s.tdOpt}>
                      <span style={{ color: '#1565c0', fontSize: '0.88rem' }}>
                        確実に <strong>{trial.option_b_amount.toLocaleString()}円</strong>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            onClick={handleNext}
            disabled={!allAnswered || submitting}
            style={{ ...s.nextBtn, opacity: (!allAnswered || submitting) ? 0.5 : 1 }}
          >
            {blockIndex + 1 < totalBlocks ? '次の問へ →' : '課題完了'}
          </button>
        </div>
      </div>
    </div>
  )
}

function groupIntoBlocks(trials) {
  const blockMap = new Map()
  for (const trial of trials) {
    if (!blockMap.has(trial.block_index)) blockMap.set(trial.block_index, [])
    blockMap.get(trial.block_index).push(trial)
  }
  const seen = [], result = []
  for (const trial of trials) {
    if (!seen.includes(trial.block_index)) {
      seen.push(trial.block_index)
      result.push(blockMap.get(trial.block_index))
    }
  }
  return result
}

const s = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', padding: '24px 16px', background: '#f5f5f5' },
  card: { background: '#fff', padding: '28px 32px', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', maxWidth: 700, width: '100%', display: 'flex', flexDirection: 'column', gap: 14 },
  progressOuter: { width: '100%', height: 6, background: '#e0e0e0', borderRadius: 3, overflow: 'hidden' },
  progressInner: { height: '100%', background: '#388e3c', borderRadius: 3, transition: 'width 0.3s' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLabel: { fontSize: 14, fontWeight: 700, color: '#333' },
  headerSub: { fontSize: 12, color: '#aaa' },
  probBadge: { display: 'inline-flex', alignItems: 'center', gap: 8, background: '#e8eaf6', borderRadius: 6, padding: '8px 14px', alignSelf: 'flex-start' },
  probLabel: { fontSize: 13, color: '#333' },
  probValue: { fontSize: 22, fontWeight: 700, color: '#1a1a2e' },
  hint: { fontSize: '0.78rem', color: '#888', margin: 0 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' },
  thOpt: { padding: '8px 12px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#666', borderBottom: '2px solid #e0e0e0', width: '42%' },
  thBtn: { padding: '8px 6px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#1976d2', borderBottom: '2px solid #e0e0e0', width: '8%' },
  row: { borderBottom: '1px solid #f0f0f0', transition: 'background 0.1s' },
  tdOpt: { padding: '8px 12px', textAlign: 'center', verticalAlign: 'middle' },
  tdBtn: { padding: '8px 6px', textAlign: 'center', verticalAlign: 'middle' },
  btn: { padding: '4px 14px', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' },
  nextBtn: { padding: '10px 32px', fontSize: 15, fontWeight: 600, backgroundColor: '#388e3c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
}
