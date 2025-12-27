"use client";

import Header from "@/components/Header";
import Player from "@/components/Player";
import Playlist from "@/components/Playlist";
import { loadPlaylist, loadIndex, saveIndex } from "@/utils/storage";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(() => loadIndex());
  const [isPlaying, setIsPlaying] = useState(false);
  const [toggleSignal, setToggleSignal] = useState(0);
  const [volumeToast, setVolumeToast] = useState(null);
  const playerControlsRef = useRef(null);
  const playlistLength = loadPlaylist().length;
  const isNextDisabled = playlistLength === 0 || currentIndex >= playlistLength - 1;
  const isPrevDisabled = playlistLength === 0 || currentIndex <= 0;

  useEffect(() => {
    if (currentIndex >= 0) {
      saveIndex(currentIndex);
    }
  }, [currentIndex]);

  const handleTogglePlay = useCallback((index) => {
    if (index === currentIndex) {
      setToggleSignal((n) => n + 1);
    } else {
      setCurrentIndex(index);
    }
  }, [currentIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => {
      const list = loadPlaylist();
      return i < list.length - 1 ? i + 1 : i;
    });
  }, []);

  const handleDelete = useCallback((deletedIndex, newLength) => {
    setCurrentIndex((curr) => {
      // nothing playing
      if (curr < 0) return curr;

      // deleted before current → shift left
      if (deletedIndex < curr) {
        return curr - 1;
      }

      // deleted currently playing
      if (deletedIndex === curr) {
        if (newLength === 0) return -1;          // playlist empty
        if (curr < newLength) return curr;       // play next
        return newLength - 1;                     // play previous
      }

      return curr;
    });
  }, []);


  // Keyboard-Shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return
      }
      const controls = playerControlsRef.current;
      switch (e.code) {
        case "Space":
          e.preventDefault(); // prevent page scroll
          setToggleSignal((n) => n + 1);
          break;
        case "ArrowRight":
          if (e.shiftKey) {
            controls?.seekBy(10);
          } else {
            handleNext();
          }
          break;

        case "ArrowLeft":
          if (e.shiftKey) {
            controls?.seekBy(-10);
          } else {
            handlePrev();
          }
          break;
        case "ArrowUp": {
          e.preventDefault(); // avoid page scroll
          const v = controls?.changeVolume(5);
          if (typeof v === "number") setVolumeToast(v);
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          const v = controls?.changeVolume(-5);
          if (typeof v === "number") setVolumeToast(v);
          break;
        }
        case "KeyM":
          console.log("sdf")
          console.log(controls);
          controls?.toggleMute();
          break;

        case "KeyF":
          controls?.enterFullscreen();
          break;

        case "Escape":
          controls?.exitFullscreen();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev])

  // Volume Toast
  useEffect(() => {
    if (volumeToast == null) return;
    const t = setTimeout(() => setVolumeToast(null), 1000);
    return () => clearTimeout(t);
  }, [volumeToast])

  // Listen for wheel volume events
  useEffect(() => {
    function onVolumeChange(e) {
      setVolumeToast(e.detail);
    }

    window.addEventListener("yt-volume-change", onVolumeChange);
    return () =>
      window.removeEventListener("yt-volume-change", onVolumeChange);
  }, []);
  return (
    <>
      <Header />
      <div className="container player-wrap">
        <Player
          ref={playerControlsRef}
          currentIndex={currentIndex}
          toggleSignal={toggleSignal}
          onPlayingChange={setIsPlaying}
          onPrev={handlePrev}
          onNext={handleNext}
          onEnded={handleNext}
          isNextDisabled={isNextDisabled}
          isPrevDisabled={isPrevDisabled}
        />
        <Playlist
          currentIndex={currentIndex}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onDelete={handleDelete}
        />
      </div>
      {volumeToast !== null && (
        <div className="volume-toast">
          Volume: {volumeToast}%
        </div>
      )}
    </>
  );
}
