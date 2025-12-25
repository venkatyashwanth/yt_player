export function loadPlaylist(){
    if(typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("yt_master") || "[]");
}