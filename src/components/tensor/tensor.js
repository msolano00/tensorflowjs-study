import React, { useState, useEffect } from 'react';
import MagicDropzone from 'react-magic-dropzone';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import './tensor.css';

const Tensor = (props) => {

  const [model, setModel] = useState(null);
  const [preview, setPreview] = useState('');
  // const [predictions, setPredictions] = useState([]);

  const onDrop = (accepted, rejected, links) => {
    setPreview(accepted[0].preview || links[0]);
  };

  const cropToCanvas = (image, canvas, ctx) => {
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (naturalWidth > naturalHeight) {
      ctx.drawImage(
        image,
        (naturalWidth - naturalHeight) / 2,
        0,
        naturalHeight,
        naturalHeight,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
    } else {
      ctx.drawImage(
        image,
        0,
        (naturalHeight - naturalWidth) / 2,
        naturalWidth,
        naturalWidth,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
    }
  };

  const onImageChange = (e) => {
    const c = document.getElementById('canvas');
    const ctx = c.getContext('2d');
    cropToCanvas(e.target, c, ctx);
    model.detect(c).then(predictions => {
      // Font options.
      const font = '16px sans-serif';
      ctx.font = font;
      ctx.textBaseline = 'top';

      predictions.forEach(prediction => {
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
      });

      predictions.forEach(prediction => {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        // Draw the text last to ensure it's on top.
        ctx.fillStyle = "#000000";
        ctx.fillText(prediction.class, x, y);
      });
    });
  };

  useEffect(() => {
    cocoSsd.load().then(model => {
      setModel(model);
    });
  }, [])

  return (
    <div className="Dropzone-page">
      {model ? (
        <MagicDropzone
          className="Dropzone"
          accept="image/jpeg, image/png, .jpg, .jpeg, .png"
          multiple={false}
          onDrop={onDrop}
        >
          {preview ? (
            <img
              alt="upload preview"
              onLoad={onImageChange}
              className="Dropzone-img"
              src={preview}
            />
          ) : (
              "Choose or drop a file."
            )}
          <canvas id="canvas" />
        </MagicDropzone>
      ) : (
          <div className="Dropzone">Loading model...</div>
        )}
    </div>
  )
};

export default Tensor;
