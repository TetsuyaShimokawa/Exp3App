import React, { useState } from 'react'
import SetupScreen from './screens/SetupScreen'
import InstructionScreen from './screens/InstructionScreen'
import PracticeScreen from './screens/PracticeScreen'
import CTBScreen from './screens/CTBScreen'
import StakeBreakScreen from './screens/StakeBreakScreen'
import MPLTransitionScreen from './screens/MPLTransitionScreen'
import CEScreen from './screens/MPLScreen'
import FinishScreen from './screens/FinishScreen'

// setup → instruction → practice → ctb → (stake_break → ctb)* → ce_transition → ce → finish
const SCREEN = {
  SETUP: 'setup',
  INSTRUCTION: 'instruction',
  PRACTICE: 'practice',
  CTB: 'ctb',
  STAKE_BREAK: 'stake_break',
  CE_TRANSITION: 'ce_transition',
  CE: 'ce',
  FINISH: 'finish',
}

export default function App() {
  const [screen, setScreen] = useState(SCREEN.SETUP)
  const [sessionData, setSessionData] = useState(null)
  const [trials, setTrials] = useState([])
  const [ceTrials, setCeTrials] = useState([])
  const [trialIndex, setTrialIndex] = useState(0)
  const [nextStake, setNextStake] = useState(null)
  const [completedTrials, setCompletedTrials] = useState([])
  const [ctbBdmResult, setCtbBdmResult] = useState(null)
  const [ceBdmResult, setCeBdmResult] = useState(null)
  const [completedCeResults, setCompletedCeResults] = useState([])

  function handleSetupComplete(data) {
    setSessionData(data)
    setTrials(data.trials)
    setCeTrials(data.ce_trials || [])
    setTrialIndex(0)
    setScreen(SCREEN.INSTRUCTION)
  }

  function handleInstructionDone() {
    setScreen(SCREEN.PRACTICE)
  }

  function handlePracticeDone() {
    setScreen(SCREEN.CTB)
  }

  function handleTrialDone(newIndex, trialResult) {
    if (trialResult) {
      setCompletedTrials((prev) => [...prev, trialResult])
    }
    if (newIndex >= trials.length) {
      const all = trialResult ? [...completedTrials, trialResult] : completedTrials
      if (all.length > 0) {
        const sel = all[Math.floor(Math.random() * all.length)]
        setCtbBdmResult({ selected: sel, reward: sel.allocation_today, total: sel.allocation_today + 1000 })
      }
      setScreen(SCREEN.CE_TRANSITION)
      return
    }

    const prevStake = trials[newIndex - 1]?.stake
    const nextTrialStake = trials[newIndex]?.stake
    if (prevStake !== nextTrialStake) {
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

  function handleCETransitionNext() {
    setScreen(SCREEN.CE)
  }

  function handleCEComplete(allResults) {
    setCompletedCeResults(allResults)
    if (allResults && allResults.length > 0) {
      const sel = allResults[Math.floor(Math.random() * allResults.length)]
      // BDM: draw random price R from [0, stake]
      const r = Math.floor(Math.random() * (sel.stake + 1))
      let reward
      let outcomeLabel
      if (sel.ce_amount >= r) {
        // play the lottery
        const win = Math.random() < sel.probability
        reward = win ? sel.stake : 0
        outcomeLabel = win
          ? `くじ実施（当たり）→ ${sel.stake.toLocaleString()}円`
          : 'くじ実施（外れ）→ 0円'
      } else {
        reward = r
        outcomeLabel = `確実に ${r.toLocaleString()}円`
      }
      setCeBdmResult({ selected: sel, r, reward, total: reward + 1000, outcomeLabel })
    }
    setScreen(SCREEN.FINISH)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {screen === SCREEN.SETUP && (
        <SetupScreen onComplete={handleSetupComplete} />
      )}
      {screen === SCREEN.INSTRUCTION && sessionData && (
        <InstructionScreen delayLabel={sessionData.delay_label} onNext={handleInstructionDone} />
      )}
      {screen === SCREEN.PRACTICE && sessionData && (
        <PracticeScreen delayLabel={sessionData.delay_label} onDone={handlePracticeDone} />
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
        <StakeBreakScreen nextStake={nextStake} onNext={handleStakeBreakDone} />
      )}
      {screen === SCREEN.CE_TRANSITION && (
        <MPLTransitionScreen onNext={handleCETransitionNext} />
      )}
      {screen === SCREEN.CE && sessionData && ceTrials.length > 0 && (
        <CEScreen
          sessionData={sessionData}
          ceTrials={ceTrials}
          onComplete={handleCEComplete}
        />
      )}
      {screen === SCREEN.FINISH && (
        <FinishScreen
          ctbBdmResult={ctbBdmResult}
          ceBdmResult={ceBdmResult}
          completedTrials={completedTrials}
          completedCeResults={completedCeResults}
          participantId={sessionData?.participant_id}
          delayLabel={sessionData?.delay_label}
        />
      )}
    </div>
  )
}
