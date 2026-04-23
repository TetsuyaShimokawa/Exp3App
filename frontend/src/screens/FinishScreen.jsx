import React from 'react'
import styles from './FinishScreen.module.css'

export default function FinishScreen() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.checkmark}>✓</div>
        <h2 className={styles.title}>実験完了</h2>
        <p className={styles.message}>
          ありがとうございました。
        </p>
        <p className={styles.sub}>
          すべての試行が終了しました。<br/>
          実験者にお知らせください。
        </p>
      </div>
    </div>
  )
}
