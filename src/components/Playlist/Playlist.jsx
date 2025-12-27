import { useEffect, useState } from "react";
import styles from "./Playlist.module.scss";
import { loadPlaylist } from "@/utils/storage";
import { extractVideoId } from "@/utils/youtube";
import PauseIcon from "./icons/PauseIcon";
import PlayIcon from "./icons/PlayIcon";
import CopyIcon from "./icons/CopyIcon";
import DeleteIcon from "./icons/DeleteIcon";
import { fetchVideoTitle } from "@/utils/fetchTitle";

export default function Playlist({
  currentIndex,
  isPlaying,
  onTogglePlay,
  onDelete
}) {
  const [list, setList] = useState([]);
  const [url, setUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setList(loadPlaylist());
  }, []);

  async function addVideo() {
    if (!url || isAdding) return;

    const id = extractVideoId(url);
    if (!id) return alert("Invalid URL");

    setIsAdding(true);

    const fallbackTitle = `Video ${list.length + 1}`;
    const title = await fetchVideoTitle(id);

    const updated = [...list, { id, title: title || fallbackTitle }];
    setList(updated);
    localStorage.setItem("yt_master", JSON.stringify(updated));

    // 🔥 auto-play newly added video
    onTogglePlay(updated.length - 1);

    setUrl("");
    setIsAdding(false);
  }

  function handleDelete(index) {
    if (!confirm("Delete this video?")) return;

    const updated = [...list];
    updated.splice(index, 1);

    setList(updated);
    localStorage.setItem("yt_master", JSON.stringify(updated));

    onDelete?.(index, updated.length);
  }

  function exportPlaylist() {
    const data = loadPlaylist();
    if (!data.length) {
      alert("Playlist is empty");
      return;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "yt-playlist.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importPlaylist(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);

        if (!Array.isArray(parsed)) {
          throw new Error("Invalid playlist format");
        }

        // Normalize structure
        const cleaned = parsed.map((item) => ({
          id: String(item.id),
          title: String(item.title || item.id),
        }));

        localStorage.setItem("yt_master", JSON.stringify(cleaned));
        setList(cleaned);

        alert("Playlist imported successfully");
      } catch {
        alert("Invalid JSON file");
      }
    };

    reader.readAsText(file);
  }

  function clearPlaylist() {
    if (!confirm("Clear entire playlist?")) return;

    localStorage.removeItem("yt_master");
    setList([]);
  }




  return (
    <div className={styles.playlistArea}>
      <div className={styles.countHold}>
        <strong>Playlist</strong>
        <small>{list.length} items</small>
      </div>

      <div className={styles.playlist}>
        {list.map((video, i) => (
          <div key={video.id} className={styles.playlistItem}>
            <div className={styles.num}>{i + 1}</div>
            <div className={styles.thumb}>
              <img
                src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                alt={video.title}
              />
            </div>
            <div className={styles.info}>
              <div className={styles.title}>{video.title}</div>
              <div className={styles.meta}>{video.id}</div>
            </div>

            <div className={styles.itemActions}>
              <button
                className={styles.iconBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlay(i);
                }}
              >
                {i === currentIndex && isPlaying ? (
                  <PauseIcon />
                ) : (
                  <PlayIcon />
                )}
              </button>

              <button
                className={styles.iconBtn}
                onClick={() => navigator.clipboard.writeText(video.id)}
              >
                <CopyIcon />
              </button>

              <button className={styles.iconBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(i);
                }}
              >
                <DeleteIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.inputRow}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste Youtube URL or ID"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addVideo();
            }
          }}
        />
        <button className="btn" onClick={addVideo} disabled={isAdding}>
          {isAdding ? "Adding..." : "Add"}
        </button>
      </div>
      <div className={styles.footerActions}>
        <button className="btn" onClick={exportPlaylist}>Export JSON</button>
        <button className="btn" onClick={() => document.getElementById("importfile").click()}>Import JSON</button>
        <input type="file" id="importfile" accept=".json" className={styles.fileInput}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              importPlaylist(e.target.files[0]);
              e.target.value = ""; // allow re-import same file
            }
          }}
        />
        <button className="btn" style={{ background: "#666" }} onClick={clearPlaylist}>Clear</button>
      </div>
    </div>
  );
}
