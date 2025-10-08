// Module entry point. Import the main game module and call its init() once on load.
import { init } from '../script.js';

window.addEventListener('load', () => {
	try {
		init();
	} catch (err) {
		console.error('Error during game init:', err);
		throw err;
	}
});
