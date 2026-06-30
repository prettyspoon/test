# Pocket Games — how it works & how to add more games

## Files

```
index.html          ← main hub (connection + game lobby)
games/
  tictactoe.js      ← Tic Tac Toe
  rps.js            ← Rock Paper Scissors
```

All files live on GitHub Pages. Both phones load them once over the internet, then the actual multiplayer connection runs directly phone-to-phone.

---

## How the 6-digit code works

The hub uses **PeerJS** — a library that handles WebRTC signaling automatically.

1. Host taps "Host" → gets a random 6-digit code → PeerJS registers it on their server
2. Joiner taps "Join" → enters the code → PeerJS looks up the host → phones handshake
3. Both phones now have a direct WebRTC data channel between them
4. PeerJS server is out of the picture — all game data goes phone-to-phone over local network

Both phones still need to be on the same WiFi or hotspot for the direct connection to work.

---

## Internet requirements

| Step | Needs internet? |
|------|----------------|
| Loading the page files from GitHub | Yes (once) |
| The 6-digit code handshake via PeerJS | Yes (briefly) |
| Actual gameplay after connecting | No — direct phone-to-phone |

---

## How to add a new game

**1. Create `games/yourgame.js`:**

```javascript
window.GameModules = window.GameModules || {};
window.GameModules.yourgame = {
  init: function(container, send, isHost) {
    // container — DOM element to render into
    // send(data) — sends any object to the other phone
    // isHost — true if this player hosted

    // build your game UI in container...

    return {
      receive: function(data) {
        // called when other phone calls send(data)
      },
      cleanup: function() {
        container.innerHTML = '';
        // clear timers/listeners
      }
    };
  }
};
```

**2. Add it to the GAMES array in `index.html`:**

```javascript
const GAMES = [
  { id: 'tictactoe', name: 'Tic Tac Toe',        icon: '✕',  desc: 'Classic 3×3 grid' },
  { id: 'rps',       name: 'Rock Paper Scissors', icon: '✊', desc: 'Simultaneous reveal' },
  { id: 'yourgame',  name: 'Your Game Name',      icon: '🎲', desc: 'Short description' },
];
```

That's the whole integration. The hub loads your file automatically when a player picks it.

---

## The send/receive pattern

```javascript
// Send a move
send({ type: 'move', square: 4 });

// Receive it on the other phone
receive: function(data) {
  if (data.type === 'move') applyMove(data.square);
}
```

Always include a `type` field. Keep objects small — just what's needed, not full game state.

---

## Ideas for future games

- Connect Four — turn-based column picks
- Battleship — turn-based coordinate guesses  
- Word game — each picks a word for the other to guess
- Quiz/trivia — simultaneous answers, reveal together (same pattern as RPS)
