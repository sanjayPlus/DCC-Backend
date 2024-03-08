"use client";

import MobileContainer from "@/components/MobileContainer";
import Navbar from "@/components/Navbar";
import React, { useEffect, useState } from "react";

function Home() {
  const [count, setCount] = useState<number>(0);
useEffect(() => {
  console.log("count", count)
},[count])
  return (
    <>
      <MobileContainer>
        <Navbar  count={count}/>
        count {count}
        <button onClick={() => setCount(count + 1)}>increment</button>
      </MobileContainer>
    </>
  );
}

export default Home;
