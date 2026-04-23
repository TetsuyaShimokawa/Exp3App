import React from 'react'
import styles from './StakeBreakScreen.module.css'
import { formatYen } from '../utils'

export default function StakeBreakScreen({ nextStake, onNext }) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>⏸</div>
        <h2 className={styles.title}>賭け金が変わります</h2>
        <p className={styles.text}>
          次の賭け金に進みます。
        </p>
        <div className={styles.stakeBox}>
          <span className={styles.stakeLabel}>次の賭け金</span>
          <span className={styles.stakeValue}>{nextStake ? formatYen(nextStake) : '—'}</span>
        </div>
        <p className={styles.note}>
          操作方法は同じです。スライダーで今日の受取額を調整し、「確定」を押してください。
        </p>
        <button className={styles.btn} onClick={onNext}>
          次へ進む →
        </button>
      </div>
    </div>
  )
}
