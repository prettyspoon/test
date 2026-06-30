// games/tictactoe.js
// Registers under window.GameModules.tictactoe
// Interface: init(container, send, isHost) → { receive(data), cleanup() }

window.GameModules = window.GameModules || {};
window.GameModules.tictactoe = {
  init: function(container, send, isHost) {
    // Host = X and goes first. Joiner = O.
    const MY  = isHost ? 'X' : 'O';
    const OPP = isHost ? 'O' : 'X';

    let board    = Array(9).fill(null);
    let myTurn   = isHost;  // X always starts
    let over     = false;
    let scores   = { me: 0, them: 0, draws: 0 };

    const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

    // ── render ──
    function render() {
      container.innerHTML = '';
      container.style.cssText = 'width:100%;display:flex;flex-direction:column;align-items:center;';

      // scoreboard
      const sb = document.createElement('div');
      sb.style.cssText = 'display:flex;gap:24px;margin-bottom:16px;font-size:12px;letter-spacing:.06em;color:#8a9590;text-transform:uppercase;';
      sb.innerHTML = `<span>You (${MY}) ${scores.me}</span><span style="color:#ff6a3d">${scores.draws} draws</span><span>Them (${OPP}) ${scores.them}</span>`;
      container.appendChild(sb);

      // turn banner
      const banner = document.createElement('div');
      banner.style.cssText = 'font-size:13px;letter-spacing:.05em;margin-bottom:14px;color:#f3ede1;text-align:center;min-height:18px;';
      if (!over) banner.textContent = myTurn ? 'Your turn' : "Opponent's turn";
      container.appendChild(banner);

      // board
      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:100%;max-width:300px;aspect-ratio:1;';
      board.forEach((val, i) => {
        const cell = document.createElement('div');
        cell.style.cssText = 'background:#f3ede1;border-radius:2px;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-size:52px;cursor:pointer;user-select:none;';
        if (val === 'X') cell.style.color = '#ff6a3d';
        if (val === 'O') cell.style.color = '#3d7a5c';
        cell.textContent = val || '';
        cell.onclick = () => handleClick(i);
        grid.appendChild(cell);
      });
      container.appendChild(grid);

      // result
      const res = document.createElement('div');
      res.style.cssText = 'margin-top:18px;font-size:15px;text-align:center;min-height:20px;color:#f3ede1;';
      container.appendChild(res);

      // rematch button
      if (over) {
        const btn = document.createElement('button');
        btn.textContent = 'Play again';
        btn.style.cssText = 'margin-top:12px;font-family:inherit;font-size:13px;background:transparent;color:#f3ede1;border:1px solid rgba(255,255,255,.25);border-radius:2px;padding:10px 20px;cursor:pointer;';
        btn.onclick = () => { send({ type:'rematch' }); resetGame(true); };
        container.appendChild(btn);
      }
    }

    function handleClick(i) {
      if (over || !myTurn || board[i]) return;
      board[i] = MY;
      myTurn = false;
      send({ type:'move', index:i });
      checkEnd(MY);
      render();
    }

    function checkEnd(sym) {
      for (const [a,b,c] of WINS) {
        if (board[a] && board[a]===board[b] && board[b]===board[c]) {
          over = true;
          if (sym === MY) scores.me++; else scores.them++;
          updateResult(sym === MY ? 'You win 🎉' : 'They win');
          return;
        }
      }
      if (board.every(v=>v)) {
        over = true; scores.draws++;
        updateResult('Draw');
      }
    }

    function updateResult(text) {
      render(); // re-render so result div exists
      const res = container.querySelectorAll('div')[3];
      if (res) res.textContent = text;
    }

    function resetGame(iInitiated) {
      board   = Array(9).fill(null);
      myTurn  = isHost; // X always starts
      over    = false;
      render();
    }

    // ── receive from other phone ──
    function receive(data) {
      if (data.type === 'move') {
        board[data.index] = OPP;
        myTurn = true;
        checkEnd(OPP);
        render();
      }
      if (data.type === 'rematch') {
        resetGame(false);
      }
    }

    render();

    return {
      receive,
      cleanup: () => { container.innerHTML = ''; }
    };
  }
};
