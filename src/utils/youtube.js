export function loadYouTubeAPI(callback) {
  if (window.YT && window.YT.Player) {
    callback();
    return;
  }
  const script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(script);
  // window.onYouTubeIframeAPIReady = callback;
  const previous = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    previous?.();
    callback();
  };
}

export function extractVideoId(urlOrId) {
  if (!urlOrId) return null;
  const s = urlOrId.trim();

  // Already a plain 11-char id?
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;

  // Patterns
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/v\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/
  ];

  for (const p of patterns) {
    const m = s.match(p);
    if (m && m[1]) return m[1];
  }
  return null;
}
