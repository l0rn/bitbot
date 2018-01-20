# bitbot

If you find this software useful you can buy me a beer:

XRB: xrb_19eddjrtk8z9t8zuc44eaa6z89cid15564k1k1iphbqybcwkjrfj9jpzm8s4
ETH: 0x45d763A0cf7d143D79AE7E1f5196bB2370e49F97
LTC: LM6P48B7xjrcCastrTWh8wmD6C4STDPYpV


This is bitbot. It bots bits. The script uses all kinds of fancy ES6 stuff, so better use a recent browser.

Go to a gambling website like raigames.io, create an account and deposit some money.

Go to the play screen, click on the "auto" tab, change the little dropdown from "AutoBet" to manual and copy in the contents of "script.js".
Then click on RUN and enjoy.

You probably should pay attention to the "SETTINGS" section:

```javascript
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

```

Short explanation: 

Do not change LOG_LEVEL unless you want to be spammed with debug messages.
GAME_SETTINGS takes an object, where `mode` should be a game mode listet in `GAME_MODES` (currently only MARTINGALE)

You can parameterize it, for example if you set `maxLossStreak` the bot calculates the proper base bet so you can survive a streak up to x. `START_BET` will be ignored then.

You can set a cool off. Set `coolOffAfterLossStreak` to define after how many losses you want to cool. Set `coolOffRounds` to a number to have it fixed or a 2 number array to get a random coolOff between those.

Set `START_BET` to set a start bet, only will take effect if it's not calculated by some game mode setting.

Set `MULTIPLIER` to set the multiplier. Might be overwritten by game mode specifics.

Set `MAX_LOSS` if you want the script to stop after a certain loss. Set it to false and the bot will drain your whole balance in worst case.


Some disclaimers:

If this software looses money for you because of any reason (bug, bad luck) thats sad, but on your own responsibility.

Never play with money you can't afford to lose. Remember gambling is NEVER "fair". You only might be in luck.