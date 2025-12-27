export function loadPlaylist(){
    if(typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("yt_master") || "[]");
}

export function loadIndex() {
  if (typeof window === "undefined") return -1;
  return Number(localStorage.getItem("yt_current_index") || -1);
}

export function saveIndex(i) {
  localStorage.setItem("yt_current_index", String(i));
}

export function loadVolume() {
  if (typeof window === "undefined") return null;
  const v = Number(localStorage.getItem("yt_volume"));
  return Number.isFinite(v) ? v : null;
}

export function saveVolume(v) {
  localStorage.setItem("yt_volume", String(v));
}