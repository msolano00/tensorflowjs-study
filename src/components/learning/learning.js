import React, { useState, useEffect } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
// import drawImageProp from '../../utils/imageResizer';
import './learning.css';

const Learning = () => {

  const [model, setModel] = useState(null);
  const imgPath = 'https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F20%2F2020%2F09%2F08%2FPeopleShow_KeyArt_STIRR_Hero_v01.jpg';
  const canvasW = 900;
  const canvasH = 500;

  const onDetectHandler = async () => {
    try {
      const canvas = document.getElementById('viewport');
      const context = canvas.getContext('2d');
      const font = '16px sans-serif';
      context.font = font;
      context.textBaseline = 'top';
      const predictions = await model.detect(canvas);
      predictions.forEach(prediction => labelGenerator(prediction, context, font))
      console.log({ predictions })
    } catch (error) {
      console.error(error);
    }
  };

  const loadImageOnCanvas = () => {
    const canvas = document.getElementById('viewport');
    const context = canvas.getContext('2d');
    const imgObj = new Image();
    imgObj.src = imgPath;
    const x0 = 0;
    const y0 = 0;
    imgObj.crossOrigin = 'anonymous';
    imgObj.onload = (img) => {
      const imgW = img.path[0].width;
      const imgH = img.path[0].height;
      context.drawImage(imgObj, x0, y0, imgW, imgH, x0, y0, canvasW, canvasH);
    }
  };

  const labelGenerator = (prediction, ctx, font) => {
    const x = prediction.bbox[0];
    const y = prediction.bbox[1];
    const width = prediction.bbox[2];
    const height = prediction.bbox[3];
    // Draw the bounding box.
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, width, height);
    // Draw the label background.
    ctx.fillStyle = '#00FFFF';
    const textWidth = ctx.measureText(prediction.class).width;
    const textHeight = parseInt(font, 10); // base 10
    ctx.fillRect(x, y, textWidth + 4, textHeight + 4);

    ctx.fillStyle = "#000000";
    ctx.fillText(prediction.class, x, y);
  }

  useEffect(() => {
    cocoSsd.load().then(model => {
      setModel(model);
      console.log('Model loaded');
    });
    loadImageOnCanvas();
  }, [])

  return (
    <div>
      <h1>AI Analizer</h1>
      <canvas
        id="viewport"
        className="imageCanvas"
        width={canvasW}
        height={canvasH}
      />
      {/* <img 
        crossOrigin="anonymous"
        id="analizedImage"
        className="image" 
        alt="to be analized" 
        src={imgPath} 
      /> */}
      <br />
      <button className="" onClick={onDetectHandler}>Detect</button>
    </div>
  )
};

export default Learning;
