const PinchZoom = {
  MIN_SCALE: 1, // 1=scaling when first loaded
  MAX_SCALE: 64,

  // HammerJS fires "pinch" and "pan" events that are cumulative in nature and not
  // deltas. Therefore, we need to store the "last" values of scale, x and y so that we can
  // adjust the UI accordingly. It isn't until the "pinchend" and "panend" events are received
  // that we can set the "last" values.

  // Our "raw" coordinates are not scaled. This allows us to only have to modify our stored
  // coordinates when the UI is updated. It also simplifies our calculations as these
  // coordinates are without respect to the current scale.

  IMG_WIDTH: null,
  IMG_HEIGHT: null,
  VIEWPORT_WIDTH: null,
  VIEWPORT_HEIGHT: null,
  SCALE: null,
  SCALE_LAST: null,
  CONTAINER: null,
  CONTAINER_ID: null,
  ELEMENT: null,
  ELEMENT_ID: null,
  X: 0,
  LAST_X: 0,
  Y: 0,
  LAST_Y: 0,
  PINCH_CENTER: null,
  CUR_WIDTH: 0,
  CUR_HEIGHT: 0,
  PINCH_CENTER_OFFSET: 0,

  // We need to disable the following event handlers so that the browser doesn't try to
  // automatically handle our image drag gestures.
  disableImgEventHandlers: function () {
    const events = ['onclick', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover',
                  'onmouseup', 'ondblclick', 'onfocus', 'onblur'];

    events.forEach(function (event) {
      PinchZoom.ELEMENT[event] = function () {
        return false;
      };
    });
  },

  // Traverse the DOM to calculate the absolute position of an element
  absolutePosition: function (el) {
    let x = 0, y = 0;

    while (el !== null) {
      x += el.offsetLeft;
      y += el.offsetTop;
      el = el.offsetParent;
    }

    return { x: x, y: y };
  },

  restrictScale: function (scale) {
    if (scale < PinchZoom.MIN_SCALE) {
      scale = PinchZoom.MIN_SCALE;
    } else if (scale > PinchZoom.MAX_SCALE) {
      scale = PinchZoom.MAX_SCALE;
    }
    return scale;
  },

  restrictRawPos: function (pos, viewportDim, imgDim) {
    if (pos < viewportDim / PinchZoom.SCALE - imgDim) { // too far left/up?
      pos = viewportDim / PinchZoom.SCALE - imgDim;
    } else if (pos > 0) { // too far right/down?
      pos = 0;
    }
    return pos;
  },

  updateLastPos: function (deltaX, deltaY) {
    PinchZoom.LAST_X = PinchZoom.X;
    PinchZoom.LAST_Y = PinchZoom.Y;
  },

  translate: function (deltaX, deltaY) {
    // We restrict to the min of the viewport width/height or current width/height as the
    // current width/height may be smaller than the viewport width/height

    const newX = PinchZoom.restrictRawPos(PinchZoom.LAST_X + deltaX / PinchZoom.SCALE, Math.min(PinchZoom.VIEWPORT_WIDTH, PinchZoom.CUR_WIDTH), PinchZoom.IMG_WIDTH);
    PinchZoom.X = newX;
    document.getElementById(PinchZoom.ELEMENT_ID).style.marginLeft = Math.ceil(newX * PinchZoom.SCALE) + 'px';

    const newY = PinchZoom.restrictRawPos(PinchZoom.LAST_Y + deltaY / PinchZoom.SCALE, Math.min(PinchZoom.VIEWPORT_HEIGHT, PinchZoom.CUR_HEIGHT), PinchZoom.IMG_HEIGHT);
    PinchZoom.Y = newY;
    document.getElementById(PinchZoom.ELEMENT_ID).style.marginTop = Math.ceil(newY * PinchZoom.SCALE) + 'px';
  },

  zoom: function (scaleBy) {
    PinchZoom.SCALE = PinchZoom.restrictScale(PinchZoom.SCALE_LAST * scaleBy);

    PinchZoom.CUR_WIDTH = PinchZoom.IMG_WIDTH * PinchZoom.SCALE;
    PinchZoom.CUR_HEIGHT = PinchZoom.IMG_HEIGHT * PinchZoom.SCALE;

    document.getElementById(PinchZoom.ELEMENT_ID).style.width = Math.ceil(PinchZoom.CUR_WIDTH) + 'px';
    document.getElementById(PinchZoom.ELEMENT_ID).style.height = Math.ceil(PinchZoom.CUR_HEIGHT) + 'px';

    // Adjust margins to make sure that we aren't out of bounds
    PinchZoom.translate(0, 0);
  },

  rawCenter: function (e) {
    const pos = PinchZoom.absolutePosition(container);

    // We need to account for the scroll position
    const scrollLeft = window.pageXOffset ? window.pageXOffset : document.body.scrollLeft;
    const scrollTop = window.pageYOffset ? window.pageYOffset : document.body.scrollTop;

    const zoomX = -PinchZoom.X + (e.center.x - pos.x + scrollLeft) / PinchZoom.SCALE;
    const zoomY = -PinchZoom.Y + (e.center.y - pos.y + scrollTop) / PinchZoom.SCALE;

    return { x: zoomX, y: zoomY };
  },

  updateLastScale: function () {
    PinchZoom.SCALE_LAST = PinchZoom.SCALE;
  },

  zoomAround: function (scaleBy, rawZoomX, rawZoomY, doNotUpdateLast) {
    // Zoom
    PinchZoom.zoom(scaleBy);

    // New raw center of viewport
    const rawCenterX = -PinchZoom.X + Math.min(PinchZoom.VIEWPORT_WIDTH, PinchZoom.CUR_WIDTH) / 2 / PinchZoom.SCALE;
    const rawCenterY = -PinchZoom.Y + Math.min(PinchZoom.VIEWPORT_HEIGHT, PinchZoom.CUR_HEIGHT) / 2 / PinchZoom.SCALE;

    // Delta
    const deltaX = (rawCenterX - rawZoomX) * PinchZoom.SCALE;
    const deltaY = (rawCenterY - rawZoomY) * PinchZoom.SCALE;

    // Translate back to zoom center
    PinchZoom.translate(deltaX, deltaY);

    if (!doNotUpdateLast) {
      PinchZoom.updateLastScale();
      PinchZoom.updateLastPos();
    }
  },

  zoomCenter: function (scaleBy) {
    // Center of viewport
    const zoomX = -PinchZoom.X + Math.min(PinchZoom.VIEWPORT_WIDTH, PinchZoom.CUR_WIDTH) / 2 / PinchZoom.SCALE;
    const zoomY = -PinchZoom.Y + Math.min(PinchZoom.VIEWPORT_HEIGHT, PinchZoom.CUR_HEIGHT) / 2 / PinchZoom.SCALE;

    PinchZoom.zoomAround(scaleBy, zoomX, zoomY);
  },

  zoomIn: function () {
    PinchZoom.zoomCenter(2);
  },

  zoomOut: function () {
    PinchZoom.zoomCenter(1/2);
  },

  onLoad: function () {

    PinchZoom.ELEMENT_ID = 'pinch-zoom-image-id';
    PinchZoom.ELEMENT = document.getElementById(PinchZoom.ELEMENT_ID);
    PinchZoom.CONTAINER_ID = 'scene';
    PinchZoom.CONTAINER = document.getElementById(PinchZoom.CONTAINER_ID);

    PinchZoom.disableImgEventHandlers();

    PinchZoom.IMG_WIDTH = PinchZoom.ELEMENT.width;
    PinchZoom.IMG_HEIGHT = PinchZoom.ELEMENT.height;
    PinchZoom.SCALE = PinchZoom.VIEWPORT_WIDTH / PinchZoom.IMG_WIDTH;
    PinchZoom.SCALE_LAST = PinchZoom.SCALE;
    PinchZoom.VIEWPORT_WIDTH = PinchZoom.CONTAINER.offsetWidth;
    PinchZoom.VIEWPORT_HEIGHT = PinchZoom.CONTAINER.offsetHeight;
    PinchZoom.CUR_WIDTH = PinchZoom.IMG_WIDTH * PinchZoom.SCALE;
    PinchZoom.CUR_HEIGHT = PinchZoom.IMG_HEIGHT * PinchZoom.SCALE;

    const hammer = new Hammer(PinchZoom.CONTAINER, {
      domEvents: true
    });

    hammer.get('pinch').set({
      enable: true
    });

    hammer.on('pan', function (e) {
      PinchZoom.translate(e.deltaX, e.deltaY);
    });

    hammer.on('panend', function (e) {
      PinchZoom.updateLastPos();
    });

    hammer.on('pinch', function (e) {

      // We only calculate the pinch center on the first pinch event as we want the center to
      // stay consistent during the entire pinch
      if (pinchCenter === null) {
        PinchZoom.PINCH_CENTER = PinchZoom.rawCenter(e);
        const offsetX = pinchCenter.x * PinchZoom.SCALE - (-PinchZoom.X * PinchZoom.SCALE + Math.min(viewportWidth, curWidth) / 2);
        const offsetY = pinchCenter.y * PinchZoom.SCALE - (-PinchZoom.Y * PinchZoom.SCALE + Math.min(viewportHeight, curHeight) / 2);
        PinchZoom.PINCH_CENTER_OFFSET = { x: offsetX, y: offsetY };
      }

      // When the user pinch zooms, she/he expects the pinch center to remain in the same
      // relative location of the screen. To achieve this, the raw zoom center is calculated by
      // first storing the pinch center and the scaled offset to the current center of the
      // image. The new scale is then used to calculate the zoom center. This has the effect of
      // actually translating the zoom center on each pinch zoom event.
      const newScale = PinchZoom.restrictScale(PinchZoom.SCALE * e.scale);
      const zoomX = pinchCenter.x * newScale - pinchCenterOffset.x;
      const zoomY = pinchCenter.y * newScale - pinchCenterOffset.y;
      const zoomCenter = { x: zoomX / newScale, y: zoomY / newScale };

      PinchZoom.zoomAround(e.scale, zoomCenter.x, zoomCenter.y, true);
    });

    hammer.on('pinchend', function (e) {
      PinchZoom.updateLastScale();
      PinchZoom.updateLastPos();
      PinchZoom.PINCH_CENTER = null;
    });

    hammer.on('doubletap', function (e) {
      const c = PinchZoom.rawCenter(e);
      PinchZoom.zoomAround(2, c.x, c.y);
    });

  },

};