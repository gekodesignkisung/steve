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
  var audio = { on: false, ctx: null };

  function click(freq) {
    if (!audio.on) return;
    if (!audio.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audio.ctx = new AC();
    }
    var c = audio.ctx;
    if (c.state === "suspended") c.resume();
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

  var sndBtn = document.getElementById("sndBtn");
  sndBtn.addEventListener("click", function () {
    audio.on = !audio.on;
    sndBtn.setAttribute("aria-pressed", String(audio.on));
    sndBtn.textContent = audio.on ? "소리 끄기" : "소리 켜기";
    if (audio.on) click(1600);
  });

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

  wBtn.addEventListener("click", function () {
    playing = (playing === wIdx) ? -1 : wIdx;
    wBtn.classList.toggle("is-playing", playing !== -1);
    wBtn.textContent = playing !== -1 ? "정지" : "선택";
    click(playing !== -1 ? 1400 : 900);
    paintWheel();
  });

  paintWheel();

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
     FIG.03 — 손잡이
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
     FIG.04 — 붙은 동사
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
     FIG.05 — 대화 vs 직접
     좌: 사전 작성된 대화 스크립트(시뮬레이션). 우: 결정 공간 전체 노출.
     입력 횟수와 대기 시간은 실측값.
     ========================================================== */
  var SCRIPT = [
    { me: "금요일에 저녁 예약하고 싶어", bot: "네, 어느 식당으로 예약할까요?" },
    { me: "고베규 스테이크하우스",       bot: "몇 분이 방문하시나요?" },
    { me: "네 명",                       bot: "희망하시는 시간대를 알려주세요." },
    { me: "저녁 7시쯤",                  bot: "확인해 보니 7시는 만석입니다. 6시 30분 또는 8시가 가능합니다. 어느 쪽으로 할까요?" },
    { me: "그럼 8시로",                  bot: "8시 4인으로 예약을 완료했습니다." }
  ];

  var chat     = document.getElementById("chat");
  var chatFoot = document.getElementById("chatFoot");
  var slotsEl  = document.getElementById("slots");
  var doneB    = document.getElementById("doneB");
  var tA = document.getElementById("tA"), wA = document.getElementById("wA");
  var tB = document.getElementById("tB"), wB = document.getElementById("wB");

  var chatStep = 0, chatTurns = 0, chatT0 = 0, chatWaiting = false;

  function bubble(mod, text) {
    var b = document.createElement("div");
    b.className = "bub bub--" + mod;
    b.textContent = text;
    chat.appendChild(b);
    chat.scrollTop = chat.scrollHeight;
    return b;
  }

  function renderChatFoot() {
    chatFoot.innerHTML = "";
    if (chatStep >= SCRIPT.length) {
      var done = document.createElement("span");
      done.className = "chat__closed";
      done.textContent = "예약 완료 · 왕복 " + chatTurns + "회";
      chatFoot.appendChild(done);
      return;
    }
    var b = document.createElement("button");
    b.className = "chip chip--say";
    b.textContent = "“" + SCRIPT[chatStep].me + "”";
    b.addEventListener("click", sendChat);
    chatFoot.appendChild(b);
  }

  function sendChat() {
    if (chatWaiting || chatStep >= SCRIPT.length) return;
    if (!chatT0) chatT0 = performance.now();

    var step = SCRIPT[chatStep];
    bubble("me", step.me);
    chatTurns++;
    tA.textContent = String(chatTurns);
    chatWaiting = true;
    chatFoot.innerHTML = "";

    var wait = bubble("wait", "응답 대기 중…");
    var delay = reduce ? 260 : 620 + chatStep * 190;

    window.setTimeout(function () {
      wait.remove();
      bubble("bot", step.bot);
      chatStep++;
      chatWaiting = false;
      wA.textContent = ((performance.now() - chatT0) / 1000).toFixed(1);
      renderChatFoot();
    }, delay);
  }

  // 좌석표: 시간 × 인원. 만석 정보는 묻기 전에 이미 화면에 있다.
  var TIMES = ["18:00", "18:30", "19:00", "19:30"];
  var PARTY = [2, 3, 4];
  var TAKEN = { "19:00|4": true, "19:00|3": true, "18:30|2": true, "19:30|4": true };

  function buildSlots() {
    slotsEl.innerHTML = "";
    slotsEl.appendChild(document.createElement("div"));   // 좌상단 빈칸

    TIMES.forEach(function (t) {
      var h = document.createElement("div");
      h.className = "slots__h";
      h.textContent = t;
      slotsEl.appendChild(h);
    });

    PARTY.forEach(function (p) {
      var r = document.createElement("div");
      r.className = "slots__r";
      r.textContent = p + "인";
      slotsEl.appendChild(r);

      TIMES.forEach(function (t) {
        var taken = !!TAKEN[t + "|" + p];
        var b = document.createElement("button");
        b.className = "slot";
        b.type = "button";
        b.disabled = taken;
        b.textContent = taken ? "만석" : "예약";
        b.setAttribute("aria-label", t + " " + p + "인 " + (taken ? "만석" : "예약 가능"));
        b.addEventListener("click", function () {
          if (b.classList.contains("is-done")) return;
          slotsEl.querySelectorAll(".slot").forEach(function (x) {
            x.classList.remove("is-done");
            if (!x.disabled) x.textContent = "예약";
          });
          b.classList.add("is-done");
          b.textContent = "완료";
          click(1700);
          tB.textContent = "1";
          wB.textContent = "0.0";
          setResult(t + " · " + p + "인 예약됨");
        });
        slotsEl.appendChild(b);
      });
    });
  }

  function setResult(text) {
    var r = doneB.querySelector(".done__result");
    if (!r) {
      r = document.createElement("span");
      r.className = "done__result";
      doneB.appendChild(r);
    }
    r.textContent = text;
  }

  function resetAll() {
    chat.innerHTML = "";
    chatStep = 0; chatTurns = 0; chatT0 = 0; chatWaiting = false;
    tA.textContent = "0";
    wA.textContent = "0.0";
    bubble("bot", "안녕하세요. 무엇을 도와드릴까요?");
    renderChatFoot();

    tB.textContent = "0";
    wB.textContent = "0.0";
    var r = doneB.querySelector(".done__result");
    if (r) r.remove();
    buildSlots();
  }

  document.getElementById("resetBtn").addEventListener("click", resetAll);
  resetAll();
})();
