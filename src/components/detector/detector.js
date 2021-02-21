import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  Container,
  Paper,
  InputBase,
  Divider,
  Button,
  Card,
  CardHeader,
  CardContent,
  CircularProgress
} from '@material-ui/core';
import ImageSearch from '@material-ui/icons/ImageSearch';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

const canvasW = 900;
const canvasH = 500;
const useStyles = makeStyles((theme) => ({
  canvasContainer: {
    margin: '30px 0px'
  },
  canvasWrapper: {
    width: canvasW,
    height: canvasH,
    margin: '0 auto'
  },
  canvas: {
  },
  controlBarContainer: {},
  controlBar: {
    margin: '0 auto',
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 800,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
}));

const Detector = (props) => {

  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(null);
  const [imgPath, setImagePath] = useState('');

  const fitToContainer = (canvas) => {
    // Make it visually fill the positioned parent
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    // ...then set the internal size to match
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  const urlHandler = (event) => {
    setImagePath(event.target.value);
  }

  const runDetection = async () => {
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
    return new Promise((resolve, reject) => {
      try {
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
          resolve(true)
        }
      } catch (error) {
        reject(error)
      }  
    });
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

  const detectHandler = async () => {
    await loadImageOnCanvas();
    runDetection();
  }

  useEffect(() => {
    setLoading(true);
    const canvas = document.getElementById('viewport');
    fitToContainer(canvas);

    console.log('Model loading...');
    cocoSsd.load().then(model => {
      setModel(model);
      console.log('Model loaded');
    });
    setLoading(false);
  }, [])

  return (
    <div>
      {
        loading ?
          <Container>
            <CircularProgress />
          </Container> :

          <Container>

            <div className={classes.canvasContainer}>
              <Card variant="outlined">
                <CardHeader title="AI - Detector de Objetos" subheader="TensorflowJS" />
                <CardContent>
                  <div className={classes.canvasWrapper}>
                    <canvas id="viewport" className={classes.canvas} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className={classes.controlBarContainer}>
              <Paper className={classes.controlBar}>
                <InputBase
                  className={classes.input}
                  placeholder="URL de la imagen"
                  inputProps={{ 'aria-label': 'image url' }}
                  onChange={urlHandler}
                />
                <Divider className={classes.divider} orientation="vertical" />
                <Button 
                  className={classes.iconButton} 
                  size="large" 
                  startIcon={<ImageSearch />} 
                  color="primary"
                  onClick={detectHandler}>Analizar
                </Button>
              </Paper>
            </div>

          </Container>
      }
    </div>
  )
};

export default Detector;
