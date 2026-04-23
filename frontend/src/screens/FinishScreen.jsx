import React from 'react'
import styles from './FinishScreen.module.css'

export default function FinishScreen({ bdmResult, completedTrials, participantId, delayLabel }) {
  function downloadCSV() {
    if (!completedTrials || completedTrials.length === 0) return
    const headers = [
      'trial_id', 'stake', 'exchange_rate',
      'allocation_today', 'allocation_future',
      'delay_label', 'delay_condition', 'response_time_ms',
    ]
    const rows = completedTrials.map((t) =>
      headers.map((h) => t[h] ?? '').join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `exp3_${participantId || 'unknown'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card} style={{ maxWidth: 560 }}>
        <div className={styles.checkmark}>✓</div>
        <h2 className={styles.title}>実験完了</h2>
        <p className={styles.message}>ありがとうございました。</p>

        {bdmResult && (
          <div style={s.bdmBox}>
            <h3 style={{ margin: '0 0 10px', color: '#2e7d32' }}>🎲 報酬抽選結果</h3>
            <p style={s.line}>
              <strong>抽選された試行：</strong>
              賭け金 ¥{bdmResult.selected.stake.toLocaleString()}、
              交換レート {bdmResult.selected.exchange_rate}
            </p>
            <p style={s.line}>
              <strong>あなたの配分：</strong>
              今日 ¥{bdmResult.selected.allocation_today.toLocaleString()} ／
              {bdmResult.selected.delay_label} ¥{bdmResult.selected.allocation_future.toLocaleString()}
            </p>
            <p style={s.line}>
              <strong>パフォーマンス報酬：</strong>¥{bdmResult.reward.toLocaleString()}
            </p>
            <hr style={{ margin: '10px 0' }} />
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: '#1b5e20' }}>
              合計（基本謝礼 ¥1,000 + 報酬 ¥{bdmResult.reward.toLocaleString()}）
              ＝ <span style={{ fontSize: '1.25rem' }}>¥{bdmResult.total.toLocaleString()}</span>
            </p>
          </div>
        )}

        <p className={styles.sub}>参加者ID：<strong>{participantId}</strong></p>
        <p className={styles.sub}>
          すべての試行が終了しました。<br />実験者にお知らせください。
        </p>

        {completedTrials && completedTrials.length > 0 && (
          <button onClick={downloadCSV} style={s.csvBtn}>
            結果をCSVダウンロード
          </button>
        )}
      </div>
    </div>
  )
}

const s = {
  bdmBox: {
    background: '#e8f5e9',
    border: '1px solid #a5d6a7',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    textAlign: 'left',
  },
  line: { margin: '4px 0', fontSize: '0.9rem' },
  csvBtn: {
    padding: '10px 28px',
    fontSize: 14,
    fontWeight: 600,
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
}
