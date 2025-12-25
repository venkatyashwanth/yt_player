"use client";

import { useEffect, useRef, useCallback } from "react";
import styles from "./Player.module.scss";
import { loadYouTubeAPI } from "@/utils/youtube";
import { loadPlaylist } from "@/utils/storage";

export default function Player({
  currentIndex,
  toggleSignal,
  onPlayingChange,
  onPrev,
  onNext,
  onEnded,
  isNextDisabled,
  isPrevDisabled,
}) {
  const playerRef = useRef(null);
  const playlistRef = useRef([]);
  const isPlayerReadyRef = useRef(false);
  const isPlayingRef = useRef(false);

  const handleStateChange = useCallback(
    (event) => {
      if (event.data === window.YT.PlayerState.PLAYING) {
        isPlayingRef.current = true;
        onPlayingChange(true);
      }

      if (event.data === window.YT.PlayerState.PAUSED) {
        isPlayingRef.current = false;
        onPlayingChange(false);
      }

      if (event.data === window.YT.PlayerState.ENDED) {
        isPlayingRef.current = false;
        onPlayingChange(false);
        onEnded?.(); // 🔥 auto-play next
      }
    },
    [onPlayingChange, onEnded]
  );

  // Create player once
  useEffect(() => {
    loadYouTubeAPI(() => {
      // playerRef.current = new window.YT.Player("player", {
      new window.YT.Player("player", {
        height: "100%",
        width: "100%",
        events: {
          onReady: (event) => {
            playerRef.current = event.target;
            isPlayerReadyRef.current = true;
            // play if index already exists
            if (currentIndex >= 0) {
              playlistRef.current = loadPlaylist();
              const video = playlistRef.current[currentIndex];
              if (
                video &&
                typeof playerRef.current.loadVideoById === "function"
              ) {
                playerRef.current.loadVideoById(video.id);
              }
            }
          },
          onStateChange: handleStateChange,
        },
      });
    });
  }, [handleStateChange]);

  // Play when index changes
  useEffect(() => {
    if (currentIndex < 0) return;
    if (!isPlayerReadyRef.current) return;

    playlistRef.current = loadPlaylist();
    const video = playlistRef.current[currentIndex];
    if (!video) return;

    if (typeof playerRef.current.loadVideoById !== "function") return;

    playerRef.current.loadVideoById(video.id);
  }, [currentIndex]);

  // Toggle play / pause
  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlayingRef.current) {
      playerRef.current.pauseVideo?.();
    }else{
      playerRef.current.playVideo?.();
    }
    
  }, [toggleSignal]);


  return (
    <div className={styles.videoArea}>
      <div className={styles.videoBox}>
        <div id="player" className={styles.player} />
      </div>

      <div className={styles.videoCtrls}>
        <div className={styles.currentTitle}>Now Playing..</div>
        <div className={styles.navBtns}>
          <button className="btn" onClick={onPrev} disabled={isPrevDisabled}>Prev</button>
          <button className="btn" onClick={onNext} disabled={isNextDisabled}>Next</button>
        </div>
      </div>
    </div>
  );
}
