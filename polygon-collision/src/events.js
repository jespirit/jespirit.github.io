let body = document.getElementsByTagName("body")[0];
    window.addEventListener('mousedown', function (e) {
      if (e.button === 2) {
        console.log("window (capture):mousedown: right-click!");
        // e.stopPropagation();
      }
    }, true);

    window.addEventListener('mousedown', function (e) {
      if (e.button === 2) {
        console.log("window (bubble):mousedown: right-click!");
      }
    }, false);

    window.addEventListener('mouseup', function (e) {
      if (e.button === 2) {
        console.log("window (bubble):mouseup: right-click!");
        if (e.eventTarget === p.canvas) {
          e.preventDefault();
        }
      }
    }, false);

    p.canvas.addEventListener('mousedown', function (e) {
      if (e.button === 2) {
        console.log("canvas:mousedown: right-click!");
        // e.preventDefault();
      }
    }, true);

    p.canvas.addEventListener('mouseup', function (e) {
      if (e.button === 2) {
        console.log("canvas:mouseup: right-click!");
        e.preventDefault();
      }
    }, false);