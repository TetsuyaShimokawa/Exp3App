import React, { useState, useEffect, useRef } from 'react'
import styles from './CTBScreen.module.css'
import { formatYen, saveResult } from '../utils'

const STEPS = 20

export default function CTBScreen({ sessionData, trials, trialIndex, onTrialDone }) {
  const trial = trials[trialIndex]
  const { stake, exchange_rate, delay_label, delay, trial_id } = trial

  const step = Math.round(stake / STEPS)

  // Start midpoint
  const [allocationToday, setAllocationToday] = useState(Math.round(stake / 2))
  const startTimeRef = useRef(Date.now())

  // Reset state when trial changes
  useEffect(() => {
    setAllocationToday(Math.round(stake / 2))
    startTimeRef.current = Date.now()
  }, [trialIndex, stake])

  const allocationFuture = Math.round((stake - allocationToday) * exchange_rate)

  function handleSlider(e) {
    const raw = Number(e.target.value)
    const snapped = Math.round(raw / step) * step
    // Clamp to [0, stake]
    setAllocationToday(Math.max(0, Math.min(stake, snapped)))
  }

  async function handleConfirm() {
    const responseTimeMs = Date.now() - startTimeRef.current

    const result = {
      session_id: sessionData.session_id,
      participant_id: sessionData.participant_id,
      delay_condition: delay,
      trial_id: trial_id,
      stake: stake,
      exchange_rate: exchange_rate,
      allocation_today: allocationToday,
      allocation_future: allocationFuture,
      response_time_ms: responseTimeMs,
    }

    // Fire-and-forget; don't block UI
    saveResult(result)
    onTrialDone(trialIndex + 1, {
      trial_id: trial_id,
      stake: stake,
      exchange_rate: exchange_rate,
      allocation_today: allocationToday,
      allocation_future: allocationFuture,
      delay_label: delay_label,
      delay_condition: delay,
      response_time_ms: responseTimeMs,
    })
  }

  const totalTrials = trials.length
  const progress = trialIndex + 1

  // For equal-value edge case (exchange_rate = 1.0), show note
  const isEqual = exchange_rate === 1.0

  return (
    <div className={styles.container}>
      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${((progress) / totalTrials) * 100}%` }}
        />
      </div>

      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerItem}>
            <span className={styles.headerLabel}>賭け金</span>
            <span className={styles.headerValue}>{formatYen(stake)}</span>
          </div>
          <div className={styles.headerDivider} />
          <div className={styles.headerItem}>
            <span className={styles.headerLabel}>遅延</span>
            <span className={styles.headerValue}>{delay_label}</span>
          </div>
          <div className={styles.headerDivider} />
          <div className={styles.headerItem}>
            <span className={styles.headerLabel}>進捗</span>
            <span className={styles.headerValue}>{progress} / {totalTrials}</span>
          </div>
        </div>

        {/* Exchange rate info */}
        <div className={styles.rateInfo}>
          {isEqual
            ? '今日と将来は等価です（交換レート = 1.0）'
            : `今日 1円 諦めると ${delay_label} に ${exchange_rate} 円 増えます`}
        </div>

        {/* Amount displays */}
        <div className={styles.amounts}>
          <div className={styles.amountBox} style={{ borderColor: '#2196F3', background: '#e3f2fd' }}>
            <span className={styles.amountLabel} style={{ color: '#1565c0' }}>今日の受取額</span>
            <span className={styles.amountValue} style={{ color: '#1565c0' }}>
              {formatYen(allocationToday)}
            </span>
          </div>

          <div className={styles.plus}>+</div>

          <div className={styles.amountBox} style={{ borderColor: '#4CAF50', background: '#e8f5e9' }}>
            <span className={styles.amountLabel} style={{ color: '#2e7d32' }}>
              {delay_label}の受取額
            </span>
            <span className={styles.amountValue} style={{ color: '#2e7d32' }}>
              {formatYen(allocationFuture)}
            </span>
          </div>
        </div>

        {/* Budget constraint reminder */}
        <div className={styles.budgetNote}>
          予算：今日の受取額 + {delay_label}の受取額 ÷ {exchange_rate} = {formatYen(stake)}
        </div>

        {/* Slider */}
        <div className={styles.sliderSection}>
          <div className={styles.sliderLabels}>
            <span style={{ color: '#1976d2' }}>← 今日を多く</span>
            <span style={{ color: '#388e3c' }}>将来を多く →</span>
          </div>
          <input
            className={styles.slider}
            type="range"
            min={0}
            max={stake}
            step={step}
            value={allocationToday}
            onChange={handleSlider}
          />
          <div className={styles.sliderEndLabels}>
            <span>今日: {formatYen(0)}<br/>{delay_label}: {formatYen(Math.round(stake * exchange_rate))}</span>
            <span style={{ textAlign: 'right' }}>今日: {formatYen(stake)}<br/>{delay_label}: {formatYen(0)}</span>
          </div>
        </div>

        {/* Fine-tune buttons */}
        <div className={styles.fineButtons}>
          <button
            className={styles.fineBtn}
            onClick={() => setAllocationToday(Math.max(0, allocationToday - step))}
          >
            ◀ 今日 −{formatYen(step)}
          </button>
          <button
            className={styles.fineBtn}
            onClick={() => setAllocationToday(Math.min(stake, allocationToday + step))}
          >
            今日 +{formatYen(step)} ▶
          </button>
        </div>

        {/* Confirm button */}
        <button className={styles.confirmBtn} onClick={handleConfirm}>
          確定
        </button>
      </div>
    </div>
  )
}
