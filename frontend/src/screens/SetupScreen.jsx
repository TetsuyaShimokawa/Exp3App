import React, { useState } from 'react'
import { startSession } from '../utils'
import styles from './SetupScreen.module.css'

export default function SetupScreen({ onComplete }) {
  const [participantId, setParticipantId] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!participantId.trim()) {
      setError('参加者IDを入力してください。')
      return
    }
    if (!name.trim()) {
      setError('お名前を入力してください。')
      return
    }

    setLoading(true)
    try {
      const data = await startSession({
        participant_id: participantId.trim(),
        name: name.trim(),
      })
      onComplete({
        ...data,
        participant_id: participantId.trim(),
        name: name.trim(),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>異時点間選択実験</h1>
        <p className={styles.subtitle}>実験 3：大きさ効果と遅延の交互作用</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="pid">参加者ID</label>
            <input
              id="pid"
              className={styles.input}
              type="text"
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              placeholder="例: P001"
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">お名前</label>
            <input
              id="name"
              className={styles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 山田 太郎"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.btn}
            disabled={loading}
          >
            {loading ? '接続中...' : '開始する'}
          </button>
        </form>
      </div>
    </div>
  )
}
