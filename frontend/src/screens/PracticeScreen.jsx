import React, { useState } from 'react'
import styles from './PracticeScreen.module.css'
import { formatYen } from '../utils'

const PRACTICE_STAKE = 10000
const PRACTICE_RATE = 1.5
const STEPS = 20

export default function PracticeScreen({ delayLabel, onDone }) {
  const step = PRACTICE_STAKE / STEPS
  const [allocationToday, setAllocationToday] = useState(Math.round(PRACTICE_STAKE / 2))
  const [confirmed, setConfirmed] = useState(false)

  const allocationFuture = Math.round((PRACTICE_STAKE - allocationToday) * PRACTICE_RATE)

  function handleSlider(e) {
    const raw = Number(e.target.value)
    setAllocationToday(Math.round(raw / step) * step)
  }

  function handleConfirm() {
    setConfirmed(true)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.badge}>練習問題（記録されません）</div>
        <h2 className={styles.title}>練習：配分を決めてみましょう</h2>

        <div className={styles.info}>
          <span>賭け金：<strong>{formatYen(PRACTICE_STAKE)}</strong></span>
          <span>遅延：<strong>{delayLabel}</strong></span>
          <span>交換レート：<strong>{PRACTICE_RATE}</strong></span>
        </div>

        <p className={styles.rateNote}>
          今日1円諦めると{delayLabel}に <strong>{PRACTICE_RATE}円</strong> 増えます
        </p>

        <div className={styles.amounts}>
          <div className={styles.amountBox} style={{ borderColor: '#2196F3' }}>
            <span className={styles.amountLabel} style={{ color: '#1976d2' }}>今日の受取額</span>
            <span className={styles.amountValue} style={{ color: '#1976d2' }}>
              {formatYen(allocationToday)}
            </span>
          </div>
          <div className={styles.plus}>+</div>
          <div className={styles.amountBox} style={{ borderColor: '#4CAF50' }}>
            <span className={styles.amountLabel} style={{ color: '#388e3c' }}>
              {delayLabel}の受取額
            </span>
            <span className={styles.amountValue} style={{ color: '#388e3c' }}>
              {formatYen(allocationFuture)}
            </span>
          </div>
        </div>

        <div className={styles.sliderWrapper}>
          <span className={styles.sliderEnd}>今日<br/>{formatYen(0)}</span>
          <input
            className={styles.slider}
            type="range"
            min={0}
            max={PRACTICE_STAKE}
            step={step}
            value={allocationToday}
            onChange={handleSlider}
          />
          <span className={styles.sliderEnd}>今日<br/>{formatYen(PRACTICE_STAKE)}</span>
        </div>

        {!confirmed ? (
          <button className={styles.btn} onClick={handleConfirm}>
            確定
          </button>
        ) : (
          <div className={styles.confirmedBox}>
            <p>
              今日 <strong>{formatYen(allocationToday)}</strong>、
              {delayLabel}に <strong>{formatYen(allocationFuture)}</strong> を選びました。
            </p>
            <p style={{ marginTop: 8, fontSize: '0.9rem', color: '#607d8b' }}>
              このように配分を決めていきます。本番では 18 試行あります。
            </p>
            <button className={styles.btnNext} onClick={onDone}>
              本番を開始する →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
