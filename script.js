/** LICENSE
 DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 Version 2, December 2004

 Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>

 Everyone is permitted to copy and distribute verbatim or modified
 copies of this license document, and changing it is allowed as long
 as the name is changed.

 DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

 0. You just DO WHAT THE FUCK YOU WANT TO.
 */
/**
 * This is bitbot, an ES6 powered bot for bustabit.com and alikes (ethcrash.io, raigames.io etc)
 * For usage details please refer to the README.md, but do not expect too much. This is hackware.
 *
 * If you find this software useful you can buy me a beer:

 * XRB: xrb_19eddjrtk8z9t8zuc44eaa6z89cid15564k1k1iphbqybcwkjrfj9jpzm8s4
 * ETH: 0x45d763A0cf7d143D79AE7E1f5196bB2370e49F97
 * LTC: LM6P48B7xjrcCastrTWh8wmD6C4STDPYpV

 */
/* globals engine */

// mock for debug stuff with node
if (typeof engine === 'undefined') {
  engine = {
    getUsername() {
      return 'test'
    },
    getBalance() {
      return 10000000
    },
    on() {

    }
  }
}

/* UTILS */

const LOG_LEVELS = {
  'DEBUG': 3,
  'INFO': 2,
  'WARNING': 1,
  'ERROR': 0
}

const LOG_FUNCTIONS = {
  [LOG_LEVELS.DEBUG]: console.debug,
  [LOG_LEVELS.INFO]: console.info,
  [LOG_LEVELS.WARNING]: console.warn,
  [LOG_LEVELS.ERROR]: console.error
}

function martingaleGetBaseBetForMaxLossStreak(maxStreak, maxLoss, multiplier) {
  let currentStreak = 0
  let baseBet = Math.floor(maxLoss)
  while (currentStreak < maxStreak) {
    currentStreak = martingaleGetMaxStreakForBaseBet(baseBet, maxLoss, multiplier)
    baseBet = baseBet - 1
  }
  debug(`Base bet is ${baseBet} and will last a loss streak of ${maxStreak}`)
  return baseBet
}

function martingaleGetMaxStreakForBaseBet(baseBet, maxLoss, multiplier) {
  if (baseBet > maxLoss) {
    err('The base bet has to be less than you are ready to loose')
  }
  let aggregator = 0
  let currentBet = baseBet
  let streakNo = 0
  let lastProfit = 0
  while (aggregator + currentBet < maxLoss) {
    streakNo++
    aggregator = aggregator + currentBet
    lastProfit = ((currentBet * multiplier) - currentBet)
    currentBet = (currentBet + lastProfit) / lastProfit * currentBet
    debug(`Round ${streakNo}, lost ${aggregator}, next bet: ${currentBet}`)
  }
  debug(`Ran ${streakNo} rounds, lost ${aggregator}`)
  return streakNo
}

function getTimePlayed() {
  return (((new Date().getTime() - START_TIME) / 1000) / 60).toFixed(2)
}

