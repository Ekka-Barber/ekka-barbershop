
export const downloadQRCode = () => {
  const canvas = document.createElement("canvas");
  const svg = document.querySelector(".qr-code svg") as SVGElement;
  if (!svg) {
    console.error("QR code SVG element not found");
    return;
  }
  
  const svgData = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "qr-code.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    }
  };
  
  img.src = "data:image/svg+xml;base64," + btoa(svgData);
};
