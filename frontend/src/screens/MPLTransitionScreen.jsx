import React from 'react'

export default function MPLTransitionScreen({ onNext }) {
  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.icon}>🎲</div>
        <h2 style={s.title}>第1課題（時間割引）終了</h2>
        <p style={s.text}>
          お疲れ様でした。次は<strong>リスク下の選択課題</strong>です。
        </p>
        <div style={s.infoBox}>
          <p style={s.infoLine}>
            ・くじと確実な金額のどちらを選ぶかを答えてください。
          </p>
          <p style={s.infoLine}>
            ・全部で <strong>10 問</strong>（各問 20 行）あります。
          </p>
          <p style={s.infoLine}>
            ・AまたはBをクリックすると上下の行が自動補完されます。
          </p>
        </div>
        <button style={s.btn} onClick={onNext}>
          リスク課題を開始する →
        </button>
      </div>
    </div>
  )
}

const s = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 24, background: 'linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 100%)' },
  card: { background: '#fff', borderRadius: 20, padding: '48px 40px', maxWidth: 520, width: '100%', boxShadow: '0 6px 32px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center' },
  icon: { fontSize: 48 },
  title: { margin: 0, fontSize: '1.7rem', fontWeight: 800, color: '#1b5e20' },
  text: { margin: 0, fontSize: '1rem', color: '#37474f', lineHeight: 1.7 },
  infoBox: { background: '#f1f8e9', border: '1px solid #c5e1a5', borderRadius: 10, padding: '14px 18px', width: '100%', textAlign: 'left' },
  infoLine: { margin: '4px 0', fontSize: '0.92rem', color: '#33691e' },
  btn: { padding: '12px 36px', fontSize: 15, fontWeight: 700, backgroundColor: '#388e3c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
}
