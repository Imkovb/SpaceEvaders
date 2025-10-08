// Sprite module - handles loading and providing sprite images and frames
export let enemySprites = [];
export let shipSprite = new Image();
export let logoSprite = new Image();
export let explosionFrames = [];
export let spritesLoaded = false;

import { CONFIG } from './config.js';

export function loadSprites() {
    spritesLoaded = false;
    const loadPromises = [];

    // Ship sprite
    loadPromises.push(new Promise((resolve) => {
        shipSprite = new Image();
        shipSprite.onload = () => {
            console.log('Ship sprite loaded');
            resolve();
        };
        shipSprite.onerror = () => {
            console.warn('Ship sprite not found - using fallback canvas');
            const c = document.createElement('canvas');
            c.width = 32; c.height = 32;
            const cx = c.getContext('2d');
            cx.fillStyle = '#0f0'; cx.fillRect(8,0,16,32);
            shipSprite = c;
            resolve();
        };
        shipSprite.src = 'img/ship.png?t=' + Date.now();
    }));

    // Logo sprite
    loadPromises.push(new Promise((resolve) => {
        logoSprite = new Image();
        logoSprite.onload = () => { console.log('Logo loaded'); resolve(); };
        logoSprite.onerror = () => { console.warn('Logo not found'); resolve(); };
        logoSprite.src = 'img/logo.png?t=' + Date.now();
    }));

    // Explosion frames loader (create promises for each frame)
    const explosionPromises = [];
    explosionFrames.length = 0;
    for (let i = 1; i <= 9; i++) {
        explosionPromises.push(new Promise((resolve) => {
            const img = new Image();
            img.onload = () => { explosionFrames[i-1] = img; resolve(); };
            img.onerror = () => {
                const c = document.createElement('canvas');
                c.width = 32; c.height = 32;
                const cx = c.getContext('2d');
                cx.fillStyle = '#ff8800'; cx.beginPath(); cx.arc(16,16,12,0,Math.PI*2); cx.fill();
                explosionFrames[i-1] = c;
                resolve();
            };
            img.src = `img/explosion${i}.png?t=${Date.now()}`;
        }));
    }
    loadPromises.push(Promise.all(explosionPromises));

    // Enemy sprites: try to load images from img/enemy/enm1..enm5.png
    enemySprites.length = 0;
    const enemyPromises = [];
    for (let i = 1; i <= 5; i++) {
        enemyPromises.push(new Promise((resolve) => {
            const img = new Image();
            img.onload = () => { enemySprites.push(img); resolve(); };
            img.onerror = () => {
                // Fallback canvas if image missing
                const c = document.createElement('canvas');
                c.width = 16; c.height = 16;
                const cx = c.getContext('2d');
                // Use a distinct fallback color per index for visibility
                const colors = ['#f00','#00f','#0f0','#ff0','#f0f'];
                cx.fillStyle = colors[(i-1) % colors.length];
                cx.fillRect(0,0,16,16);
                enemySprites.push(c);
                resolve();
            };
            img.src = `img/enemy/enm${i}.png?t=${Date.now()}`;
        }));
    }
    loadPromises.push(Promise.all(enemyPromises));

    // When all assets attempted to load, mark spritesLoaded
    Promise.all(loadPromises).then(() => {
        spritesLoaded = true;
        console.log('All sprites loaded or fallbacks created. enemySprites:', enemySprites.length, 'explosionFrames:', explosionFrames.length);
        // Diagnostic: report each enemy sprite type and dimensions
        enemySprites.forEach((s, idx) => {
            try {
                if (s instanceof HTMLImageElement) {
                    console.log(`enemySprites[${idx}] = Image src=${s.src} natural=${s.naturalWidth}x${s.naturalHeight}`);
                } else {
                    // assume canvas fallback
                    console.log(`enemySprites[${idx}] = Canvas size=${s.width}x${s.height}`);
                }
            } catch (e) {
                console.log(`enemySprites[${idx}] = unknown (${e})`);
            }
        });
    }).catch(() => {
        spritesLoaded = true;
        console.log('Sprites loading completed with some errors, using fallbacks.');
    });
}

export function loadExplosionFrames() {
    // Deprecated: explosion frames are now loaded by loadSprites(); keep function for compatibility
    console.warn('loadExplosionFrames() is deprecated - explosion frames are loaded by loadSprites()');
}
