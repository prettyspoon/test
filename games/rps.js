// games/rps.js
window.GameModules = window.GameModules || {};
window.GameModules.rps = {
  init: function(container, send, isHost) {
    const BEATS = { rock:'scissors', scissors:'paper', paper:'rock' };
    const EMOJI = { rock:'✊', paper:'✋', scissors:'✌️' };

    let myPick = null, theirPick = null;
    let scores = { me:0, them:0, draws:0 };
    let round = 1;
    let outcome = null; // set once per round, not inside render

    function calcOutcome() {
      if (!myPick || !theirPick) return;
      if (myPick === theirPick) { outcome = 'Draw'; scores.draws++; }
      else if (BEATS[myPick] === theirPick) { outcome = 'You win!'; scores.me++; }
      else { outcome = 'They win'; scores.them++; }
      render();
    }

    function render() {
      container.innerHTML = '';
      container.style.cssText = 'width:100%;display:flex;flex-direction:column;align-items:center;';

      // scoreboard
      const sb = document.createElement('div');
      sb.style.cssText = 'display:flex;gap:24px;margin-bottom:20px;font-size:12px;letter-spacing:.06em;color:#8a9590;text-transform:uppercase;';
      sb.innerHTML = `<span>You ${scores.me}</span><span style="color:#ff6a3d">${scores.draws} draws</span><span>Them ${scores.them}</span>`;
      container.appendChild(sb);

      const rl = document.createElement('div');
      rl.style.cssText = 'font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8a9590;margin-bottom:20px;';
      rl.textContent = 'Round ' + round;
      container.appendChild(rl);

      // both picked — show result
      if (outcome) {
        const revealRow = document.createElement('div');
        revealRow.style.cssText = 'display:flex;align-items:center;gap:28px;margin-bottom:20px;';
        revealRow.innerHTML = `
          <div style="text-align:center">
            <div style="font-size:50px">${EMOJI[myPick]}</div>
            <div style="font-size:10px;color:#8a9590;margin-top:6px;text-transform:uppercase;letter-spacing:.1em">You</div>
          </div>
          <div style="font-size:20px;color:#8a9590">vs</div>
          <div style="text-align:center">
            <div style="font-size:50px">${EMOJI[theirPick]}</div>
            <div style="font-size:10px;color:#8a9590;margin-top:6px;text-transform:uppercase;letter-spacing:.1em">Them</div>
          </div>`;
        container.appendChild(revealRow);

        const res = document.createElement('div');
        res.style.cssText = 'font-size:16px;color:#f3ede1;margin-bottom:18px;';
        res.textContent = outcome;
        container.appendChild(res);

        const btn = document.createElement('button');
        btn.textContent = 'Next round';
        btn.style.cssText = 'font-family:inherit;font-size:13px;background:transparent;color:#f3ede1;border:1px solid rgba(255,255,255,.25);border-radius:2px;padding:10px 22px;cursor:pointer;';
        btn.onclick = () => { send({ type:'next-round' }); nextRound(); };
        container.appendChild(btn);
        return;
      }

      // waiting after pick
      if (myPick) {
        const w = document.createElement('div');
        w.style.cssText = 'text-align:center;';
        w.innerHTML = `<div style="font-size:50px;margin-bottom:12px">${EMOJI[myPick]}</div>
          <div style="font-size:12px;color:#8a9590;letter-spacing:.06em;">Waiting for opponent...</div>`;
        container.appendChild(w);
        return;
      }

      // pick buttons
      const prompt = document.createElement('div');
      prompt.style.cssText = 'font-size:12px;color:#8a9590;margin-bottom:18px;text-align:center;line-height:1.5;';
      prompt.textContent = 'Pick — result hidden until both choose';
      container.appendChild(prompt);

      const btnRow = document.createElement('div');
      btnRow.style.cssText = 'display:flex;gap:14px;';
      ['rock','paper','scissors'].forEach(c => {
        const b = document.createElement('button');
        b.style.cssText = 'font-size:42px;background:#f3ede1;border:none;border-radius:2px;width:78px;height:78px;cursor:pointer;';
        b.textContent = EMOJI[c];
        b.onclick = () => {
          if (myPick) return;
          myPick = c;
          send({ type:'pick', choice:c });
          render();
        };
        btnRow.appendChild(b);
      });
      container.appendChild(btnRow);
    }

    function nextRound() {
      myPick = null; theirPick = null; outcome = null;
      round++;
      render();
    }

    function receive(data) {
      if (data.type === 'pick') {
        theirPick = data.choice;
        if (myPick) calcOutcome();
        else render();
      }
      if (data.type === 'next-round') nextRound();
    }

    render();
    return {
      receive,
      cleanup: () => { container.innerHTML = ''; }
    };
  }
};
