# Cab Clash

Quick-fire mini-games for bored passengers, playable in any phone browser.

- **One phone** (`duel.html`): 2 players share one phone, each owns half the screen. First to 5 wins.
- **Party** (`party.html`): 2–8 players, each on their own phone. One person creates a party and shares the 4-character code or link; everyone plays the same mini-game at the same moment and scores by rank.

12 mini-games: Quick Draw, Tap Frenzy, Snap, Stop the Clock, Mental Math, Ink Trap, Dot Count, Odd One Out, Bigger One, Arrow Flip, Spell It, and Tug of War (one-phone only).

## How party mode works

Plain static files, no backend of its own. Phones exchange small JSON messages through three free public MQTT brokers at once (EMQX, HiveMQ and Mosquitto, over secure WebSockets); each phone uses whichever brokers it can reach, so one being down or blocked doesn't stop the game. The host's phone referees the match, so the host must keep the page open. Party codes are not secret: anyone with the code can join.

## Run locally

Open `index.html` in a browser, or serve the folder: `python3 -m http.server`.
