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
                  // console.log(isPlaying)
                }}
              >
                {/* {i === currentIndex && isPlaying ? (
                  <PauseIcon />
                ) : (
                  <PlayIcon />
                )} */}
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

              <button className={styles.iconBtn}>
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
        />
        <button className="btn" onClick={addVideo} disabled={isAdding}>
          {isAdding ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
}
