import React, { useRef, useEffect, useCallback } from 'react';
import { parseGIF, decompressFrames } from 'gifuct-js';
import * as axios from 'axios';


const GifCanvas = ({ path, paused }) => {

  const canvasRef = useRef(null);
  const canvasDataRef = useRef(null);
  const loadedFramesRef = useRef(null);
  const frameIndexRef = useRef(0);
  const frameImageDataRef = useRef(null);
  const needsDisposalRef = useRef(false);
  const canvasTempRef = useRef(null);
  const canvasTempCtxRef = useRef(null);
  const renderTimeoutRef = useRef(null);
  const renderRAFRef = useRef(null);
  const pausedRef = useRef(paused);
  const keepIndexRef = useRef(false);

  const gifRender = useCallback((frames) => {

    if (canvasRef.current) {
     
      loadedFramesRef.current = frames;

      const context = canvasRef.current.getContext('2d');
      canvasTempRef.current = document.createElement('canvas');
      canvasTempCtxRef.current = canvasTempRef.current.getContext('2d');

      canvasRef.current.width = frames[0].dims.width;
      canvasRef.current.height = frames[0].dims.height;

      return {
        context,
        width: canvasRef.current.width,
        height: canvasRef.current.height
      };
    }

    return false;
  }, []);

  const canvasRenderFrames = useCallback(() => {

    const { context, width, height } = canvasDataRef.current;
    const frame = loadedFramesRef.current[frameIndexRef.current];
    const start = new Date().getTime();
    const dims = frame.dims;

    if (needsDisposalRef.current) {
  
      context.clearRect(0, 0, width, height)
      needsDisposalRef.current = false
    }

    if (!frameImageDataRef.current || dims.width != frameImageDataRef.current.width || dims.height != frameImageDataRef.current.height) {
  
      canvasTempRef.current.width = dims.width;
      canvasTempRef.current.height = dims.height;

      frameImageDataRef.current = canvasTempCtxRef.current.createImageData(dims.width, dims.height);
    }

  
    frameImageDataRef.current.data.set(frame.patch);
    canvasTempCtxRef.current.putImageData(frameImageDataRef.current, 0, 0);

    context.drawImage(canvasTempRef.current, dims.left, dims.top);

    frameIndexRef.current = frameIndexRef.current + (keepIndexRef.current ? 0 : 1);
    console.log(frameIndexRef.current, keepIndexRef.current)
    keepIndexRef.current = false;
    
      if (frameIndexRef.current >= loadedFramesRef.current.length) {
  
        frameIndexRef.current = 0;
      }
  
      if (frame.disposalType === 2) {
  
        needsDisposalRef.current = true;
      }

      const end = new Date().getTime()
      const diff = end - start;

      if (pausedRef.current === false) {

        renderTimeoutRef.current = setTimeout(function() {
    
          renderRAFRef.current = requestAnimationFrame(canvasRenderFrames);

        }, Math.max(0, Math.floor(frame.delay - diff)));
      }

  }, []);

  useEffect(() => {

    axios.get(path, {
      responseType: "arraybuffer"
    })
    .then((response) => {

      if (response.status === 200 && response.data) {

        const gifData = parseGIF(response.data);
        const gifFrames = decompressFrames(gifData, true);

        const canvasData = gifRender(gifFrames, canvasRef.current);
        canvasDataRef.current = canvasData;
        canvasData && canvasRenderFrames();
      }
    })
    .catch((err) => {

      console.error(err);
    });

  }, [path, gifRender, canvasRenderFrames]);

  useEffect(() => {

    pausedRef.current = paused;

    if (canvasDataRef.current) {
      if (paused) {

        clearTimeout(renderTimeoutRef.current);
        cancelAnimationFrame(renderRAFRef.current);

      } else {

        keepIndexRef.current = true;
        canvasRenderFrames();
      }
    }

  }, [paused, canvasRenderFrames]);

  return (
    <canvas ref={canvasRef} aria-hidden="true" />
  );
};

export default GifCanvas;
