// Collision utilities and pixel-perfect helpers
export let spriteCollisionMasks = {};
export let spriteBounds = {};
export let scaledSpriteBounds = {};

export function generateCollisionMask(image, threshold = 128) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const mask = { width: canvas.width, height: canvas.height, pixels: [] };
    for (let y = 0; y < canvas.height; y++) {
        mask.pixels[y] = [];
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const alpha = data[index + 3];
            mask.pixels[y][x] = alpha > threshold;
        }
    }
    return mask;
}

export function calculateSpriteBounds(image, threshold = 128) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let minX = canvas.width; let maxX = 0; let minY = canvas.height; let maxY = 0; let hasPixels = false;
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const alpha = data[index + 3];
            if (alpha > threshold) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
                hasPixels = true;
            }
        }
    }
    return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

export function getSpriteBounds(mask, worldX, worldY) {
    let minX = mask.width; let maxX = 0; let minY = mask.height; let maxY = 0;
    for (let y = 0; y < mask.height; y++) {
        for (let x = 0; x < mask.width; x++) {
            if (mask.pixels[y][x]) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }
    }
    return { x: worldX + minX, y: worldY + minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

export function rectanglesOverlap(rect1, rect2) {
    return !(rect1.x + rect1.width < rect2.x || rect2.x + rect2.width < rect1.x || rect1.y + rect1.height < rect2.y || rect2.y + rect2.height < rect1.y);
}

export function getOverlapRegion(rect1, rect2) {
    const x1 = Math.max(rect1.x, rect2.x);
    const y1 = Math.max(rect1.y, rect2.y);
    const x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
    const y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);
    return { x1, y1, x2, y2 };
}

export function checkPixelCollision(mask1, x1, y1, mask2, x2, y2) {
    const bounds1 = getSpriteBounds(mask1, x1, y1);
    const bounds2 = getSpriteBounds(mask2, x2, y2);
    if (!rectanglesOverlap(bounds1, bounds2)) return false;
    const overlap = getOverlapRegion(bounds1, bounds2);
    for (let y = overlap.y1; y < overlap.y2; y++) {
        for (let x = overlap.x1; x < overlap.x2; x++) {
            const localX1 = x - x1; const localY1 = y - y1;
            const localX2 = x - x2; const localY2 = y - y2;
            if (localX1 >= 0 && localX1 < mask1.width && localY1 >= 0 && localY1 < mask1.height && localX2 >= 0 && localX2 < mask2.width && localY2 >= 0 && localY2 < mask2.height) {
                if (mask1.pixels[localY1][localX1] && mask2.pixels[localY2][localX2]) return true;
            }
        }
    }
    return false;
}
