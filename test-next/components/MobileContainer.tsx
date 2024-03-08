import React from "react";
import Navbar from "./Navbar";

function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="h-full w-full flex justify-center items-center">
        <div className="h-screen md:w-[30%] bg-slate-600 w-full">
        
          {children}
        </div>
      </div>
    </>
  );
}

export default MobileContainer;
