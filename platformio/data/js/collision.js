// Collision utilities and pixel-perfect helpers
export let spriteCollisionMasks = {};
export let spriteBounds = {};
export let scaledSpriteBounds = {};

// Performance optimization: cache scaled masks for different scales
export let scaledMaskCache = {};

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

// Generate a scaled collision mask for better performance with scaled sprites
export function generateScaledCollisionMask(image, scale, threshold = 128) {
    try {
        const cacheKey = `${image.src || 'canvas' + Date.now()}_${scale}_${threshold}`;
        if (scaledMaskCache[cacheKey]) {
            return scaledMaskCache[cacheKey];
        }
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const scaledWidth = Math.floor(image.width * scale);
        const scaledHeight = Math.floor(image.height * scale);
        
        if (scaledWidth <= 0 || scaledHeight <= 0) {
            console.warn('Invalid scaled dimensions:', scaledWidth, scaledHeight);
            return null;
        }
        
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        
        // Draw scaled image
        ctx.imageSmoothingEnabled = false; // Pixel-perfect scaling
        ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
        
        const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);
        const data = imageData.data;
        const mask = { width: scaledWidth, height: scaledHeight, pixels: [] };
    
        for (let y = 0; y < scaledHeight; y++) {
            mask.pixels[y] = [];
            for (let x = 0; x < scaledWidth; x++) {
                const index = (y * scaledWidth + x) * 4;
                const alpha = data[index + 3];
                mask.pixels[y][x] = alpha > threshold;
            }
        }
        
        scaledMaskCache[cacheKey] = mask;
        return mask;
    } catch (error) {
        console.error('Error generating scaled collision mask:', error);
        return null;
    }
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
    // Safety checks
    if (!mask1 || !mask2 || !mask1.pixels || !mask2.pixels) {
        console.warn('Invalid mask in checkPixelCollision');
        return false;
    }
    
    // Floor all coordinates to avoid floating point indices
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);
    
    const bounds1 = getSpriteBounds(mask1, x1, y1);
    const bounds2 = getSpriteBounds(mask2, x2, y2);
    if (!rectanglesOverlap(bounds1, bounds2)) return false;
    const overlap = getOverlapRegion(bounds1, bounds2);
    
    for (let y = Math.floor(overlap.y1); y < Math.floor(overlap.y2); y++) {
        for (let x = Math.floor(overlap.x1); x < Math.floor(overlap.x2); x++) {
            const localX1 = Math.floor(x - x1);
            const localY1 = Math.floor(y - y1);
            const localX2 = Math.floor(x - x2);
            const localY2 = Math.floor(y - y2);
            
            if (localX1 >= 0 && localX1 < mask1.width && localY1 >= 0 && localY1 < mask1.height && 
                localX2 >= 0 && localX2 < mask2.width && localY2 >= 0 && localY2 < mask2.height) {
                if (mask1.pixels[localY1]?.[localX1] && mask2.pixels[localY2]?.[localX2]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Optimized collision check with early exit - for game entities
export function checkEntityCollision(entity1Mask, entity1X, entity1Y, entity2Mask, entity2X, entity2Y) {
    // Safety checks
    if (!entity1Mask || !entity2Mask) {
        return false;
    }
    
    // Quick bounding box check first
    const bounds1 = { 
        x: entity1X, 
        y: entity1Y, 
        width: entity1Mask.width, 
        height: entity1Mask.height 
    };
    const bounds2 = { 
        x: entity2X, 
        y: entity2Y, 
        width: entity2Mask.width, 
        height: entity2Mask.height 
    };
    
    if (!rectanglesOverlap(bounds1, bounds2)) return false;
    
    // If bounding boxes overlap, do pixel-perfect check
    return checkPixelCollision(entity1Mask, entity1X, entity1Y, entity2Mask, entity2X, entity2Y);
}

// Check collision between a point (like a bullet) and a masked sprite
export function checkPointCollision(pointX, pointY, mask, maskX, maskY) {
    if (!mask || !mask.pixels) {
        return false;
    }
    
    const localX = Math.floor(pointX - maskX);
    const localY = Math.floor(pointY - maskY);
    
    if (localX < 0 || localX >= mask.width || localY < 0 || localY >= mask.height) {
        return false;
    }
    
    return mask.pixels[localY]?.[localX] || false;
}

// Check collision between a small rectangle (like a bullet) and a masked sprite
export function checkRectCollision(rectX, rectY, rectWidth, rectHeight, mask, maskX, maskY) {
    if (!mask || !mask.pixels) {
        return false;
    }
    
    // Floor all coordinates
    rectX = Math.floor(rectX);
    rectY = Math.floor(rectY);
    maskX = Math.floor(maskX);
    maskY = Math.floor(maskY);
    
    // Quick bounding box check
    const bounds1 = { x: rectX, y: rectY, width: rectWidth, height: rectHeight };
    const bounds2 = { x: maskX, y: maskY, width: mask.width, height: mask.height };
    
    if (!rectanglesOverlap(bounds1, bounds2)) return false;
    
    // Check each corner and center of the rectangle
    const checkPoints = [
        [rectX, rectY],                                    // Top-left
        [rectX + rectWidth - 1, rectY],                   // Top-right
        [rectX, rectY + rectHeight - 1],                  // Bottom-left
        [rectX + rectWidth - 1, rectY + rectHeight - 1],  // Bottom-right
        [rectX + Math.floor(rectWidth / 2), rectY + Math.floor(rectHeight / 2)]   // Center
    ];
    
    for (const [px, py] of checkPoints) {
        if (checkPointCollision(px, py, mask, maskX, maskY)) {
            return true;
        }
    }
    
    // For very precise detection, sample the overlap region
    const overlap = getOverlapRegion(bounds1, bounds2);
    const sampleStep = 2; // Check every 2 pixels for performance
    
    for (let y = Math.floor(overlap.y1); y < Math.floor(overlap.y2); y += sampleStep) {
        for (let x = Math.floor(overlap.x1); x < Math.floor(overlap.x2); x += sampleStep) {
            const localX = Math.floor(x - maskX);
            const localY = Math.floor(y - maskY);
            
            if (localX >= 0 && localX < mask.width && localY >= 0 && localY < mask.height) {
                if (mask.pixels[localY]?.[localX]) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

// Debug visualization - draw collision mask outline with glow effect
export function drawCollisionMaskOutline(ctx, mask, x, y, color = '#00FF00') {
    // Save context state
    const savedGlobalAlpha = ctx.globalAlpha;
    const savedShadowBlur = ctx.shadowBlur;
    const savedShadowColor = ctx.shadowColor;
    
    // Add glow effect for better visibility
    ctx.shadowBlur = 3;
    ctx.shadowColor = color;
    
    // Draw outline by checking edges - make it thicker and brighter
    for (let py = 0; py < mask.height; py++) {
        for (let px = 0; px < mask.width; px++) {
            if (mask.pixels[py][px]) {
                // Check if this pixel is on an edge
                const isEdge = 
                    px === 0 || px === mask.width - 1 ||
                    py === 0 || py === mask.height - 1 ||
                    !mask.pixels[py - 1]?.[px] ||
                    !mask.pixels[py + 1]?.[px] ||
                    !mask.pixels[py][px - 1] ||
                    !mask.pixels[py][px + 1];
                
                if (isEdge) {
                    // Draw a slightly larger, brighter pixel for visibility
                    ctx.fillStyle = color;
                    ctx.fillRect(x + px, y + py, 2, 2); // 2x2 instead of 1x1
                }
            }
        }
    }
    
    // Restore context state
    ctx.shadowBlur = savedShadowBlur;
    ctx.shadowColor = savedShadowColor;
    ctx.globalAlpha = savedGlobalAlpha;
}

// Debug visualization - draw bounding box with glow
export function drawBoundingBox(ctx, x, y, width, height, color = '#FF0000') {
    // Save context state
    const savedShadowBlur = ctx.shadowBlur;
    const savedShadowColor = ctx.shadowColor;
    
    // Add glow effect
    ctx.shadowBlur = 5;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3; // Thicker line for visibility
    ctx.strokeRect(x, y, width, height);
    
    // Restore context state
    ctx.shadowBlur = savedShadowBlur;
    ctx.shadowColor = savedShadowColor;
}
