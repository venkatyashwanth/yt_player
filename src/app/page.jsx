"use client";

import Header from "@/components/Header";
import Player from "@/components/Player";
import Playlist from "@/components/Playlist";
import { loadPlaylist, loadIndex, saveIndex } from "@/utils/storage";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(() => loadIndex());
  const [isPlaying, setIsPlaying] = useState(false);
  const [toggleSignal, setToggleSignal] = useState(0);
  const [playlistLength, setPlaylistLength] = useState(0);

  useEffect(() => {
    setPlaylistLength(loadPlaylist().length);
  }, []);

  const isNextDisabled = playlistLength === 0 || currentIndex >= playlistLength - 1;
  const isPrevDisabled = playlistLength === 0 || currentIndex <= 0;

  useEffect(() => {
    if (currentIndex >= 0) {
      saveIndex(currentIndex);
    }
  }, [currentIndex]);

  const handleTogglePlay = useCallback      ((index) => {
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

  // Keyboard-Shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return
      }
      console.log(e.code);
      switch (e.code) {
        case "Space":
          e.preventDefault(); // prevent page scroll
          setToggleSignal((n) => n + 1);
          break;
        case "ArrowRight":
          handleNext();
          break;

        case "ArrowLeft":
          handlePrev();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev])

  return (
    <>
      <Header />
      <div className="container player-wrap">
        <Player
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
        />
      </div>
    </>
  );
}
