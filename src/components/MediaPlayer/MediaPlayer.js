import React, { useState, useRef, useEffect } from 'react';
import GifCanvas from './GifCanvas';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {
  PlayOutline,
  PlayOutlineFilled,
  PauseOutline,
  PauseOutlineFilled,
} from '@carbon/icons-react';
import {
  controls,
  dark,
  container,
  gifInDialog,
  gifDisplayed,
} from 'gatsby-theme-carbon/src/components/GifPlayer/GifPlayer.module.scss';

const Pause = ({ hovering }) =>
  hovering ? <PauseOutlineFilled size={24} /> : <PauseOutline size={24} />;

const Play = ({ hovering }) =>
  hovering ? <PlayOutlineFilled size={24} /> : <PlayOutline size={24} />;

const ToggleIcon = ({ paused, hovering }) =>
  paused ? <Play hovering={hovering} /> : <Pause hovering={hovering} />;

const MediaPlayer = ({ children, color, type, className, isInDialog }) => {
  const [paused, setPaused] = useState(false);
  const [mediaPath, setMediaPath] = useState(null);

  const containerRef = useRef();


  useEffect(() => {

    if (containerRef.current) {

      const video = containerRef.current.querySelector('video');
      const image = containerRef.current.querySelector('img');

      if (video && type === "video") {

        video.setAttribute('muted', "");

        if (!video.poster && image.src) {

          video.setAttribute('poster', image.src);
        }
      }

      if (image && type === "gif") {

        setMediaPath(image.src);
      }
    }
  }, [type]);

  const [hovering, setHovering] = useState(false);
  const onClick = (e) => {
    e.stopPropagation();
    setPaused(!paused);
  };

  const controlsClassNames = classnames({
    [controls]: true,
    [dark]: color === 'dark',
  });

  const containerClassNames = classnames({
    [container]: true,
    [className]: className,
    [gifInDialog]: isInDialog,
  });

  const gifClassNames = classnames({
    [gifDisplayed]: true
  });

  const childrenArray = React.Children.toArray(children);

  const labelText = paused
    ? 'Toggleable animation paused'
    : 'Toggleable animation playing';

  return (
    <div ref={containerRef} className={containerClassNames}>
      <div className={gifClassNames}>
        {
          type === "gif" && mediaPath &&
          <GifCanvas 
            path={mediaPath}
            paused={paused}
          />
        }
        {childrenArray[0]}
      </div>
      <button
        aria-pressed={paused ? 'true' : 'false'}
        type="button"
        aria-label={labelText}
        className={controlsClassNames}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={onClick}
        onKeyDown={(e) => {
          // Stop keyDown event from propogating to ImageGalleryImage component.
          e.stopPropagation();
        }}>
        <ToggleIcon hovering={hovering} paused={paused} />
      </button>
    </div>
  );
};

MediaPlayer.propTypes = {
  /**
   * Specify if icon color should be "dark" or "light"
   */
  color: PropTypes.string,
    /**
   * Specify type, should be "gif" or "video"
   */
  type: PropTypes.string,
  /**
   * Specify optional className
   */
  className: PropTypes.string,
  /**
   * Only pass in the 2 images to be rendered, first must be gif, second must be static image
   */
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
  /**
   * Specify if the gifPlayer is inside the expanded ImageGallery (see ImageGallery.js)
   */
  isInDialog: PropTypes.bool,
};

MediaPlayer.defaultProps = {
  color: 'light',
  isInDialog: false,
  type: 'gif',
};

export default MediaPlayer;
