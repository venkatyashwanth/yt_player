"use client";

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useState } from "react";
import styles from "./Player.module.scss";
import { loadYouTubeAPI } from "@/utils/youtube";
import { loadPlaylist, loadVolume, saveVolume, loadVideoTime, saveVideoTime } from "@/utils/storage";

const Player = forwardRef(function Player({
  currentIndex,
  currentTitle,
  toggleSignal,
  onPlayingChange,
  onPrev,
  onNext,
  onEnded,
  isNextDisabled,
  isPrevDisabled,
}, ref) {
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef(null);
  const playlistRef = useRef([]);
  const isPlayerReadyRef = useRef(false);
  const isPlayingRef = useRef(false);
  const videoBoxRef = useRef(null);
  const pendingSeekRef = useRef(null);

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

      if (playerRef.current.isMuted()) {
        playerRef.current.unMute();

        const v = loadVolume();
        if (typeof v === "number") {
          playerRef.current.setVolume(v);
        }
      } else {
        saveVolume(playerRef.current.getVolume());
        playerRef.current.mute();
      }
    },

    changeVolume(delta) {
      if (!playerRef.current) return;

      const current = playerRef.current.getVolume?.();
      if (typeof current !== "number") return;

      const next = Math.min(100, Math.max(0, current + delta));
      playerRef.current.setVolume(next);
      saveVolume(next);
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

    stop() {
      if (!playerRef.current) return;
      playerRef.current.stopVideo?.();
    }
  }));


  const handleStateChange = useCallback(
    (event) => {
      if (
        event.data === window.YT.PlayerState.CUED ||
        event.data === window.YT.PlayerState.PLAYING
      ) {
        if (pendingSeekRef.current != null) {
          playerRef.current.seekTo(pendingSeekRef.current, true);
          pendingSeekRef.current = null;
        }
      }

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
        onEnded?.();
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
            setPlayerReady(true);

            const savedVolume = loadVolume();
            if (typeof savedVolume === "number") {
              playerRef.current.setVolume(savedVolume);
            }
          },
          onStateChange: handleStateChange,
        },
      });
    });
  }, [handleStateChange]);

  // Play when index changes
  useEffect(() => {
    if (!isPlayerReadyRef.current) return;
    if (currentIndex < 0) return;
    playlistRef.current = loadPlaylist();
    const video = playlistRef.current[currentIndex];
    if (!video) return;
    if (typeof playerRef.current.loadVideoById !== "function") return;
    // playerRef.current.loadVideoById(video.id);
    // const savedTime = loadVideoTime(video.id);
    // if (savedTime > 0) {
    //   playerRef.current.seekTo(savedTime, true);
    // }
    const savedTime = loadVideoTime(video.id);
    pendingSeekRef.current = savedTime > 0 ? savedTime : null;
    playerRef.current.loadVideoById({
      videoId: video.id,
      startSeconds: savedTime,
    });
  }, [playerReady, currentIndex]);

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
      el.style.transform = "scale(1.15)";
      requestAnimationFrame(() => {
        el.style.transform = "scale(1)";
      });
    }

    window.addEventListener("yt-volume-change", onVolumeChange);
    return () => window.removeEventListener("yt-volume-change", onVolumeChange);
  }, []);

  useEffect(() => {
    if (!playerRef.current) return;

    const interval = setInterval(() => {
      if (!isPlayingRef.current) return;

      const time = playerRef.current.getCurrentTime?.();
      const list = loadPlaylist();
      const video = list[currentIndex];

      if (video && typeof time === "number") {
        saveVideoTime(video.id, time);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex]);


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
        <div className={styles.currentTitle}>
          {currentTitle ? `Now Playing: ${currentTitle}` : "No video selected"}
        </div>
        <div className={styles.navBtns}>
          <button className="btn" onClick={onPrev} disabled={isPrevDisabled}>Prev</button>
          <button className="btn" onClick={onNext} disabled={isNextDisabled}>Next</button>
        </div>
      </div>
    </div>
  );
})

export default Player;