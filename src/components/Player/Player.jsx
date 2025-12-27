"use client";

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import styles from "./Player.module.scss";
import { loadYouTubeAPI } from "@/utils/youtube";
import { loadPlaylist } from "@/utils/storage";

const Player = forwardRef(function Player({
  currentIndex,
  toggleSignal,
  onPlayingChange,
  onPrev,
  onNext,
  onEnded,
  isNextDisabled,
  isPrevDisabled,
}, ref) {
  const playerRef = useRef(null);
  const playlistRef = useRef([]);
  const isPlayerReadyRef = useRef(false);
  const isPlayingRef = useRef(false);
  const videoBoxRef = useRef(null);

  useImperativeHandle(ref, () => ({
    seekBy(seconds) {
      if (!playerRef.current) return;
      const t = playerRef.current.getCurrentTime?.();
      if (typeof t === "number") {
        playerRef.current.seekTo(t + seconds, true);
      }
    },

    toggleMute() {
      if (!playerRef.current) return;
      playerRef.current.isMuted()
        ? playerRef.current.unMute()
        : playerRef.current.mute();
    },

    changeVolume(delta) {
      if (!playerRef.current) return;

      const current = playerRef.current.getVolume?.();
      if (typeof current !== "number") return;

      const next = Math.min(100, Math.max(0, current + delta));
      playerRef.current.setVolume(next);
      return next;
    },

    enterFullscreen() {
      const iframe = document.getElementById("player");
      iframe?.requestFullscreen?.();
    },

    exitFullscreen() {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    },
  }));


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
    } else {
      playerRef.current.playVideo?.();
    }

  }, [toggleSignal]);

  // MouseWheel VolumeControl
  useEffect(() => {
    const el = videoBoxRef.current;
    if (!el) return;

    let hideTimer;
    function onWheel(e) {
      clearTimeout(hideTimer);
      e.preventDefault();

      if (!playerRef.current) return;

      const delta = e.deltaY < 0 ? 5 : -5;
      const current = playerRef.current.getVolume?.();
      if (typeof current !== "number") return;

      const next = Math.min(100, Math.max(0, current + delta));
      playerRef.current.setVolume(next);
      window.dispatchEvent(
        new CustomEvent("yt-volume-change", { detail: next })
      );
    }

    el.addEventListener("wheel", onWheel, { passive: false, capture: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  useEffect(() => {
    function onVolumeChange(e) {
      const el = document.querySelector(`.${styles.volumeValue}`);
      if (!el) return;

      el.textContent = `${e.detail}%`;

      // subtle pop animation
      el.style.transform = "scale(1.15)";
      requestAnimationFrame(() => {
        el.style.transform = "scale(1)";
      });
    }

    window.addEventListener("yt-volume-change", onVolumeChange);
    return () => window.removeEventListener("yt-volume-change", onVolumeChange);
  }, []);


  return (
    <div className={styles.videoArea}>
      <div className={styles.videoBox} ref={videoBoxRef}>
        <div className={styles.wheelOverlay}>
          <span className={styles.volumeHint}>🔊 Volume control</span>
          <span className={styles.volumeValue}></span>
        </div>
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
})

export default Player;