"use client";
import AsteroidVisualizer from "./components/dataBox";
import ThreeScene from "./components/ThreeScene";

export default function Home() {
  function handleButtonClick() {
    console.log("Button clicked!");
  }
  return (
    <main>
      <AsteroidVisualizer onCloseHandler={handleButtonClick} id="2000433" />
    </main>
  );
}
