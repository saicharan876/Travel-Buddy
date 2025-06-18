import React from "react";
import Lottie from "lottie-react";
import globeAnimation from "./globe.json";

const AnimatedGlobe = ({ size = 200 }) => (
  <div style={{ width: size, height: size, margin: "0 auto" }}>
    <Lottie animationData={globeAnimation} loop={true} />
  </div>
);

export default AnimatedGlobe;
