# Game flow changes: random starter and new defaults

## 1. Random starting player (every game)

How groups really play: nobody fixes the number of games at the start. They keep playing while it is fun, so the start of each game must feel fresh.

- Word reveal order stays as it is (Player 1, 2, 3 ... pass the phone round). No shuffle needed.
- After the last player has seen their word, the app picks a random starting player for the clues (screen 37, Who starts).
- Clues then go round in seating order from that player, wrapping round. Example with 5 players and Diya (P4) starting: Diya, Rohan, Aarav, Meera, Kabir.
- Every clue round in the same game uses the same order, so each player gives one clue per round.
- The imposter can be picked to start. Do not exclude them: if the imposter could never start, the starter would be known to be innocent, which gives the game away.
- The same player should not start two games in a row (when there are 3 or more players). Otherwise pick uniformly at random.
- Use a proper random pick (no sort with Math.random). Keep the last starter in game state; it does not need to survive an app restart.
- "Pick again" on the Who starts screen rerolls once, under the same rules.

Done when: over 100 simulated games with 5 players, every player starts at least once, nobody starts twice in a row, and the imposter starts roughly as often as anyone else.

## 2. New defaults

- Timer per clue: Off by default (the chip row still offers 30s, 60s, 90s, Custom).
- Clue rounds: 2 by default, so every player gives two one-word clues before voting.
- Only change defaults for new installs and for players who never changed the setting. Keep a setting the player chose.

## 3. Twists to consider (not built yet)

| Twist | How it works | Why it helps |
|---|---|---|
| Imposter's last chance | When the group catches the imposter, the imposter gets one guess at the secret word. Right guess steals the win. | Keeps the imposter in the game to the very end; big final moment |
| Session scoreboard | Points across games tonight: crew +1 for a catch, imposter +2 for surviving, +1 for a last-chance steal. Reset with "New session". | Fits "keep playing while it is fun"; gives a reason for one more game |
| Round twist cards | Optional: each clue round gets a rule, for example "clue must be a colour", "an action, no nouns", "rhymes with the word". | Makes round 2 feel different from round 1 |
| Undercover mode | The odd one out gets a similar word instead of "Imposter" (Mango vs Papaya) and does not know they are different. | Sneakier games; nobody is sure who is who |
| Double trouble | 7+ players: two imposters who do not know each other. | Bigger groups stay challenging (exists today inside Chaos) |
