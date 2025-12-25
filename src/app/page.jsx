"use client";

import Header from "@/components/Header";
import Player from "@/components/Player";
import Playlist from "@/components/Playlist";
import { loadPlaylist } from "@/utils/storage";
import { useEffect, useState } from "react";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [toggleSignal, setToggleSignal] = useState(0);
  const playlistLength = loadPlaylist().length;
  const isNextDisabled = currentIndex >= playlistLength - 1 || playlistLength === 0;
  const isPrevDisabled = currentIndex <= 0;


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
