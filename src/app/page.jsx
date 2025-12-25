"use client";

import Header from "@/components/Header";
import Player from "@/components/Player";
import Playlist from "@/components/Playlist";
import { loadPlaylist, loadIndex, saveIndex } from "@/utils/storage";
import { useEffect, useState } from "react";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(() => loadIndex());
  const [isPlaying, setIsPlaying] = useState(false);
  const [toggleSignal, setToggleSignal] = useState(0);
  const [playlistLength, setPlaylistLength] = useState(0);

  useEffect(() => {
    setPlaylistLength(loadPlaylist().length);
  }, []);

  // const playlistLength = loadPlaylist().length;
  const isNextDisabled = playlistLength === 0 || currentIndex >= playlistLength - 1;
  const isPrevDisabled = playlistLength === 0 || currentIndex <= 0;

  useEffect(() => {
    if (currentIndex >= 0) {
      saveIndex(currentIndex);
    }
  }, [currentIndex]);

  function handleTogglePlay(index) {
    console.log(index);
    if (index === currentIndex) {
      setToggleSignal((n) => n + 1);
    } else {
      setCurrentIndex(index);
    }
  }

  function handlePrev() {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }

  function handleNext() {
    setCurrentIndex((i) => {
      const list = loadPlaylist();
      return i < list.length - 1 ? i + 1 : i;
    });
  }

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
