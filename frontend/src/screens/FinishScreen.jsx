import React from 'react'
import styles from './FinishScreen.module.css'

export default function FinishScreen({
  ctbBdmResult,
  ceBdmResult,
  completedTrials,
  completedCeResults,
  participantId,
  delayLabel,
}) {
  function downloadCSV() {
    const rows = []

    const ctbHeaders = ['task', 'trial_id', 'stake', 'exchange_rate', 'allocation_today', 'allocation_future', 'delay_label', 'response_time_ms']
    rows.push(ctbHeaders.join(','))
    for (const t of (completedTrials || [])) {
      rows.push(['CTB', t.trial_id, t.stake, t.exchange_rate, t.allocation_today, t.allocation_future, t.delay_label || delayLabel || '', t.response_time_ms].join(','))
    }
    rows.push('')

    const ceHeaders = ['task', 'trial_id', 'block', 'stake', 'probability', 'ce_amount', 'response_time_ms']
    rows.push(ceHeaders.join(','))
    for (const t of (completedCeResults || [])) {
      rows.push(['CE', t.trial_id, t.block, t.stake, t.probability, t.ce_amount, t.response_time_ms].join(','))
    }

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `exp3_${participantId || 'unknown'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalReward = 1000 + (ctbBdmResult?.reward || 0) + (ceBdmResult?.reward || 0)

  return (
    <div className={styles.container}>
      <div className={styles.card} style={{ maxWidth: 600 }}>
        <div className={styles.checkmark}>✓</div>
        <h2 className={styles.title}>実験完了</h2>
        <p className={styles.message}>ありがとうございました。</p>

        {ctbBdmResult && (
          <div style={s.bdmBox}>
            <h3 style={{ margin: '0 0 10px', color: '#1565c0' }}>⏱ 時間割引課題　抽選結果</h3>
            <p style={s.line}>
              <strong>抽選された試行：</strong>
              賭け金 ¥{ctbBdmResult.selected.stake.toLocaleString()}、交換レート {ctbBdmResult.selected.exchange_rate}
            </p>
            <p style={s.line}>
              <strong>あなたの配分：</strong>
              今日 ¥{ctbBdmResult.selected.allocation_today.toLocaleString()} ／ {ctbBdmResult.selected.delay_label || delayLabel} ¥{ctbBdmResult.selected.allocation_future.toLocaleString()}
            </p>
            <p style={s.line}><strong>報酬：</strong>¥{ctbBdmResult.reward.toLocaleString()}</p>
          </div>
        )}

        {ceBdmResult && (
          <div style={{ ...s.bdmBox, background: '#e8f5e9', borderColor: '#a5d6a7' }}>
            <h3 style={{ margin: '0 0 10px', color: '#2e7d32' }}>🎲 リスク課題（確実性等価）　抽選結果</h3>
            <p style={s.line}>
              <strong>抽選された試行：</strong>
              ¥{ceBdmResult.selected.stake.toLocaleString()} × {ceBdmResult.selected.probability_percent}%
            </p>
            <p style={s.line}>
              <strong>あなたの確実性等価：</strong>¥{ceBdmResult.selected.ce_amount.toLocaleString()}
            </p>
            <p style={s.line}>
              <strong>BDM 抽選価格：</strong>¥{ceBdmResult.r.toLocaleString()}
              （CE {ceBdmResult.selected.ce_amount >= ceBdmResult.r ? '≥' : '<'} 価格 → {ceBdmResult.selected.ce_amount >= ceBdmResult.r ? 'くじ実施' : '確実額受取'}）
            </p>
            <p style={s.line}><strong>結果：</strong>{ceBdmResult.outcomeLabel}</p>
            <p style={s.line}><strong>報酬：</strong>¥{ceBdmResult.reward.toLocaleString()}</p>
          </div>
        )}

        {(ctbBdmResult || ceBdmResult) && (
          <div style={s.totalBox}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: '#1b5e20' }}>
              合計（基本謝礼 ¥1,000 + 報酬）＝ <span style={{ fontSize: '1.3rem' }}>¥{totalReward.toLocaleString()}</span>
            </p>
          </div>
        )}

        <p className={styles.sub}>参加者ID：<strong>{participantId}</strong></p>
        <p className={styles.sub}>すべての課題が終了しました。実験者にお知らせください。</p>

        {(completedTrials?.length > 0 || completedCeResults?.length > 0) && (
          <button onClick={downloadCSV} style={s.csvBtn}>結果をCSVダウンロード</button>
        )}
      </div>
    </div>
  )
}

const s = {
  bdmBox: { background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 8, padding: 16, width: '100%', textAlign: 'left' },
  line: { margin: '4px 0', fontSize: '0.9rem' },
  totalBox: { background: '#f1f8e9', border: '1px solid #c5e1a5', borderRadius: 8, padding: '12px 16px', width: '100%', textAlign: 'center' },
  csvBtn: { padding: '10px 28px', fontSize: 14, fontWeight: 600, backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
}
