/* ============================================================
   steve — 잡스가 시도했을 인터페이스 표본실
   데모 5종. 외부 요청 없음. 가짜 AI 응답 없음.
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ==========================================================
     소리 — 휠 클릭음
     본체에서 나는 딸깍 소리의 재현. 사용자가 켠 뒤에만 컨텍스트를 만든다.
     ========================================================== */
  var audio = { on: true, ctx: null };     // 기본 켜짐 — 컨텍스트는 첫 조작 때 만들어진다
  var sndBtn = document.getElementById("sndBtn");

  // 사용자 제스처 이후에만 오디오 컨텍스트를 만든다
  function ensureCtx() {
    if (!audio.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audio.ctx = new AC();
    }
    if (audio.ctx.state === "suspended") audio.ctx.resume();
    return audio.ctx;
  }

  function setSound(on) {
    audio.on = on;
    if (!sndBtn) return;                   // 토글 버튼은 없어도 된다 — 소리는 늘 켜져 있다
    sndBtn.setAttribute("aria-pressed", String(on));
    sndBtn.textContent = on ? "소리 끄기" : "소리 켜기";
  }

  function click(freq) {
    if (!audio.on) return;
    var c = ensureCtx();
    if (!c) return;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = "square";
    osc.frequency.value = freq || 2100;
    gain.gain.setValueAtTime(0.0001, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.055, c.currentTime + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.022);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.03);
  }

  if (sndBtn) {
    sndBtn.addEventListener("click", function () {
      setSound(!audio.on);
      if (audio.on) click(1600);
      else MUSIC.stop();
    });
    setSound(audio.on);
  }

  /* ==========================================================
     음악 — music-sample.mp3
     휠 가운데 버튼이 이 파일을 재생한다.
     ========================================================== */
  var MUSIC = (function () {
    var el = document.getElementById("track");
    var ended = null;

    if (el) {
      el.volume = 0.85;
      el.addEventListener("ended", function () { if (ended) ended(); });
    }

    return {
      play: function () {
        if (!el) return false;
        el.currentTime = 0;
        var p = el.play();
        if (p && p.catch) p.catch(function () { /* 브라우저가 막으면 조용히 넘어간다 */ });
        return true;
      },
      stop: function () {
        if (!el) return;
        el.pause();
        el.currentTime = 0;
      },
      isOn: function () { return !!el && !el.paused; },
      onEnded: function (fn) { ended = fn; }
    };
  })();

  /* ==========================================================
     FIG.01 — 휠
     회전 각속도가 커질수록 한 칸 이동에 필요한 각도(임계각)가 줄어든다.
     ========================================================== */
  var TRACKS = [
    ["Like a Rolling Stone", "Bob Dylan"],
    ["The Times They Are a-Changin'", "Bob Dylan"],
    ["Blowin' in the Wind", "Bob Dylan"],
    ["Mr. Tambourine Man", "Bob Dylan"],
    ["Subterranean Homesick Blues", "Bob Dylan"],
    ["Desolation Row", "Bob Dylan"],
    ["Visions of Johanna", "Bob Dylan"],
    ["Just Like a Woman", "Bob Dylan"],
    ["Positively 4th Street", "Bob Dylan"],
    ["Tangled Up in Blue", "Bob Dylan"],
    ["Shelter from the Storm", "Bob Dylan"],
    ["Don't Think Twice, It's All Right", "Bob Dylan"],
    ["Girl from the North Country", "Bob Dylan"],
    ["It's Alright, Ma", "Bob Dylan"],
    ["Idiot Wind", "Bob Dylan"],
    ["One Too Many Mornings", "Bob Dylan"],
    ["Come Together", "The Beatles"],
    ["Something", "The Beatles"],
    ["Here Comes the Sun", "The Beatles"],
    ["A Day in the Life", "The Beatles"],
    ["Strawberry Fields Forever", "The Beatles"],
    ["Let It Be", "The Beatles"],
    ["Blackbird", "The Beatles"],
    ["In My Life", "The Beatles"],
    ["Eleanor Rigby", "The Beatles"],
    ["Norwegian Wood", "The Beatles"],
    ["While My Guitar Gently Weeps", "The Beatles"],
    ["Hey Jude", "The Beatles"],
    ["Yesterday", "The Beatles"],
    ["Across the Universe", "The Beatles"],
    ["Two of Us", "The Beatles"],
    ["Diamonds & Rust", "Joan Baez"],
    ["The Night They Drove Old Dixie Down", "Joan Baez"],
    ["Farewell, Angelina", "Joan Baez"],
    ["Gimme Shelter", "The Rolling Stones"],
    ["Wild Horses", "The Rolling Stones"],
    ["Paint It Black", "The Rolling Stones"],
    ["So What", "Miles Davis"],
    ["Blue in Green", "Miles Davis"],
    ["All Blues", "Miles Davis"],
    ["Freddie Freeloader", "Miles Davis"],
    ["Goldberg Variations: Aria", "Glenn Gould"],
    ["Cello Suite No.1: Prélude", "Yo-Yo Ma"],
    ["Both Sides, Now", "Joni Mitchell"],
    ["A Case of You", "Joni Mitchell"],
    ["River", "Joni Mitchell"],
    ["The Boxer", "Simon & Garfunkel"],
    ["The Sound of Silence", "Simon & Garfunkel"],
    ["Bridge Over Troubled Water", "Simon & Garfunkel"],
    ["Ripple", "Grateful Dead"],
    ["Box of Rain", "Grateful Dead"],
    ["Where the Streets Have No Name", "U2"],
    ["Peace Train", "Cat Stevens"],
    ["Catch the Wind", "Donovan"]
  ];

  var ROW_H = 32;
  var wList  = document.getElementById("wheelList");
  var wPos   = document.getElementById("wheelPos");
  var wheel  = document.getElementById("wheel");
  var wBtn   = document.getElementById("wheelBtn");
  var needle = document.getElementById("needle");
  var elDeg  = document.getElementById("wDeg");
  var elThr  = document.getElementById("wThr");
  var elStep = document.getElementById("wSteps");

  var wIdx = 0, wMoves = 0, playing = -1;

  TRACKS.forEach(function (t) {
    var r = document.createElement("div");
    r.className = "row";
    var title = document.createElement("span");
    title.className = "row__t";
    title.textContent = t[0];
    var artist = document.createElement("span");
    artist.className = "row__a";
    artist.textContent = t[1];
    r.appendChild(title);
    r.appendChild(artist);
    wList.appendChild(r);
  });
  var rows = wList.children;

  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  function paintWheel() {
    wList.style.transform = "translateY(" + (-wIdx * ROW_H) + "px)";
    for (var i = 0; i < rows.length; i++) {
      rows[i].classList.toggle("is-sel", i === wIdx);
      var eq = rows[i].querySelector(".eq");
      if (i === playing && !eq) {
        var e = document.createElement("span");
        e.className = "eq";
        e.appendChild(document.createElement("i"));
        e.appendChild(document.createElement("i"));
        e.appendChild(document.createElement("i"));
        rows[i].insertBefore(e, rows[i].firstChild);
      } else if (i !== playing && eq) {
        eq.remove();
      }
    }
    wPos.textContent = pad2(wIdx + 1) + " / " + TRACKS.length;
    wheel.setAttribute("aria-valuenow", String(wIdx + 1));
    wheel.setAttribute("aria-valuetext", TRACKS[wIdx][0] + " — " + TRACKS[wIdx][1]);
    elStep.textContent = String(wMoves);
  }

  function moveWheel(d) {
    var next = Math.min(TRACKS.length - 1, Math.max(0, wIdx + d));
    if (next === wIdx) return;
    wMoves += Math.abs(next - wIdx);
    wIdx = next;
    click(2100 + (wIdx % 5) * 60);
    paintWheel();
  }

  var wDrag = null;

  function angleAt(ev) {
    var r = wheel.getBoundingClientRect();
    return Math.atan2(ev.clientY - (r.top + r.height / 2),
                      ev.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
  }

  wheel.addEventListener("pointerdown", function (ev) {
    if (ev.target === wBtn) return;
    var r = wheel.getBoundingClientRect();
    var dx = ev.clientX - (r.left + r.width / 2);
    var dy = ev.clientY - (r.top + r.height / 2);
    if (Math.sqrt(dx * dx + dy * dy) < 46) return;   // 중앙 버튼 영역은 회전 대상 아님
    wheel.setPointerCapture(ev.pointerId);
    wheel.classList.add("is-active");
    wDrag = { last: angleAt(ev), acc: 0, total: 0, t: performance.now(), speed: 0 };
    ev.preventDefault();
  });

  wheel.addEventListener("pointermove", function (ev) {
    if (!wDrag) return;
    var a = angleAt(ev);
    var d = a - wDrag.last;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    wDrag.last = a;
    wDrag.acc += d;
    wDrag.total += d;

    var now = performance.now();
    var dt = Math.max(8, now - wDrag.t);
    wDrag.t = now;
    // 각속도(도/초) — 지수 평활
    wDrag.speed = wDrag.speed * 0.72 + (Math.abs(d) / dt * 1000) * 0.28;

    // 가속: 빠르게 돌릴수록 한 칸에 필요한 각도가 줄어든다
    var thr = 14;
    if (wDrag.speed > 220) thr = 9;
    if (wDrag.speed > 520) thr = 5.5;
    if (wDrag.speed > 900) thr = 3.2;

    needle.style.transform = "rotate(" + wDrag.total + "deg)";
    elDeg.textContent = Math.round(wDrag.total) + "°";
    elThr.textContent = thr.toFixed(1) + "°";

    while (Math.abs(wDrag.acc) >= thr) {
      moveWheel(wDrag.acc > 0 ? 1 : -1);
      wDrag.acc += (wDrag.acc > 0 ? -thr : thr);
    }
  });

  function endWheel(ev) {
    if (!wDrag) return;
    try { wheel.releasePointerCapture(ev.pointerId); } catch (e) { /* 이미 해제됨 */ }
    wDrag = null;
    wheel.classList.remove("is-active");
  }
  wheel.addEventListener("pointerup", endWheel);
  wheel.addEventListener("pointercancel", endWheel);

  wheel.addEventListener("keydown", function (ev) {
    var k = ev.key;
    if (k === "ArrowDown" || k === "ArrowRight")      { moveWheel(1);  ev.preventDefault(); }
    else if (k === "ArrowUp" || k === "ArrowLeft")    { moveWheel(-1); ev.preventDefault(); }
    else if (k === "PageDown")                        { moveWheel(7);  ev.preventDefault(); }
    else if (k === "PageUp")                          { moveWheel(-7); ev.preventDefault(); }
    else if (k === "Home")                            { moveWheel(-TRACKS.length); ev.preventDefault(); }
    else if (k === "End")                             { moveWheel(TRACKS.length);  ev.preventDefault(); }
  });

  var nowPlaying = document.getElementById("nowPlaying");

  function paintNowPlaying() {
    nowPlaying.textContent = "";
    var tag = document.createElement("span");
    tag.className = "nowplaying__tag";
    tag.textContent = "샘플 음원";
    nowPlaying.appendChild(tag);

    var line = document.createElement("span");
    if (playing === -1) {
      line.textContent = "가운데 버튼으로 재생";
    } else {
      line.appendChild(document.createTextNode("재생 중 "));
      var b = document.createElement("b");
      b.textContent = "music-sample.mp3";
      line.appendChild(b);
    }
    nowPlaying.appendChild(line);
  }

  function setPlaying(idx) {
    playing = idx;
    wBtn.classList.toggle("is-playing", idx !== -1);
    wBtn.textContent = idx !== -1 ? "정지" : "선택";
    paintWheel();
    paintNowPlaying();
  }

  wBtn.addEventListener("click", function () {
    if (playing !== wIdx) {
      if (!audio.on) setSound(true);
      if (MUSIC.play()) setPlaying(wIdx);
    } else {
      MUSIC.stop();
      setPlaying(-1);
    }
  });

  MUSIC.onEnded(function () { setPlaying(-1); });

  paintWheel();
  paintNowPlaying();

  /* ==========================================================
     FIG.02 — 관성 & 고무줄
     두 스크롤러의 데이터와 기능은 동일. 손을 뗀 뒤의 물리만 다르다.
     ========================================================== */
  var SHIPPED = [
    [1976, "Apple I", "조립 기판, 666.66달러"],
    [1977, "Apple II", "컬러 · 완제품 케이스"],
    [1979, "VisiCalc", "Apple II 전용 표계산"],
    [1980, "Apple III", "상업적 실패"],
    [1983, "Lisa", "최초의 GUI 상용기"],
    [1984, "Macintosh", "마우스 · 1버튼"],
    [1985, "LaserWriter", "탁상출판의 시작"],
    [1985, "잡스 퇴사", "NeXT 설립"],
    [1988, "NeXT Computer", "객체지향 · 광자기 드라이브"],
    [1996, "NeXT 인수", "애플 복귀의 경로"],
    [1997, "임시 CEO", "제품군 70% 폐기"],
    [1998, "iMac G3", "본다이 블루 · 플로피 제거"],
    [2001, "Mac OS X", "NeXTSTEP 계보"],
    [2001, "iPod", "클릭휠 · 1,000곡"],
    [2003, "iTunes Store", "곡당 99센트"],
    [2005, "Mac mini", "본체만 파는 맥"],
    [2006, "Intel 전환", "PowerPC 종료"],
    [2007, "iPhone", "멀티터치 · 스타일러스 없음"],
    [2008, "MacBook Air", "서류봉투에서 꺼내다"],
    [2008, "App Store", "3자 앱 유통"],
    [2010, "iPad", "10인치 터치"],
    [2010, "iPhone 4", "레티나 · 알루미늄 밴드"],
    [2010, "Siri 인수", "대화가 아닌 실행"],
    [2011, "iCloud", "마지막 기조연설"]
  ];

  function fillItems(el) {
    SHIPPED.forEach(function (s) {
      var d = document.createElement("div");
      d.className = "item";
      ["item__y", "item__n", "item__d"].forEach(function (cls, i) {
        var span = document.createElement("span");
        span.className = cls;
        span.textContent = s[i];
        d.appendChild(span);
      });
      el.appendChild(d);
    });
  }

  function makeScroller(host, opts) {
    var inner = host.querySelector(".scroller__inner");
    fillItems(inner);

    var edges = host.querySelectorAll(".scroller__edge");
    var y = 0, v = 0, down = false, lastY = 0, lastT = 0, raf = null;

    function minY() { return Math.min(0, host.clientHeight - inner.scrollHeight); }

    function paint() {
      inner.style.transform = "translate3d(0," + y.toFixed(2) + "px,0)";
      var min = minY();
      var over = y > 0 ? y : (y < min ? min - y : 0);
      opts.report(Math.abs(v), Math.round(over));
      if (edges.length === 2) {
        edges[0].classList.toggle("is-hit", y >= 0 && !down && Math.abs(v) < 0.2);
        edges[1].classList.toggle("is-hit", y <= min && !down && Math.abs(v) < 0.2);
      }
    }

    function clampHard() {
      var min = minY();
      if (y > 0)   { y = 0;   v = 0; }
      if (y < min) { y = min; v = 0; }
    }

    function tick() {
      var min = minY();
      if (opts.physics) {
        if (y > 0 || y < min) {
          // 고무줄 복귀 — 감쇠 스프링
          var target = y > 0 ? 0 : min;
          v += (target - y) * 0.16;
          v *= 0.62;
          y += v;
          if (Math.abs(target - y) < 0.4 && Math.abs(v) < 0.4) { y = target; v = 0; }
        } else {
          y += v;
          v *= 0.94;
          if (Math.abs(v) < 0.08) v = 0;
        }
      } else {
        y += v;
        v *= 0.94;
        if (Math.abs(v) < 0.08) v = 0;
        clampHard();                    // 경계에서 즉시 사망
      }
      paint();
      if (v !== 0 || y > 0 || y < minY()) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
        paint();
      }
    }

    host.addEventListener("pointerdown", function (ev) {
      down = true;
      host.setPointerCapture(ev.pointerId);
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      v = 0;
      lastY = ev.clientY;
      lastT = performance.now();
      ev.preventDefault();
    });

    host.addEventListener("pointermove", function (ev) {
      if (!down) return;
      var dy = ev.clientY - lastY;
      var now = performance.now();
      var dt = Math.max(8, now - lastT);
      lastY = ev.clientY;
      lastT = now;

      var min = minY();
      if (opts.physics && (y > 0 || y < min)) dy *= 0.38;   // 경계 밖 저항
      y += dy;
      if (!opts.physics) clampHard();

      v = v * 0.4 + (dy / dt * 16) * 0.6;
      paint();
    });

    function release(ev) {
      if (!down) return;
      down = false;
      try { host.releasePointerCapture(ev.pointerId); } catch (e) { /* 이미 해제됨 */ }
      if (!opts.physics) {
        v = 0;              // 관성 없음: 손을 떼면 그 자리에서 끝
        clampHard();
        paint();
        return;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    }
    host.addEventListener("pointerup", release);
    host.addEventListener("pointercancel", release);

    host.addEventListener("wheel", function (ev) {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      y -= ev.deltaY;
      clampHard();
      paint();
      ev.preventDefault();
    }, { passive: false });

    paint();
  }

  var vA = document.getElementById("vA"), oA = document.getElementById("oA");
  var vB = document.getElementById("vB"), oB = document.getElementById("oB");

  makeScroller(document.getElementById("scA"), {
    physics: false,
    report: function (s, o) { vA.textContent = s.toFixed(1); oA.textContent = o + "px"; }
  });
  makeScroller(document.getElementById("scB"), {
    physics: true,
    report: function (s, o) { vB.textContent = s.toFixed(1); oB.textContent = o + "px"; }
  });

  /* ==========================================================
     FIG.06 — 스케일 손잡이
     상세도 5단계. 각 단계의 본문과 "안 쳐도 되는 문장"이 짝을 이룬다.
     ========================================================== */
  var LEVELS = [
    {
      text: "1984년 매킨토시는 마우스와 그래픽 화면을 대중에게 처음 판 컴퓨터였다.",
      prompt: "매킨토시 한 문장으로 요약해줘"
    },
    {
      text: "1984년 매킨토시는 마우스와 그래픽 화면을 대중에게 처음 판 컴퓨터였다. 2,495달러였고, 같은 기술을 먼저 담았던 리사는 그 네 배 가격에 팔리다 실패했다.",
      prompt: "매킨토시 짧게 설명해줘"
    },
    {
      text: "1984년 매킨토시는 마우스와 그래픽 화면을 대중에게 처음 판 컴퓨터였다. 2,495달러였고, 같은 기술을 먼저 담았던 리사는 그 네 배 가격에 팔리다 실패했다. 아이디어의 출처는 제록스 팔로알토연구소였지만, 잡스가 바꾼 것이 하나 있다. 마우스 버튼을 세 개에서 한 개로 줄인 것이다.",
      prompt: "매킨토시에 대해 설명해줘"
    },
    {
      text: "1984년 매킨토시는 마우스와 그래픽 화면을 대중에게 처음 판 컴퓨터였다. 2,495달러였고, 같은 기술을 먼저 담았던 리사는 그 네 배 가격에 팔리다 실패했다. 아이디어의 출처는 제록스 팔로알토연구소였지만, 잡스가 바꾼 것이 하나 있다. 마우스 버튼을 세 개에서 한 개로 줄인 것이다. 버튼이 하나면 누를 때 고민할 것이 없다. 128K 메모리라는 가혹한 제약 속에서도 수전 케어가 그린 아이콘과 서체가 들어간 이유도 같다. 기계가 아니라 사람 쪽에 부담을 지우지 않겠다는 선택이었다.",
      prompt: "매킨토시에 대해 자세히 설명해줘"
    },
    {
      text: "1984년 매킨토시는 마우스와 그래픽 화면을 대중에게 처음 판 컴퓨터였다. 2,495달러였고, 같은 기술을 먼저 담았던 리사는 그 네 배 가격에 팔리다 실패했다. 아이디어의 출처는 제록스 팔로알토연구소였지만, 잡스가 바꾼 것이 하나 있다. 마우스 버튼을 세 개에서 한 개로 줄인 것이다. 버튼이 하나면 누를 때 고민할 것이 없다. 128K 메모리라는 가혹한 제약 속에서도 수전 케어가 그린 아이콘과 서체가 들어간 이유도 같다. 기계가 아니라 사람 쪽에 부담을 지우지 않겠다는 선택이었다. 그러나 시장의 답은 냉정했다. 메모리는 부족했고 소프트웨어는 적었으며 판매는 급격히 꺾였다. 1985년 잡스는 자신이 만든 회사에서 밀려났다. 매킨토시가 옳았다는 사실이 증명되기까지는 그 뒤로 몇 년이 더 필요했다.",
      prompt: "매킨토시에 대해 아주 자세히, 배경과 결과까지 포함해서 설명해줘"
    }
  ];

  var paper    = document.getElementById("paper");
  var pText    = document.getElementById("paperText");
  var handle   = document.getElementById("handle");
  var ladder   = document.getElementById("ladder");
  var deadText = document.getElementById("deadText");
  var hLv      = document.getElementById("hLv");
  var hLen     = document.getElementById("hLen");
  var lv = 1;                       // 0-indexed

  LEVELS.forEach(function () { ladder.appendChild(document.createElement("i")); });

  function paintHandle() {
    var L = LEVELS[lv];
    pText.classList.add("is-swapping");
    window.setTimeout(function () {
      pText.textContent = L.text;
      pText.classList.remove("is-swapping");
    }, reduce ? 0 : 110);

    deadText.textContent = "“" + L.prompt + "”";
    hLv.textContent = String(lv + 1);
    hLen.textContent = String(L.text.length);
    handle.setAttribute("aria-valuenow", String(lv + 1));
    handle.setAttribute("aria-valuetext", "상세도 " + (lv + 1) + "단계, " + L.text.length + "자");
    for (var i = 0; i < ladder.children.length; i++) {
      ladder.children[i].classList.toggle("is-on", i <= lv);
    }
    paper.style.minHeight = (140 + lv * 46) + "px";
  }

  function setLv(n) {
    n = Math.max(0, Math.min(LEVELS.length - 1, n));
    if (n === lv) return;
    lv = n;
    click(1500 + lv * 120);
    paintHandle();
  }

  var hDrag = null;
  handle.addEventListener("pointerdown", function (ev) {
    handle.setPointerCapture(ev.pointerId);
    handle.classList.add("is-drag");
    hDrag = { y: ev.clientY, base: lv };
    ev.preventDefault();
  });
  handle.addEventListener("pointermove", function (ev) {
    if (!hDrag) return;
    setLv(hDrag.base + Math.round((ev.clientY - hDrag.y) / 46));
  });
  function endHandle(ev) {
    if (!hDrag) return;
    try { handle.releasePointerCapture(ev.pointerId); } catch (e) { /* 이미 해제됨 */ }
    hDrag = null;
    handle.classList.remove("is-drag");
  }
  handle.addEventListener("pointerup", endHandle);
  handle.addEventListener("pointercancel", endHandle);
  handle.addEventListener("keydown", function (ev) {
    if (ev.key === "ArrowDown" || ev.key === "ArrowRight") { setLv(lv + 1); ev.preventDefault(); }
    if (ev.key === "ArrowUp"   || ev.key === "ArrowLeft")  { setLv(lv - 1); ev.preventDefault(); }
  });

  paintHandle();

  /* ==========================================================
     FIG.07 — 명사 후 동사
     명사(대상)를 먼저 고르면 그 대상이 할 수 있는 동사만 나타난다.
     점선 상자에는 같은 결과를 얻기 위해 쳐야 했을 문장이 조립된다.
     ========================================================== */
  var PARA_LONG =
    "잡스는 <mark>기능을 더하는 것이 아니라 덜어내는 것</mark>으로 제품을 정의했다. " +
    "1997년 애플에 돌아온 그가 가장 먼저 한 일은 새 제품을 만드는 것이 아니라, " +
    "팔리고 있던 제품군의 70퍼센트를 없애는 것이었다.";
  var PARA_SHORT =
    "잡스는 <mark>덜어내는 것</mark>으로 제품을 정의했다. " +
    "1997년 복귀 후 그가 먼저 한 일은 제품군의 70퍼센트를 없애는 일이었다.";

  var photo    = document.getElementById("photo");
  var photoSvg = photo.querySelector("svg");
  var para     = document.getElementById("para");
  var mirror   = document.getElementById("mirrorText");
  var objPhoto = document.getElementById("objPhoto");
  var objPara  = document.getElementById("objPara");

  var state = {
    bright: false, gray: false, square: false, nobg: false,
    short: false, mark: false, quote: false
  };

  var PHRASE = {
    bright: "조금 밝게 하고",
    gray:   "흑백으로 바꾸고",
    square: "정사각형으로 자르고",
    nobg:   "배경을 지우고",
    short:  "짧게 줄이고",
    mark:   "핵심을 굵게 표시하고",
    quote:  "인용문 형식으로 만들고"
  };

  var PHOTO_KEYS = ["nobg", "gray", "square", "bright"];
  var PARA_KEYS  = ["short", "mark", "quote"];

  function paintDoc() {
    photo.classList.toggle("is-bright", state.bright);
    photo.classList.toggle("is-gray",   state.gray);
    photo.classList.toggle("is-square", state.square);
    photo.classList.toggle("is-nobg",   state.nobg);
    photoSvg.setAttribute("preserveAspectRatio", state.square ? "xMidYMid slice" : "xMidYMid meet");

    para.innerHTML = state.short ? PARA_SHORT : PARA_LONG;
    para.classList.toggle("is-mark",  state.mark);
    para.classList.toggle("is-quote", state.quote);

    var sel = document.querySelector(".obj.is-sel");
    if (!sel) { mirror.textContent = "대상을 선택하세요"; return; }

    var isPhoto = (sel === objPhoto);
    var noun = isPhoto ? "이 사진 " : "이 문단 ";
    var on = (isPhoto ? PHOTO_KEYS : PARA_KEYS).filter(function (k) { return state[k]; });

    if (!on.length) {
      mirror.textContent = noun + "어떻게 해줘…";
      return;
    }
    var parts = on.map(function (k) { return PHRASE[k]; });
    var last = parts.pop().replace(/고$/, "줘");
    mirror.textContent = noun + (parts.length ? parts.join(" ") + " " : "") + last;
  }

  function select(obj) {
    [objPhoto, objPara].forEach(function (o) {
      var on = (o === obj);
      o.classList.toggle("is-sel", on);
      o.setAttribute("aria-pressed", String(on));
      o.querySelectorAll(".verb").forEach(function (b) { b.tabIndex = on ? 0 : -1; });
    });
    paintDoc();
  }

  [objPhoto, objPara].forEach(function (o) {
    o.addEventListener("click", function (ev) {
      if (ev.target.closest(".verb")) return;
      select(o.classList.contains("is-sel") ? null : o);
    });
    o.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        select(o.classList.contains("is-sel") ? null : o);
      }
    });
  });

  document.querySelectorAll(".verb").forEach(function (b) {
    b.tabIndex = -1;
    b.addEventListener("click", function (ev) {
      ev.stopPropagation();
      var k = b.dataset.v;
      state[k] = !state[k];
      b.classList.toggle("is-on", state[k]);
      click(state[k] ? 1900 : 1100);
      paintDoc();
    });
  });

  // 바깥을 누르면 선택 해제
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest(".obj") && document.querySelector(".obj.is-sel")) select(null);
  });

  paintDoc();

  /* ==========================================================
     FIG.03 — 끌어다 놓기
     아이콘을 집어 폴더나 휴지통에 넣는다. 명령어를 칠 자리가 아예 없다.
     ========================================================== */
  var deskLoose = document.getElementById("deskLoose");
  var dropFold  = document.getElementById("dropFolder");
  var dropBin   = document.getElementById("dropBin");
  var deskCmd   = document.getElementById("deskCmd");
  var foldNum   = document.getElementById("foldNum");
  var binNum    = document.getElementById("binNum");
  var cntLoose  = document.getElementById("cntLoose");
  var cntMoved  = document.getElementById("cntMoved");
  var deskReset = document.getElementById("deskReset");

  var DESK_FILES = [
    { name: "계획서.txt", glyph: "▤" },
    { name: "사진.png",   glyph: "▩" },
    { name: "노래.mp3",   glyph: "♪" },
    { name: "메모.md",    glyph: "▤" }
  ];

  var inFolder = 0, inBin = 0, moved = 0, dragIcon = null;

  function deskPaint() {
    foldNum.textContent = String(inFolder);
    binNum.textContent = String(inBin);
    cntLoose.textContent = String(deskLoose.children.length);
    cntMoved.textContent = String(moved);
  }

  function deskSay(cmd) {
    deskCmd.textContent = cmd || "아이콘을 폴더나 휴지통으로 끌어보세요";
  }

  function hitBox(el, x, y) {
    var r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  function makeIcon(file) {
    var el = document.createElement("div");
    el.className = "icon";
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", file.name + " — 폴더나 휴지통으로 끌어놓기");

    var g = document.createElement("span");
    g.className = "icon__glyph";
    g.textContent = file.glyph;
    var n = document.createElement("span");
    n.className = "icon__name";
    n.textContent = file.name;
    el.appendChild(g);
    el.appendChild(n);

    el.addEventListener("pointerdown", function (ev) {
      el.setPointerCapture(ev.pointerId);
      el.classList.remove("icon--return");
      el.classList.add("is-lifted");
      dragIcon = { el: el, file: file, x: ev.clientX, y: ev.clientY };
      ev.preventDefault();
    });

    el.addEventListener("pointermove", function (ev) {
      if (!dragIcon || dragIcon.el !== el) return;
      el.style.transform =
        "translate(" + (ev.clientX - dragIcon.x) + "px," + (ev.clientY - dragIcon.y) + "px)";
      dropFold.classList.toggle("is-over", hitBox(dropFold, ev.clientX, ev.clientY));
      dropBin.classList.toggle("is-over", hitBox(dropBin, ev.clientX, ev.clientY));
    });

    function drop(ev) {
      if (!dragIcon || dragIcon.el !== el) return;
      try { el.releasePointerCapture(ev.pointerId); } catch (e) { /* 이미 해제됨 */ }
      el.classList.remove("is-lifted");
      dropFold.classList.remove("is-over");
      dropBin.classList.remove("is-over");

      var onFolder = hitBox(dropFold, ev.clientX, ev.clientY);
      var onBin    = hitBox(dropBin,  ev.clientX, ev.clientY);
      dragIcon = null;

      if (onFolder || onBin) {
        if (onFolder) { inFolder++; deskSay("mv " + file.name + " ~/프로젝트/"); }
        else          { inBin++;    deskSay("rm " + file.name); }
        moved++;
        el.remove();
        click(1750);
        deskPaint();
        return;
      }

      // 아무 데도 아니면 제자리로
      el.classList.add("icon--return");
      el.style.transform = "";
      click(1050);
    }
    el.addEventListener("pointerup", drop);
    el.addEventListener("pointercancel", drop);

    return el;
  }

  function deskBuild() {
    deskLoose.textContent = "";
    DESK_FILES.forEach(function (f) { deskLoose.appendChild(makeIcon(f)); });
    inFolder = 0; inBin = 0; moved = 0;
    deskSay("");
    deskPaint();
  }

  deskReset.addEventListener("click", deskBuild);
  deskBuild();

  /* ==========================================================
     FIG.04 — 밀어서 열기
     끝까지 밀어야만 열리고, 중간에 놓으면 아무 일도 없이 되돌아온다.
     ========================================================== */
  var lock      = document.getElementById("lock");
  var lockKnob  = document.getElementById("lockKnob");
  var lockFill  = document.getElementById("lockFill");
  var lockHint  = document.getElementById("lockHint");
  var lockState = document.getElementById("lockState");
  var lockPct   = document.getElementById("lockPct");
  var lockBack  = document.getElementById("lockBack");

  var LOCK_TH = 0.92;
  var lockX = 0, lockDrag = null, lockOpen = false, lockBacks = 0, lockRaf = null;

  function lockSpan() {
    return Math.max(1, lock.clientWidth - lockKnob.offsetWidth - 6);
  }

  function paintLock() {
    var p = Math.max(0, Math.min(1, lockX / lockSpan()));
    lockKnob.style.transform = "translateX(" + lockX.toFixed(1) + "px)";
    lockFill.style.transform = "scaleX(" + p.toFixed(4) + ")";
    lockHint.style.opacity = String(Math.max(0, 1 - p * 1.7));
    lockPct.textContent = Math.round(p * 100) + "%";
    lockKnob.setAttribute("aria-valuenow", String(Math.round(p * 100)));
  }

  function lockSay(mode) {
    lockState.textContent = "";
    var b = document.createElement("b");
    if (mode === "open") {
      b.textContent = "열렸습니다.";
      lockState.appendChild(b);
      lockState.appendChild(document.createTextNode(
        " 손잡이를 누르면 다시 잠깁니다. 주머니 속에서 저절로 여기까지 밀릴 확률은 사실상 0입니다."));
    } else if (mode === "back") {
      b.textContent = "되돌아왔습니다.";
      lockState.appendChild(b);
      lockState.appendChild(document.createTextNode(
        " 끝까지 밀지 않으면 아무 일도 일어나지 않습니다. 실패에 대가가 없다는 것이 이 컨트롤의 핵심입니다."));
    } else {
      lockState.textContent =
        "주머니 속에서 저절로 열리지 않으면서, 처음 쥔 사람도 설명 없이 열 수 있어야 했습니다.";
    }
  }

  function lockSpring() {
    if (lockRaf) { cancelAnimationFrame(lockRaf); lockRaf = null; }
    if (reduce) { lockX = 0; paintLock(); return; }
    (function tick() {
      lockX += (0 - lockX) * 0.22;
      if (lockX < 0.5) { lockX = 0; paintLock(); lockRaf = null; return; }
      paintLock();
      lockRaf = requestAnimationFrame(tick);
    })();
  }

  function lockSetOpen(on) {
    lockOpen = on;
    lock.classList.toggle("is-open", on);
    lockKnob.textContent = on ? "✓" : "▶";
    lockX = on ? lockSpan() : 0;
    paintLock();
  }

  function lockCommit() {
    lockDrag = null;
    lockSetOpen(true);
    lockSay("open");
    click(1500);
    window.setTimeout(function () { click(2050); }, 70);
  }

  lockKnob.addEventListener("pointerdown", function (ev) {
    if (lockOpen) { lockSetOpen(false); lockSay(""); click(900); return; }
    lockKnob.setPointerCapture(ev.pointerId);
    if (lockRaf) { cancelAnimationFrame(lockRaf); lockRaf = null; }
    lockDrag = { x: ev.clientX, base: lockX };
    ev.preventDefault();
  });

  lockKnob.addEventListener("pointermove", function (ev) {
    if (!lockDrag) return;
    lockX = Math.max(0, Math.min(lockSpan(), lockDrag.base + (ev.clientX - lockDrag.x)));
    paintLock();
    if (lockX / lockSpan() >= LOCK_TH) lockCommit();
  });

  function lockRelease(ev) {
    if (!lockDrag) return;
    try { lockKnob.releasePointerCapture(ev.pointerId); } catch (e) { /* 이미 해제됨 */ }
    lockDrag = null;
    if (lockOpen) return;
    if (lockX > 6) {
      lockBacks++;
      lockBack.textContent = String(lockBacks);
      lockSay("back");
    }
    lockSpring();
  }
  lockKnob.addEventListener("pointerup", lockRelease);
  lockKnob.addEventListener("pointercancel", lockRelease);

  lockKnob.addEventListener("keydown", function (ev) {
    var span = lockSpan();
    if (ev.key === "ArrowRight") {
      ev.preventDefault();
      lockX = Math.min(span, lockX + span * 0.12);
      paintLock();
      if (lockX / span >= LOCK_TH) lockCommit();
    } else if (ev.key === "ArrowLeft") {
      ev.preventDefault();
      lockX = Math.max(0, lockX - span * 0.12);
      paintLock();
    } else if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      if (lockOpen) { lockSetOpen(false); lockSay(""); }
      else { lockCommit(); }
    }
  });

  lockSay("");
  paintLock();

  /* ==========================================================
     FIG.08 — 미리 준비된 제안
     묻기 전에 이미 되어 있다. 사용자는 요청하지 않고 고르기만 한다.
     제안 문구는 전부 사전에 작성된 것 — 생성 호출은 없다.
     ========================================================== */
  var ghostDoc   = document.getElementById("ghostDoc");
  var ghostLeft  = document.getElementById("ghostLeft");
  var ghostTyped = document.getElementById("ghostTyped");
  var ghostWait  = document.getElementById("ghostWait");
  var ghostReset = document.getElementById("ghostReset");

  // [고정 문구, 제안] 순서로 이어 붙인다
  var DRAFT = [
    { fixed: "" },
    { was: "저희 팀은", now: "우리는" },
    { fixed: " 이번 분기에 신규 사용자 확보를 위한 " },
    { was: "다양한 노력을 진행하였으며", now: "세 가지를 했고" },
    { fixed: ", 그 결과 전월 대비 " },
    { was: "소폭의 증가가 있었던 것으로 확인되고 있습니다", now: "12% 늘었습니다" },
    { fixed: "." }
  ];

  function ghostPaint() {
    ghostDoc.textContent = "";
    var left = 0;

    DRAFT.forEach(function (seg, i) {
      if (seg.fixed !== undefined) {
        ghostDoc.appendChild(document.createTextNode(seg.fixed));
        return;
      }
      if (seg.done) {
        var kept = document.createElement("span");
        kept.className = "ghost__kept";
        kept.textContent = seg.taken ? seg.now : seg.was;
        ghostDoc.appendChild(kept);
        return;
      }

      left++;
      var wrap = document.createElement("span");
      wrap.className = "ghost";

      var was = document.createElement("span");
      was.className = "ghost__was";
      was.textContent = seg.was;

      var now = document.createElement("button");
      now.type = "button";
      now.className = "ghost__now";
      now.textContent = seg.now;
      now.setAttribute("aria-label", "“" + seg.was + "” 를 “" + seg.now + "” 로 바꾸기");
      now.addEventListener("click", function () {
        seg.done = true; seg.taken = true;
        click(1900);
        ghostPaint();
      });

      var no = document.createElement("button");
      no.type = "button";
      no.className = "ghost__no";
      no.textContent = "✕";
      no.setAttribute("aria-label", "이 제안 버리기");
      no.addEventListener("click", function () {
        seg.done = true; seg.taken = false;
        click(1100);
        ghostPaint();
      });

      wrap.appendChild(was);
      wrap.appendChild(now);
      wrap.appendChild(no);
      ghostDoc.appendChild(wrap);
    });

    ghostLeft.textContent = String(left);
  }

  ghostReset.addEventListener("click", function () {
    DRAFT.forEach(function (s) { s.done = false; s.taken = false; });
    click(1400);
    ghostPaint();
  });

  ghostTyped.textContent = "0";
  ghostWait.textContent = "0.0";
  ghostPaint();

  /* ==========================================================
     FIG.05 — 바뀌는 자판
     칸이 무엇을 받느냐에 따라 자판 자체가 교체된다.
     ========================================================== */
  var kbd      = document.getElementById("kbd");
  var kbdName  = document.getElementById("kbdName");
  var kbdSwaps = document.getElementById("kbdSwaps");
  var fields   = [].slice.call(document.querySelectorAll(".field"));

  var LAYOUTS = {
    text: {
      name: "문자", max: 18,
      rows: [
        "QWERTYUIOP".split(""),
        "ASDFGHJKL".split(""),
        [{ t: "⇧", act: "shift", cls: "key--util" }]
          .concat("ZXCVBNM".split(""), [{ t: "⌫", act: "back", cls: "key--util" }]),
        [{ t: "공백", act: "space", cls: "key--wide key--util" },
         { t: "다음", act: "done", cls: "key--go" }]
      ]
    },
    email: {
      name: "메일", max: 30,
      rows: [
        "QWERTYUIOP".split(""),
        "ASDFGHJKL".split(""),
        [{ t: "⇧", act: "shift", cls: "key--util" }]
          .concat("ZXCVBNM".split(""), [{ t: "⌫", act: "back", cls: "key--util" }]),
        // 스페이스가 사라진 자리에 맥락 키가 들어온다
        [{ t: "@", act: "ins", v: "@", cls: "key--ctx" },
         { t: ".", act: "ins", v: ".", cls: "key--ctx" },
         { t: ".com", act: "ins", v: ".com", cls: "key--ctx key--wide" },
         { t: "다음", act: "done", cls: "key--go" }]
      ]
    },
    number: {
      name: "숫자", max: 19,
      rows: [
        ["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"],
        [{ t: "⌫", act: "back", cls: "key--util" }, "0",
         { t: "완료", act: "done", cls: "key--go" }]
      ]
    }
  };

  var kbdShift = true, kbdKind = "text", kbdSwapCount = 0;
  var activeField = fields[0];

  function isLetter(ch) { return /^[A-Za-z]$/.test(ch); }

  function renderKbd() {
    var L = LAYOUTS[kbdKind];
    kbd.textContent = "";
    L.rows.forEach(function (row) {
      var r = document.createElement("div");
      r.className = "kbd__row";
      row.forEach(function (spec) {
        var s = (typeof spec === "string") ? { t: spec, act: "ins", v: spec } : spec;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "key" + (s.cls ? " " + s.cls : "");
        b.dataset.act = s.act;
        b.dataset.v = (s.v !== undefined ? s.v : s.t);
        b.textContent = (s.act === "ins" && isLetter(s.t) && !kbdShift) ? s.t.toLowerCase() : s.t;
        if (s.act === "shift") b.setAttribute("aria-pressed", String(kbdShift));
        r.appendChild(b);
      });
      kbd.appendChild(r);
    });
    kbdName.textContent = L.name;
  }

  function groupCard(digits) {
    return digits.replace(/\D/g, "").slice(0, 16).replace(/(.{4})(?=.)/g, "$1 ");
  }

  function fieldValueEl(f) { return f.querySelector(".field__value"); }

  function setActiveField(f, countSwap) {
    activeField = f;
    fields.forEach(function (x) { x.classList.toggle("is-active", x === f); });
    var kind = f.dataset.kbd;
    if (kind !== kbdKind) {
      kbdKind = kind;
      kbdShift = (kind !== "number") && !fieldValueEl(f).textContent;
      if (countSwap) {
        kbdSwapCount++;
        kbdSwaps.textContent = String(kbdSwapCount);
      }
    }
    renderKbd();
  }

  function kbdPress(act, v) {
    var el = fieldValueEl(activeField);
    var cur = el.textContent;
    var max = LAYOUTS[kbdKind].max;

    if (act === "shift") { kbdShift = !kbdShift; renderKbd(); click(1200); return; }

    if (act === "done") {
      var next = fields[(fields.indexOf(activeField) + 1) % fields.length];
      setActiveField(next, true);
      click(1500);
      return;
    }

    if (act === "back") {
      el.textContent = kbdKind === "number" ? groupCard(cur.slice(0, -1)) : cur.slice(0, -1);
    } else if (act === "space") {
      if (cur.length < max && cur.slice(-1) !== " ") el.textContent = cur + " ";
    } else {
      var ch = v;
      if (isLetter(ch)) ch = kbdShift ? ch.toUpperCase() : ch.toLowerCase();
      if (cur.length + ch.length <= max) {
        el.textContent = kbdKind === "number" ? groupCard(cur + ch) : cur + ch;
      }
      if (kbdShift && isLetter(v)) { kbdShift = false; renderKbd(); }   // 한 글자만 대문자
    }
    click(1850);
  }

  kbd.addEventListener("click", function (ev) {
    var b = ev.target.closest(".key");
    if (!b) return;
    kbdPress(b.dataset.act, b.dataset.v);
  });

  fields.forEach(function (f) {
    f.addEventListener("click", function () { setActiveField(f, true); });
  });

  setActiveField(fields[0], false);

  /* ==========================================================
     상단 고정 탭 — 누르면 해당 표본이 바로 아래에 열린다
     ========================================================== */
  var tabEls  = [].slice.call(document.querySelectorAll(".tab"));
  var panels  = tabEls.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
  var tabsTop = document.getElementById("tabsTop");
  var panelBox = document.getElementById("panels");

  /* 판마다 내용 분량이 달라 높이가 제각각이다.
     가장 높은 판을 실측해 모든 판을 그 높이로 맞춘다 — 탭을 눌러도 상자가 안 덜컹거리도록.
     레이아웃만 읽고 페인트 전에 원상복구하므로 깜빡임은 없다. */
  function lockPanelHeight() {
    if (!panelBox) return;
    var was = panels.map(function (p) { return p.hidden; });
    var paperWas = paper.style.minHeight;
    var tallest = 0;

    // 손잡이는 끝까지 늘렸을 때가 가장 높다 — 그 상태로 재야 나중에 넘치지 않는다
    paper.style.minHeight = (140 + (LEVELS.length - 1) * 46) + "px";
    panels.forEach(function (p) { p.style.minHeight = "0px"; });

    panels.forEach(function (p) {
      panels.forEach(function (q) { q.hidden = (q !== p); });
      tallest = Math.max(tallest, p.offsetHeight);
    });

    panels.forEach(function (p, i) {
      p.hidden = was[i];
      p.style.minHeight = tallest + "px";
    });
    paper.style.minHeight = paperWas;
  }

  var heightQueued = false;
  function queueHeight() {
    if (heightQueued) return;
    heightQueued = true;
    requestAnimationFrame(function () { heightQueued = false; lockPanelHeight(); });
  }
  window.addEventListener("resize", queueHeight);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(lockPanelHeight);

  // 다시 보일 때 폭을 다시 재야 하는 표본들
  var ON_SHOW = { fig4: paintLock };

  function showTab(i, doScroll) {
    // 휠 표본을 떠나면 소리도 함께 멈춘다
    if (panels[i] && panels[i].id !== "fig1" && MUSIC.isOn()) {
      MUSIC.stop();
      playing = -1;
      wBtn.classList.remove("is-playing");
      wBtn.textContent = "선택";
      paintWheel();
      paintNowPlaying();
    }

    tabEls.forEach(function (t, k) {
      var on = (k === i);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      if (panels[k]) panels[k].hidden = !on;
    });

    var id = panels[i] ? panels[i].id : null;
    if (id) {
      if (window.history && history.replaceState) history.replaceState(null, "", "#" + id);
      if (ON_SHOW[id]) ON_SHOW[id]();
    }
    if (doScroll && tabsTop) {
      tabsTop.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    }
  }

  tabEls.forEach(function (t, i) {
    t.addEventListener("click", function () { showTab(i, true); click(1700); });
    t.addEventListener("keydown", function (ev) {
      var d = ev.key === "ArrowRight" ? 1 : (ev.key === "ArrowLeft" ? -1 : 0);
      if (!d) return;
      ev.preventDefault();
      var n = (i + d + tabEls.length) % tabEls.length;
      tabEls[n].focus();
      showTab(n, false);
    });
  });

  // 시작 판의 목차에서 바로 해당 표본으로
  [].slice.call(document.querySelectorAll("[data-goto]")).forEach(function (b) {
    b.addEventListener("click", function () {
      for (var i = 0; i < panels.length; i++) {
        if (panels[i] && panels[i].id === b.dataset.goto) { showTab(i, true); click(1700); return; }
      }
    });
  });

  // 주소창 해시로 바로 들어온 경우 해당 표본을 연다
  var start = 0;
  if (location.hash) {
    for (var pi = 0; pi < panels.length; pi++) {
      if (panels[pi] && "#" + panels[pi].id === location.hash) { start = pi; break; }
    }
  }
  showTab(start, false);
  lockPanelHeight();
})();
