import React, { useState } from 'react'
import SetupScreen from './screens/SetupScreen'
import InstructionScreen from './screens/InstructionScreen'
import PracticeScreen from './screens/PracticeScreen'
import CTBScreen from './screens/CTBScreen'
import StakeBreakScreen from './screens/StakeBreakScreen'
import FinishScreen from './screens/FinishScreen'

// Screens: setup → instruction → practice → ctb → (stake_break → ctb)* → finish
const SCREEN = {
  SETUP: 'setup',
  INSTRUCTION: 'instruction',
  PRACTICE: 'practice',
  CTB: 'ctb',
  STAKE_BREAK: 'stake_break',
  FINISH: 'finish',
}

export default function App() {
  const [screen, setScreen] = useState(SCREEN.SETUP)
  const [sessionData, setSessionData] = useState(null)
  // trials is the shuffled list from backend; trialIndex is current position
  const [trials, setTrials] = useState([])
  const [trialIndex, setTrialIndex] = useState(0)
  const [nextStake, setNextStake] = useState(null)
  const [completedTrials, setCompletedTrials] = useState([])
  const [bdmResult, setBdmResult] = useState(null)

  function handleSetupComplete(data) {
    // data: { session_id, delay_condition, delay_label, trials, participant_id, name }
    setSessionData(data)
    setTrials(data.trials)
    setTrialIndex(0)
    setScreen(SCREEN.INSTRUCTION)
  }

  function handleInstructionDone() {
    setScreen(SCREEN.PRACTICE)
  }

  function handlePracticeDone() {
    setScreen(SCREEN.CTB)
  }

  // Called after each CTB trial is confirmed
  function handleTrialDone(newIndex, trialResult) {
    if (trialResult) {
      setCompletedTrials((prev) => [...prev, trialResult])
    }
    if (newIndex >= trials.length) {
      // Compute BDM: pick one random trial
      const all = trialResult
        ? [...completedTrials, trialResult]
        : completedTrials
      if (all.length > 0) {
        const sel = all[Math.floor(Math.random() * all.length)]
        // Reward = today allocation (participant receives today_amount immediately)
        const reward = sel.allocation_today
        setBdmResult({ selected: sel, reward, total: reward + 1000 })
      }
      setScreen(SCREEN.FINISH)
      return
    }

    // Check if we just crossed a stake boundary
    const prevStake = trials[newIndex - 1]?.stake
    const nextTrialStake = trials[newIndex]?.stake

    if (prevStake !== nextTrialStake) {
      // Crossing stake boundary — show break screen
      setNextStake(nextTrialStake)
      setTrialIndex(newIndex)
      setScreen(SCREEN.STAKE_BREAK)
    } else {
      setTrialIndex(newIndex)
    }
  }

  function handleStakeBreakDone() {
    setScreen(SCREEN.CTB)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {screen === SCREEN.SETUP && (
        <SetupScreen onComplete={handleSetupComplete} />
      )}
      {screen === SCREEN.INSTRUCTION && sessionData && (
        <InstructionScreen
          delayLabel={sessionData.delay_label}
          onNext={handleInstructionDone}
        />
      )}
      {screen === SCREEN.PRACTICE && sessionData && (
        <PracticeScreen
          delayLabel={sessionData.delay_label}
          onDone={handlePracticeDone}
        />
      )}
      {screen === SCREEN.CTB && sessionData && trials.length > 0 && (
        <CTBScreen
          sessionData={sessionData}
          trials={trials}
          trialIndex={trialIndex}
          onTrialDone={handleTrialDone}
        />
      )}
      {screen === SCREEN.STAKE_BREAK && (
        <StakeBreakScreen
          nextStake={nextStake}
          onNext={handleStakeBreakDone}
        />
      )}
      {screen === SCREEN.FINISH && (
        <FinishScreen
          bdmResult={bdmResult}
          completedTrials={completedTrials}
          participantId={sessionData?.participant_id}
          delayLabel={sessionData?.delay_label}
        />
      )}
    </div>
  )
}