function getProfits() {
  return ((engine.getBalance() / 100) - START_BALANCE).toFixed(2)
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function keyForValue(obj, value) {
  return Object.keys(obj).filter(function (key) {
    return obj[key] === value
  })[0]
}

function warn(msg, showPrefix) {
  log(msg, LOG_LEVELS.WARNING, showPrefix)
}

function err(msg, showPrefix) {
  log(msg, LOG_LEVELS.ERROR, showPrefix)
}

function debug(msg, showPrefix) {
  log(msg, LOG_LEVELS.DEBUG, showPrefix)
}

function info(msg, showPrefix) {
  log(msg, LOG_LEVELS.INFO, showPrefix)
}

function log(msg, level = LOG_LEVELS.INFO, showPrefix = true) {
  const prefix = showPrefix ? '[bitbot] ' : ''
  if (!LOG_FUNCTIONS[level]) {
    throw new Error(`Unknown log level ${level}`)
  } else {
    if (level <= LOG_LEVEL) {
      LOG_FUNCTIONS[level](`${prefix}${msg}`)
    }
  }
}


/* CONSTANTS */

const GAME_MODES = {
  'MARTINGALE': 1
}

const START_TIME = new Date().getTime()

const MODE_FUNCTIONS = {
  [GAME_MODES.MARTINGALE]: martingale
}

const USERNAME = engine.getUsername()
const START_BALANCE = engine.getBalance() / 100

const GAME_RESULTS = {
  'WON': 0,
  'LOST': 1,
  'NOT_PLAYED': 2
}


/* RUNTIME VARIABLES */
let lastResult = GAME_RESULTS.LOST
let lastBet = null
let lastProfit = null
let gamesInARow = 0
let lossesInARow = 0
let coolOffCounter = 0

/* PRESETS */
const MARTINGALE_SAFE = {
  mode: GAME_MODES.MARTINGALE,
  params: {
    maxLossStreak: 13,
    coolOffAfterLossStreak: 5,
    coolOffRounds: [8, 12]
  }
}

/* SETTINGS  - THIS IS WHERE YOU CAN ADJUST STUFF */
const LOG_LEVEL = LOG_LEVELS.INFO
const GAME_SETTINGS = {
  mode: GAME_MODES.MARTINGALE,
  params: {
    maxLossStreak: 10,
    coolOffAfterLossStreak: 5,
    coolOffRounds: [8, 12]
  }
}

// this might be ignored if playing with certain options (maxLossStreak in MARTINGALE for example)
const START_BET = 1
const MULTIPLIER = 2
const MAX_LOSS = 5000

/* GAME MODES */
// Implement your own strategies, a function should take in the game info and return an object shaped exactly like this:
// { nextBet: NEXT_BETTING_AMOUNT, multiplier: NEXT_MULTIPLIER_VALUE }
function martingale(data) {
  info(`playing martingale`)
  let nextBet = NaN
  if (GAME_SETTINGS.params.coolOffAfterLossStreak && lossesInARow >= GAME_SETTINGS.params.coolOffAfterLossStreak) {
    const coolOffRounds = GAME_SETTINGS.params.coolOffRounds
    if (Array.isArray(coolOffRounds) && coolOffRounds.length === 2) {
      coolOffCounter = randomNumber(coolOffRounds[0], coolOffRounds[1]) - 1
    } else if (typeof coolOffRounds === 'number') {
      coolOffCounter = coolOffRounds - 1
    } else {
      throw new Error(`Parameter coolOffRounds needs to be an integer or array of two integers`)
    }
    return null
  }
  if (lastBet === null || lastResult === GAME_RESULTS.NOT_PLAYED || lastResult === GAME_RESULTS.WON) {
    if (GAME_SETTINGS.params.maxLossStreak) {
      nextBet = martingaleGetBaseBetForMaxLossStreak(GAME_SETTINGS.params.maxLossStreak, MAX_LOSS || START_BALANCE, MULTIPLIER)
      info(`Base bet is ${nextBet} and will last a loss streak of ${GAME_SETTINGS.params.maxLossStreak}`)
    } else {
      nextBet = START_BET
    }
  } else {
    // martingale formula
    nextBet = (lastBet + lastProfit) / lastProfit * lastBet
  }
  return {
    multiplier: MULTIPLIER,
    nextBet: nextBet
  }
}


// Start of a game.
function play(data, mode) {
  gamesInARow++
  info(`Round: ${gamesInARow}`)
  const modeFunction = MODE_FUNCTIONS[mode]
  if (!modeFunction) {
    throw new Error(`Unknown game mode ${mode}`)
  }
  const balance = engine.getBalance() / 100
  if (coolOffCounter > 0) {
    coolOffCounter--
    info(`I'm in cool off mode, remaining ${coolOffCounter} rounds`)
    return
  }
  const roundParameters = modeFunction(data)


  if (!roundParameters) {
    info('Gonna skip this round')
  }

  const {nextBet, multiplier} = roundParameters
  if (getProfits() + nextBet > (MAX_LOSS || balance)) {
    err('You can\'t proceed because the next bet would require more money than you want or can lose')
    err(`Next Bet: ${nextBet} < Your Balance: ${MAX_LOSS || balance}`)
    engine.stop()
  }
  info(`Betting: ${nextBet}, Multiplier: ${multiplier}x`)
  engine.placeBet(nextBet * 100, Math.round(multiplier * 100))
  lastBet = nextBet
  lastProfit = nextBet * multiplier - nextBet
}

engine.on('game_starting', function (data) {
  info('--------------------------------', false)
  info(`Entering game ${data.game_id}`)
  play(info, GAME_SETTINGS.mode)
})

engine.on('cashed_out', function (data) {
  if (data.username === USERNAME) {
    const stoppedAt = data.stopped_at / 100
    info(`Cashed out at ${stoppedAt}`)
    lastResult = GAME_RESULTS.WON
    lossesInARow = 0
  }
})


engine.on('game_crash', function (data) {
  lastResult = GAME_RESULTS[engine.lastGamePlay()]
  if (lastResult === GAME_RESULTS.NOT_PLAYED) {
    return
  }
  if (lastResult === GAME_RESULTS.LOST) {
    lossesInARow++
  }
  const gameCrash = data.game_crash / 100
  info(`Game crashed at ${gameCrash}x and was ${keyForValue(GAME_RESULTS, lastResult)}`)
  info(`Profit this session: ${getProfits()}`)
  info(`Time played: ${getTimePlayed()} minutes`)
})


/* ENTRY */
info('####################################################', false)
info(`Hello human, this is bitbot, let's play ${keyForValue(GAME_MODES, GAME_SETTINGS.mode)}`)
info(`You start with ${START_BALANCE}`)
info(`You are ready to loose ${MAX_LOSS || START_BALANCE} in total`)
