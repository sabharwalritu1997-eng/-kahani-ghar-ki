// कहानी घर की — होमपेज कार्ड और कहानी पढ़ने वाला पेज
const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[ch]));

const storyList = typeof stories !== "undefined" && Array.isArray(stories) ? stories : [];

// हर कहानी के लिए एक 2D anime-style cover (बाहरी image की ज़रूरत नहीं)
function coverSVG(seed) {
  const n = seed % 3;
  const moonX = 215 + n * 25;
  const houseX = 36 + n * 22;
  return `<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="sky${seed}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0b0c16"/>
        <stop offset=".6" stop-color="#1c1f32"/>
        <stop offset="1" stop-color="#3a1d2a"/>
      </linearGradient>
      <radialGradient id="moon${seed}">
        <stop offset="0" stop-color="#f3e3b5" stop-opacity=".55"/>
        <stop offset="1" stop-color="#d9b879" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="lamp${seed}">
        <stop offset="0" stop-color="#ffd27a" stop-opacity=".85"/>
        <stop offset="1" stop-color="#ffd27a" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="320" height="180" fill="url(#sky${seed})"/>
    <circle cx="${moonX}" cy="46" r="62" fill="url(#moon${seed})"/>
    <circle cx="${moonX}" cy="46" r="21" fill="#e9d8ab"/>
    <g fill="#f5f0e9" opacity=".55">
      <circle cx="28" cy="26" r="1.2"/><circle cx="92" cy="18" r="1"/>
      <circle cx="150" cy="38" r="1.3"/><circle cx="280" cy="20" r="1"/>
    </g>
    <path d="M0 136 Q80 116 160 130 T320 124 V180 H0Z" fill="#14121c"/>
    <g fill="#08070d">
      <rect x="${houseX}" y="98" width="92" height="50"/>
      <polygon points="${houseX - 8},98 ${houseX + 46},68 ${houseX + 100},98"/>
      <rect x="${houseX + 60}" y="74" width="10" height="24"/>
    </g>
    <circle cx="${houseX + 26}" cy="124" r="28" fill="url(#lamp${seed})"/>
    <rect x="${houseX + 18}" y="113" width="16" height="22" fill="#ffc463" opacity=".9"/>
    <path d="M0 150 Q160 140 320 150 V180 H0Z" fill="#07060c" opacity=".92"/>
  </svg>`;
}

const listEl = document.getElementById("story-list");
if (listEl) {
  const countEl = document.getElementById("story-count");
  if (countEl) countEl.textContent = `${storyList.length} कहानी`;

  if (storyList.length === 0) {
    listEl.innerHTML = `<p class="empty">अभी कोई कहानी नहीं है। जल्द ही नई कहानियाँ आएँगी।</p>`;
  } else {
    listEl.innerHTML = storyList.map((story, i) => `
      <a class="story-card" href="story.html?id=${encodeURIComponent(story.id)}">
        <div class="cover">${coverSVG(i)}<small>${esc(story.category)}</small></div>
        <div class="card-body">
          <h3>${esc(story.title)}</h3>
          <p>${esc(story.hook)}</p>
          <span class="read">पढ़ें <b>→</b></span>
        </div>
      </a>`).join("");
  }
}

const detailEl = document.getElementById("story-detail");
if (detailEl) {
  const id = new URLSearchParams(location.search).get("id");
  const index = storyList.findIndex(item => item.id === id);
  const story = storyList[index];

  if (!story) {
    document.title = "कहानी नहीं मिली | कहानी घर की";
    detailEl.innerHTML = `
      <p class="eyebrow">404</p>
      <h1 class="story-title">यह कहानी नहीं मिली</h1>
      <p class="hook">लिंक शायद बदल गया है या कहानी हटा दी गई है।</p>
      <a class="back-link" href="index.html">← सभी कहानियाँ देखें</a>`;
  } else {
    document.title = `${story.title} | कहानी घर की`;

    const paragraphs = String(story.content || "")
      .trim()
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => `<p>${esc(p)}</p>`)
      .join("");

    const next = storyList.length > 1 ? storyList[(index + 1) % storyList.length] : null;

    detailEl.innerHTML = `
      <p class="eyebrow">${esc(story.category)} · ${esc(story.readTime)}</p>
      <h1 class="story-title">${esc(story.title)}</h1>
      <p class="hook">${esc(story.hook)}</p>
      <article class="story-text">${paragraphs}</article>
      <div class="story-end">— कहानी खत्म —</div>
      <section class="prompt-box">
        <h2>चित्र के लिए prompt</h2>
        <p>${esc(story.imagePrompt || "")}</p>
      </section>
      <nav class="story-nav">
        <a class="back-link" href="index.html">← सभी कहानियाँ</a>
        ${next ? `<a class="back-link" href="story.html?id=${encodeURIComponent(next.id)}">अगली कहानी →</a>` : ""}
      </nav>`;

    // पढ़ने की प्रगति वाली पट्टी
    const bar = document.getElementById("progress");
    if (bar) {
      const update = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = max > 0 ? `${Math.min(100, (window.scrollY / max) * 100)}%` : "0%";
      };
      window.addEventListener("scroll", update, { passive: true });
      update();
    }
  }
}
