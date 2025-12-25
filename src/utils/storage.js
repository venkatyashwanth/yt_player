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
