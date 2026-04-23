import React, { useState } from 'react'
import SetupScreen from './screens/SetupScreen'
import InstructionScreen from './screens/InstructionScreen'
import PracticeScreen from './screens/PracticeScreen'
import CTBScreen from './screens/CTBScreen'
import StakeBreakScreen from './screens/StakeBreakScreen'
import MPLTransitionScreen from './screens/MPLTransitionScreen'
import MPLScreen from './screens/MPLScreen'
import FinishScreen from './screens/FinishScreen'

// Screens: setup → instruction → practice → ctb → (stake_break → ctb)* → mpl_transition → mpl → finish
const SCREEN = {
  SETUP: 'setup',
  INSTRUCTION: 'instruction',
  PRACTICE: 'practice',
  CTB: 'ctb',
  STAKE_BREAK: 'stake_break',
  MPL_TRANSITION: 'mpl_transition',
  MPL: 'mpl',
  FINISH: 'finish',
}

export default function App() {
  const [screen, setScreen] = useState(SCREEN.SETUP)
  const [sessionData, setSessionData] = useState(null)
  const [trials, setTrials] = useState([])
  const [mplTrials, setMplTrials] = useState([])
  const [trialIndex, setTrialIndex] = useState(0)
  const [nextStake, setNextStake] = useState(null)
  const [completedTrials, setCompletedTrials] = useState([])
  const [ctbBdmResult, setCtbBdmResult] = useState(null)
  const [mplBdmResult, setMplBdmResult] = useState(null)
  const [completedMplChoices, setCompletedMplChoices] = useState([])

  function handleSetupComplete(data) {
    setSessionData(data)
    setTrials(data.trials)
    setMplTrials(data.mpl_trials || [])
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
      // All CTB trials done — compute CTB BDM
      const all = trialResult ? [...completedTrials, trialResult] : completedTrials
      if (all.length > 0) {
        const sel = all[Math.floor(Math.random() * all.length)]
        setCtbBdmResult({ selected: sel, reward: sel.allocation_today, total: sel.allocation_today + 1000 })
      }
      setScreen(SCREEN.MPL_TRANSITION)
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

  function handleMPLTransitionNext() {
    setScreen(SCREEN.MPL)
  }

  function handleMPLComplete(allChoices) {
    setCompletedMplChoices(allChoices)
    // MPL BDM: pick random choice, resolve reward
    if (allChoices && allChoices.length > 0) {
      const sel = allChoices[Math.floor(Math.random() * allChoices.length)]
      const hit = sel.choice === 'A' ? Math.random() < sel.probability : false
      const reward = sel.choice === 'B' ? sel.option_b_amount : hit ? 1000 : 0
      setMplBdmResult({
        selected: sel,
        reward,
        total: reward + 1000,
        outcomeLabel: sel.choice === 'B'
          ? `選択肢B（確実に ${sel.option_b_amount}円）`
          : hit ? '選択肢A（くじ当たり → 1,000円）' : '選択肢A（くじ外れ → 0円）',
      })
    }
    setScreen(SCREEN.FINISH)
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
      {screen === SCREEN.MPL_TRANSITION && (
        <MPLTransitionScreen onNext={handleMPLTransitionNext} />
      )}
      {screen === SCREEN.MPL && sessionData && mplTrials.length > 0 && (
        <MPLScreen
          sessionData={sessionData}
          mplTrials={mplTrials}
          onComplete={handleMPLComplete}
        />
      )}
      {screen === SCREEN.FINISH && (
        <FinishScreen
          ctbBdmResult={ctbBdmResult}
          mplBdmResult={mplBdmResult}
          completedTrials={completedTrials}
          completedMplChoices={completedMplChoices}
          participantId={sessionData?.participant_id}
          delayLabel={sessionData?.delay_label}
        />
      )}
    </div>
  )
}
