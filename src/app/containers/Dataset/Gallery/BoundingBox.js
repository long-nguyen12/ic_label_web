import React, { useRef, useEffect, useState } from "react";

const ImageWithBoundingBoxes = ({ src, boxes }) => {
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  const handleLoad = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const origWidth = img.naturalWidth;
    const origHeight = img.naturalHeight;
    const smallWidth = img.clientWidth;
    const smallHeight = img.clientHeight;

    setDims({ width: smallWidth, height: smallHeight });

    // Scale factors
    const scaleX = smallWidth / origWidth;
    const scaleY = smallHeight / origHeight;

    canvas.width = smallWidth;
    canvas.height = smallHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all boxes
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.font = "16px Arial";
    ctx.fillStyle = "red";

    boxes.forEach((box) => {
      const [x, y, w, h] = box.box;
      const newX = x * scaleX;
      const newY = y * scaleY;
      const newW = w * scaleX;
      const newH = h * scaleY;

      ctx.strokeStyle = box.labelColor;
      ctx.strokeRect(newX, newY, newW, newH);
      ctx.fillText(box.labelName, newX + 4, newY - 6); // text slightly above top-left
    });
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <img ref={imgRef} src={src} alt="Annotated" style={{ width: "100%", display: "block" }} onLoad={handleLoad} />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
        width={dims.width}
        height={dims.height}
      />
    </div>
  );
};

export default ImageWithBoundingBoxes;
