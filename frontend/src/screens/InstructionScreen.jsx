import React from 'react'
import styles from './InstructionScreen.module.css'
import { formatYen } from '../utils'

export default function InstructionScreen({ delayLabel, onNext }) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>実験の説明</h2>

        <section className={styles.section}>
          <h3 className={styles.heading}>概要</h3>
          <p>
            この実験では、<strong>今日</strong>受け取るお金と、
            <strong>{delayLabel}</strong>に受け取るお金のどちらをどれだけ
            受け取りたいかを教えていただきます。
          </p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.heading}>課題の説明</h3>
          <p>
            各試行では、ある<strong>賭け金</strong>（例：{formatYen(10000)}）が
            与えられます。
          </p>
          <p style={{ marginTop: 8 }}>
            あなたは、その賭け金を<strong>今日受け取る分</strong>と
            <strong>{delayLabel}に受け取る分</strong>に配分します。
          </p>
          <p style={{ marginTop: 8 }}>
            ただし、今日1円を諦めるごとに、将来の受取額は
            <strong>交換レート分だけ増加</strong>します。
          </p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.heading}>具体例</h3>
          <div className={styles.example}>
            <p><strong>賭け金：</strong>{formatYen(10000)}</p>
            <p><strong>遅延：</strong>{delayLabel}</p>
            <p><strong>交換レート：</strong>1.5（今日1円諦めると将来1.5円増える）</p>
            <div className={styles.exampleTable}>
              <div className={styles.exampleRow}>
                <span className={styles.todayBadge}>今日</span>
                <span>{formatYen(10000)}</span>
                <span>→</span>
                <span className={styles.futureBadge}>{delayLabel}</span>
                <span>{formatYen(0)}</span>
              </div>
              <div className={styles.exampleRow}>
                <span className={styles.todayBadge}>今日</span>
                <span>{formatYen(5000)}</span>
                <span>→</span>
                <span className={styles.futureBadge}>{delayLabel}</span>
                <span>{formatYen(7500)}</span>
              </div>
              <div className={styles.exampleRow}>
                <span className={styles.todayBadge}>今日</span>
                <span>{formatYen(0)}</span>
                <span>→</span>
                <span className={styles.futureBadge}>{delayLabel}</span>
                <span>{formatYen(15000)}</span>
              </div>
            </div>
            <p className={styles.note}>
              ※ 今日の受取額 + 将来の受取額 ÷ 交換レート = 賭け金（予算制約）
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.heading}>操作方法</h3>
          <p>
            画面のスライダーを動かして<strong>今日の受取額</strong>を調整してください。
            将来の受取額は自動的に計算されます。
          </p>
          <p style={{ marginTop: 8 }}>
            配分が決まったら<strong>「確定」ボタン</strong>を押してください。
          </p>
          <p style={{ marginTop: 8 }}>
            全部で <strong>18 試行</strong>あります。
          </p>
        </section>

        <button className={styles.btn} onClick={onNext}>
          練習問題に進む →
        </button>
      </div>
    </div>
  )
}
