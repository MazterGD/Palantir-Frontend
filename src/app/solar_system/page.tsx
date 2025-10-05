"use client";
import { useState } from "react";
import ThreeScene from "../components/ThreeScene";
import LoadingScreen from "../components/ui/loadingScreen";

export default function Home() {
  const [isLoading,setIsLoading] = useState<boolean>(true);
  function handleLoading(){
    setIsLoading(false)
  }
  return (
    <div>
      {isLoading? <LoadingScreen/>: <ThreeScene loadingHandler={handleLoading}/>}
    </div>
  );
}
