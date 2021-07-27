const document = typeof window !== 'undefined' &&
	typeof window.document !== 'undefined' ?
		window.document : {} as any;

const fn = (() => {
	let val;

	let fnMap = [
		[
			'requestFullscreen',
			'exitFullscreen',
			'fullscreenElement',
			'fullscreenEnabled',
			'fullscreenchange',
			'fullscreenerror'
		],
		// New WebKit
		[
			'webkitRequestFullscreen',
			'webkitExitFullscreen',
			'webkitFullscreenElement',
			'webkitFullscreenEnabled',
			'webkitfullscreenchange',
			'webkitfullscreenerror'

		],
		// Old WebKit
		[
			'webkitRequestFullScreen',
			'webkitCancelFullScreen',
			'webkitCurrentFullScreenElement',
			'webkitCancelFullScreen',
			'webkitfullscreenchange',
			'webkitfullscreenerror'

		],
		[
			'mozRequestFullScreen',
			'mozCancelFullScreen',
			'mozFullScreenElement',
			'mozFullScreenEnabled',
			'mozfullscreenchange',
			'mozfullscreenerror'
		],
		[
			'msRequestFullscreen',
			'msExitFullscreen',
			'msFullscreenElement',
			'msFullscreenEnabled',
			'MSFullscreenChange',
			'MSFullscreenError'
		]
	];

	let i = 0;
	let l = fnMap.length;
	let ret = {} as any;

	for (; i < l; i++) {
		val = fnMap[i];
		if (val && val[1] in document) {
			for (i = 0; i < val.length; i++) {
				ret[fnMap[0][i]] = val[i];
			}
			return ret;
		}
	}

	return false;
})();

type EventName = 'change' | 'error';

class Screenfull {
	static get isFullscreen() {
		return Boolean(document[fn.fullscreenElement]);
	}
	static on(event: EventName, callback: (event: Event) => void) {
    const eventName = event === 'error' ?
      fn.fullscreenerror : fn.fullscreenchange;
    document.addEventListener(eventName, callback, false);
  }
	static off(event: EventName, callback: (event: Event) => void) {
    const eventName = event === 'error' ?
      fn.fullscreenerror : fn.fullscreenchange;
    document.removeEventListener(eventName, callback, false);
  }
  static request(element?: Element) {
    return new Promise<void>((resolve, reject) => {
      const onFullScreenEntered = () => {
        this.off('change', onFullScreenEntered);
        resolve();
      };

      this.on('change', onFullScreenEntered);

      const fullscreenElement = element || document.documentElement;

      const returnPromise = fullscreenElement[fn.requestFullscreen]();

      if (returnPromise instanceof Promise) {
        returnPromise.then(onFullScreenEntered).catch(reject);
      }
    });
  }
  static exit() {
    return new Promise<void>((resolve, reject) => {
      if (!this.isFullscreen) {
        resolve();
        return;
      }

      const onFullScreenExit = () => {
        this.off('change', onFullScreenExit);
        resolve();
      };

      this.on('change', onFullScreenExit);

      const returnPromise = document[fn.exitFullscreen]();

      if (returnPromise instanceof Promise) {
        returnPromise.then(onFullScreenExit).catch(reject);
      }
    });
  }
  static toggle(element?: Element){
    return this.isFullscreen ? this.exit() : this.request(element);
  }
  static get isEnabled() {
		return Boolean(document[fn.fullscreenEnabled]);
	}
};

export default Screenfull;
