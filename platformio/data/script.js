// Game Configuration Constants
const CONFIG = {
    // Player Rotation Settings
    PLAYER_ROTATE_MAX_ANGLE: Math.PI / 8, // max rotation in radians (~22.5deg)
    PLAYER_ROTATE_EASE_SPEED: 0.1, // easing factor (0-1, higher is snappier)
    PLAYER_ROTATE_RETURN_DISTANCE: 8, // distance multiplier for when to start returning to straight (higher = earlier return)
    
    // Speed Settings
    PLAYER_SPEED: 8,
    OBSTACLE_SPEED: 2,
    BULLET_SPEED: 10,
    GAME_SPEED_INCREASE: 0.0005,
    
    // Score Settings
    SCORE_PER_FRAME: 1,
    SCORE_PER_ENEMY_DESTROYED: 500,
    ENEMIES_FOR_BULLET: 5,
    
    // Size Settings
    CANVAS_WIDTH: 340,
    CANVAS_HEIGHT: 580,
    PLAYER_WIDTH: 32,
    PLAYER_HEIGHT: 32,
    OBSTACLE_WIDTH: 48,
    OBSTACLE_HEIGHT: 48,
    BULLET_WIDTH: 4,
    BULLET_HEIGHT: 12,
    
    // Game Settings
    LANES: 3,
    OBSTACLE_SPAWN_RATE: 0.02,
    
    // UI Settings
    BULLET_COUNTER_X_OFFSET: 10,
    BULLET_COUNTER_Y_OFFSET: 30,
    SCORE_COUNTER_X_OFFSET: 10,
    SCORE_COUNTER_Y_OFFSET: 30,
    CHALLENGE_MODE_X_OFFSET: 250, // X position for challenge mode text (right side)
    CHALLENGE_MODE_Y_OFFSET: 30, // Y position for challenge mode text
    BULLET_BAR_WIDTH: 80, // Width of bullet progress bar (shorter than before)
    
    // Sprite Settings
    ENEMY_SCALE: 3.5,
    BOSS_SCALE: 16.0,
    
    // Special Enemy V Formation Settings
    SPECIAL_ENEMY_SCALE: 2.2, // Smaller than regular enemies (1.5x vs 3x)
    SPECIAL_ENEMY_V_SPACING: 25, // Vertical spacing between V formation enemies
    SPECIAL_ENEMY_H_SPACING: 25, // Horizontal spacing for V formation wings
    SPECIAL_ENEMY_SPAWN_CHANCE: 0.3, // 30% chance to spawn special formation per wave
    
    // Dynamic Spacing Settings
    BASE_SPACING: 150, // Increased from 100 to 150 - starting spacing between obstacles
    MIN_SPACING: 40, // Increased from 20 to 40 - minimum spacing
    SPACING_DECREASE_RATE: 0.1, // How fast spacing decreases
    
    // Intelligent Spawning Settings
    MIN_TIME_BETWEEN_SPAWNS: 15, // Minimum frames between spawns
    PLAYER_LANE_CROWD_REDUCTION: 0.5, // Spawn reduction when player lane crowded
    EMPTY_LANE_BONUS: 1.6, // Spawn bonus when player lane empty
    BULLET_SPAWN_BONUS: 1.6, // Spawn bonus when player has bullet (increased spawning)
    RECENT_SPAWN_REDUCTION: 0.3, // Heavy reduction if spawned recently
    
    // Boss Settings
    BOSS_WIDTH: 200, // Adjusted for 340px canvas (2 lanes of ~113px each)
    BOSS_HEIGHT: 200, // Taller than regular obstacles
    BOSS_SPAWN_CHANCE: 0.005, // Very low chance (0.5%)
    BOSS_SPEED: 0.99, // Slightly slower to compensate for larger size appearing faster
    BOSS_COLOR: '#FF0000', // Red color for boss
    
    // Boss Hurtbox Settings
    BOSS_HURTBOX_HEIGHT: 100, // Height of the hurtbox beneath the boss (2 enemies high)
    BOSS_HURTBOX_WIDTH: 200, // Width matches boss width
    BOSS_HURTBOX_OFFSET: 0, // Offset from boss bottom (0 = directly beneath)
    
    // Highscore Challenge Settings
    HIGHSCORE_CHALLENGE_THRESHOLD: 0.85, // Percentage of personal best to trigger challenge mode (0.9 = 90%)
    HIGHSCORE_CHALLENGE_MULTIPLIER: 12.0, // Difficulty multiplier when challenging highscore
    HIGHSCORE_CHALLENGE_SPAWN_MULTIPLIER: 20.0, // Spawn rate multiplier when challenging highscore
    
    // Explosion Settings
    EXPLOSION_FRAME_DURATION_MS: 67, // Duration of each explosion frame in milliseconds (67ms = ~15 FPS)
    EXPLOSION_SCALE: 1.5, // Scale factor for explosion size (3.0 = same as enemies)
    
    // Logo Settings
    LOGO_SCALE: 3.0, // Scale factor for logo size (2.0 = 2x original size)
    LOGO_POSITION_FROM_TOP: 50, // Distance from top of canvas in pixels
    
    // Button Color Settings
    BUTTON_COLORS: {
        // Game Control Buttons
        LEFT_BUTTON_DEFAULT: '#343230',
        LEFT_BUTTON_ACTIVE: '#343230',
        RIGHT_BUTTON_DEFAULT: '#343230', 
        RIGHT_BUTTON_ACTIVE: '#343230',
        SHOOT_BUTTON_DEFAULT: 'rgba(149, 57, 44, 1)',
        SHOOT_BUTTON_ACTIVE: '#a00',
        SHOOT_BUTTON_DISABLED: '#1b2026',
        
        // Navigation Buttons
        HIGHSCORES_BUTTON_DEFAULT: '#0d4776ff',
        HIGHSCORES_BUTTON_HOVER: '#1976D2',
        BACK_BUTTON_DEFAULT: '#f44336',
        BACK_BUTTON_HOVER: '#d32f2f',
        
        // Common Button Properties
        BUTTON_TEXT_COLOR: '#fff',
        BUTTON_DISABLED_OPACITY: '0.5',
        BUTTON_DISABLED_CURSOR: 'not-allowed',
        BUTTON_ENABLED_CURSOR: 'pointer'
    },
};

// Game constants
const CANVAS_WIDTH = CONFIG.CANVAS_WIDTH;
const CANVAS_HEIGHT = CONFIG.CANVAS_HEIGHT;
const PLAYER_WIDTH = CONFIG.PLAYER_WIDTH;
const PLAYER_HEIGHT = CONFIG.PLAYER_HEIGHT;
const OBSTACLE_WIDTH = CONFIG.OBSTACLE_WIDTH;
const OBSTACLE_HEIGHT = CONFIG.OBSTACLE_HEIGHT;
const PLAYER_SPEED = CONFIG.PLAYER_SPEED;
const OBSTACLE_SPEED = CONFIG.OBSTACLE_SPEED;
const LANES = CONFIG.LANES;
const LANE_WIDTH = CANVAS_WIDTH / LANES;
const BULLET_WIDTH = CONFIG.BULLET_WIDTH;
const BULLET_HEIGHT = CONFIG.BULLET_HEIGHT;
const BULLET_SPEED = CONFIG.BULLET_SPEED;
const ENEMY_SCALE = CONFIG.ENEMY_SCALE;
const ENEMIES_FOR_BULLET = CONFIG.ENEMIES_FOR_BULLET;

// Game variables
let canvas, ctx;
let gameState = 'menu'; // menu, playing, gameOver
let player = { 
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, 
    y: CANVAS_HEIGHT - 100, 
    vx: 0, 
    vy: 0,
    currentLane: 1, // 0, 1, 2 (left, center, right)
    targetX: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    rotation: 0, // current rotation in radians
    targetRotation: 0 // target rotation in radians
};
let obstacles = [];
let stars = [];
let bullet = null;
let hasBullet = true;
let enemiesDodged = 0;
let score = 0;
let highScore = localStorage.getItem('spaceEvadersHighScore') || 0;
let keys = {};
let touchLeft = false, touchRight = false, touchShoot = false;
let gameSpeed = 1;

// Difficulty scaling for highscore challengers
let difficultyMultiplier = 1.0;
let playerPersonalBest = 0;
let isChallengingHighscore = false;

// Mouse tracking for menu buttons
let mouseX = 0;
let mouseY = 0;

// Highscore system
let highscores = [];
let playerName = '';
let playerPosition = -1;
let nameInputActive = false;
let nameInputElement;
let playerFingerprint = '';

// Highscore scrolling
let highscoreScrollOffset = 0;
let maxVisibleScores = 5;

// Sprites
let enemySprites = [];
let shipSprite;
let logoSprite; // Logo image for start screen
let spritesLoaded = false;

// Wave system
let currentWave = 0;
let currentWaveEnemyIndex = -1;
let waveEnemiesSpawned = 0;
let waveLength = 8; // Number of enemies per wave
let availableEnemyIndices = []; // Will be shuffled each wave
let specialFormationSpawnedThisWave = false; // Track if special V formation spawned this wave

// Intelligent spawning system
let lastSpawnTime = 0;

// Boss system
let boss = null; // Boss enemy
let lastBossScore = 0; // Track last score milestone when boss spawned

// Explosion system
let explosions = []; // Array of active explosions
let explosionFrames = []; // Array to hold individual frames of the explosion GIF
let explosionFrameCount = 9; // 9 frames in the explosion GIF
let explosionFrameDuration; // Calculated from CONFIG.EXPLOSION_FRAME_DURATION_MS

// Target frame rate for timing calculations
const TARGET_FPS = 30;

// Debug settings
let showDebugCollision = false; // Set to false to hide debug collision
let showCollisionBoxes = false; // Set to false to hide collision boxes

// Initialize game
function init() {
    console.log('Game initialization started...');
    
    // Setup canvas
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    console.log('Canvas element found:', canvas);
    
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Canvas context not available!');
        return;
    }
    console.log('Canvas context obtained:', ctx);
    
    // Setup controls
    const leftBtn = document.getElementById('left-btn');
    shootBtn = document.getElementById('shoot-btn');
    const rightBtn = document.getElementById('right-btn');
    nameInputElement = document.getElementById('nameInput');
    
    console.log('Controls setup:', {
        leftBtn: !!leftBtn,
        shootBtn: !!shootBtn,
        rightBtn: !!rightBtn,
        nameInputElement: !!nameInputElement
    });
    
    // Setup event listeners
    setupEventListeners();
    setupNameInput();
    
    // Apply configurable button styles
    applyButtonStyles();
    
    console.log('Event listeners setup complete');
    
    // Initialize game components
    initStars();
    console.log('Stars initialized, count:', stars.length);

    loadSprites();
    console.log('Sprites loading started');
    
    // Generate player fingerprint for highscores
    generatePlayerFingerprint();
    
    // Load highscores for menu display
    loadHighscores();
    
    // Initialize button states
    updateFireButtonState();
    
    // Initialize wave system
    initializeWaveSystem();
    
    // Calculate explosion frame duration from milliseconds
    explosionFrameDuration = Math.round((CONFIG.EXPLOSION_FRAME_DURATION_MS / 1000) * TARGET_FPS);
    console.log(`Explosion frame duration: ${CONFIG.EXPLOSION_FRAME_DURATION_MS}ms = ${explosionFrameDuration} game frames`);
    console.log(`Explosion scale set to: ${CONFIG.EXPLOSION_SCALE}x`);
    
    console.log('Game initialization completed, waiting for sprites to load...');
}

// Event listeners
function setupEventListeners() {
    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (gameState === 'nameInput' && nameInputActive) {
            // Let's input field handle keyboard events
            return;
        }

        keys[e.code] = true;
        if (e.code === 'Space') {
            e.preventDefault();
            if (gameState === 'menu' || gameState === 'gameOver') {
                resetGame();
                gameState = 'playing';
            } else if (gameState === 'playing') {
                shoot();
            }
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
        
        // Keyboard scrolling for highscore display
        if (gameState === 'highscoreDisplay' && highscores.length > 5) {
            const scrollAmount = 25; // One item at a time
            const maxScroll = getMaxHighscoreScrollOffset();
            
            switch(e.key) {
                case 'ArrowDown':
                case 'PageDown':
                    e.preventDefault();
                    highscoreScrollOffset = Math.min(maxScroll, highscoreScrollOffset + scrollAmount);
                    break;
                case 'ArrowUp':
                case 'PageUp':
                    e.preventDefault();
                    highscoreScrollOffset = Math.max(0, highscoreScrollOffset - scrollAmount);
                    break;
                case 'Home':
                    e.preventDefault();
                    highscoreScrollOffset = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    highscoreScrollOffset = maxScroll;
                    break;
            }
        }
    });

    // Touch
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const shootBtn = document.getElementById('shoot-btn');
    
    if (leftBtn && rightBtn && shootBtn) {
        leftBtn.addEventListener('touchstart', () => touchLeft = true);
        leftBtn.addEventListener('touchend', () => touchLeft = false);
        rightBtn.addEventListener('touchstart', () => touchRight = true);
        rightBtn.addEventListener('touchend', () => touchRight = false);
        shootBtn.addEventListener('touchstart', () => {
            touchShoot = true;
            if (gameState === 'menu' || gameState === 'gameOver') {
                resetGame();
                gameState = 'playing';
            } else if (gameState === 'playing') {
                shoot();
            }
        });
        shootBtn.addEventListener('touchend', () => touchShoot = false);
        
        // Mouse events for desktop testing
        leftBtn.addEventListener('mousedown', () => touchLeft = true);
        leftBtn.addEventListener('mouseup', () => touchLeft = false);
        rightBtn.addEventListener('mousedown', () => touchRight = true);
        rightBtn.addEventListener('mouseup', () => touchRight = false);
        shootBtn.addEventListener('mousedown', () => {
            touchShoot = true;
            if (gameState === 'menu' || gameState === 'gameOver') {
                resetGame();
                gameState = 'playing';
            } else if (gameState === 'playing') {
                shoot();
            }
        });
        shootBtn.addEventListener('mouseup', () => touchShoot = false);
    }

    // Mouse tracking for menu buttons
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    // Mouse wheel for highscore scrolling
    canvas.addEventListener('wheel', (e) => {
        if (gameState === 'highscoreDisplay' && highscores.length > 5) {
            e.preventDefault(); // Prevent page scrolling
            
            const scrollAmount = 25; // Scroll by one item height
            const maxScroll = getMaxHighscoreScrollOffset();
            
            if (e.deltaY > 0) {
                // Scrolling down
                highscoreScrollOffset = Math.min(highscoreScrollOffset + scrollAmount, maxScroll);
            } else {
                // Scrolling up
                highscoreScrollOffset = Math.max(highscoreScrollOffset - scrollAmount, 0);
            }
        }
    });

    // Touch events for mobile scrolling
    let touchStartY = 0;
    let touchStartScrollOffset = 0;

    canvas.addEventListener('touchstart', (e) => {
        if (gameState === 'highscoreDisplay' && highscores.length > 5) {
            touchStartY = e.touches[0].clientY;
            touchStartScrollOffset = highscoreScrollOffset;
        }
    });

    canvas.addEventListener('touchmove', (e) => {
        if (gameState === 'highscoreDisplay' && highscores.length > 5) {
            e.preventDefault(); // Prevent page scrolling
            
            const touchY = e.touches[0].clientY;
            const deltaY = touchStartY - touchY; // Inverted for natural scrolling
            const maxScroll = getMaxHighscoreScrollOffset();
            
            highscoreScrollOffset = Math.max(0, Math.min(touchStartScrollOffset + deltaY, maxScroll));
        }
    });

    // Canvas click
    canvas.addEventListener('click', (e) => {
        console.log('Canvas clicked at:', e.clientX, e.clientY);
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        console.log('Canvas coordinates:', clickX, clickY);
        console.log('Current game state:', gameState);

        if (gameState === 'nameInput' && nameInputActive) {
            // Check for button clicks first
            const buttonWidth = 80;
            const buttonHeight = 30;
            const buttonY = CANVAS_HEIGHT / 2 + 110;
            
            // Submit button
            const submitX = CANVAS_WIDTH / 2 - buttonWidth - 50;
            if (clickX >= submitX && clickX <= submitX + buttonWidth &&
                clickY >= buttonY && clickY <= buttonY + buttonHeight) {
                submitName();
                return;
            }
            
            // Main Menu button
            const menuX = CANVAS_WIDTH / 2 - buttonWidth / 2;
            if (clickX >= menuX && clickX <= menuX + buttonWidth &&
                clickY >= buttonY && clickY <= buttonY + buttonHeight) {
                goToMainMenu();
                return;
            }
            
            // Restart button
            const restartX = CANVAS_WIDTH / 2 + 50;
            if (clickX >= restartX && clickX <= restartX + buttonWidth &&
                clickY >= buttonY && clickY <= buttonY + buttonHeight) {
                restartGame();
                return;
            }
            
            // If clicking canvas elsewhere during name input, refocus the input field
            nameInputElement.focus();
            return;
        }
        
        if (gameState === 'menu') {
            // Check if start button was clicked
            const startButtonWidth = 180;
            const startButtonHeight = 50;
            const startButtonX = CANVAS_WIDTH / 2 - startButtonWidth / 2;
            const startButtonY = CANVAS_HEIGHT / 2 + 60;
            
            if (clickX >= startButtonX && clickX <= startButtonX + startButtonWidth &&
                clickY >= startButtonY && clickY <= startButtonY + startButtonHeight) {
                // Start button clicked
                resetGame();
                gameState = 'playing';
                return;
            }
            
            // Check if highscore button was clicked
            const hsButtonWidth = 150;
            const hsButtonHeight = 40;
            const hsButtonX = CANVAS_WIDTH / 2 - hsButtonWidth / 2;
            const hsButtonY = CANVAS_HEIGHT / 2 + 120;
            
            if (clickX >= hsButtonX && clickX <= hsButtonX + hsButtonWidth &&
                clickY >= hsButtonY && clickY <= hsButtonY + hsButtonHeight) {
                // Highscore button clicked
                loadHighscores().then(() => {
                    console.log('Highscores loaded successfully');
                }).catch(error => {
                    console.error('Error loading highscores:', error);
                });
                highscoreScrollOffset = 0; // Reset scroll position
                gameState = 'highscoreDisplay';
                return;
            }
        }
        
        if (gameState === 'menu' || gameState === 'gameOver') {
            resetGame();
            gameState = 'playing';
        } else if (gameState === 'highscoreDisplay') {
            // Check if back button was clicked
            const backButtonWidth = 120;
            const backButtonHeight = 35;
            const backButtonX = CANVAS_WIDTH / 2 - backButtonWidth / 2;
            const backButtonY = CANVAS_HEIGHT - 80;
            
            if (clickX >= backButtonX && clickX <= backButtonX + backButtonWidth &&
                clickY >= backButtonY && clickY <= backButtonY + backButtonHeight) {
                // Back button clicked
                gameState = 'menu';
                return;
            }
            // If clicked elsewhere, do nothing (don't return to menu)
        }
    });
}

// Initialize stars
function initStars() {
    stars = [];
    for (let i = 0; i < 50; i++) {
        stars.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * CANVAS_HEIGHT,
            speed: Math.random() * 2 + 1
        });
    }
}

// Load sprites
function loadSprites() {
    console.log('Loading sprites...');

    // Create fallback sprites immediately (synchronous)
    createFallbackSprites();
    spritesLoaded = true; // Set to true immediately

    // Load individual enemy sprites asynchronously (don't block game start)
    const enemyFiles = ['img/enemy/enm1.png', 'img/enemy/enm2.png', 'img/enemy/enm3.png', 'img/enemy/enm4.png', 'img/enemy/enm5.png'];
    let loadedCount = 0;

    enemyFiles.forEach((file, index) => {
        const img = new Image();
        img.onload = () => {
            console.log(`Loaded sprite: ${file}`);

            // Create canvas for this sprite
            const canvas = document.createElement('canvas');
            canvas.width = 16; // Original sprite size
            canvas.height = 16;
            const ctx = canvas.getContext('2d');

            // Draw the loaded image to canvas
            ctx.drawImage(img, 0, 0, 16, 16);

            // Replace fallback sprite with loaded sprite
            enemySprites[index] = canvas;
            
            // Generate collision mask for this sprite
            spriteCollisionMasks[`enemy${index}`] = generateCollisionMask(img);
            console.log(`Generated collision mask for enemy${index}:`, spriteCollisionMasks[`enemy${index}`]);
            
            // Calculate tight collision bounds
            spriteBounds[`enemy${index}`] = calculateSpriteBounds(img);
            console.log(`Calculated tight bounds for enemy${index}:`, spriteBounds[`enemy${index}`]);
            
            // Calculate scaled bounds for collision detection
            const bounds = spriteBounds[`enemy${index}`];
            scaledSpriteBounds[`enemy${index}`] = {
                x: bounds.x * CONFIG.ENEMY_SCALE,
                y: bounds.y * CONFIG.ENEMY_SCALE,
                width: bounds.width * CONFIG.ENEMY_SCALE,
                height: bounds.height * CONFIG.ENEMY_SCALE
            };
            console.log(`Scaled bounds for enemy${index}:`, scaledSpriteBounds[`enemy${index}`]);
            
            // Calculate boss bounds using the same sprite but with boss scaling
            scaledSpriteBounds[`boss${index}`] = {
                x: bounds.x * CONFIG.BOSS_SCALE,
                y: bounds.y * CONFIG.BOSS_SCALE,
                width: bounds.width * CONFIG.BOSS_SCALE,
                height: bounds.height * CONFIG.BOSS_SCALE
            };
            console.log(`Scaled bounds for boss${index}:`, scaledSpriteBounds[`boss${index}`]);
            
            loadedCount++;

            // Check if all sprites are loaded
            if (loadedCount === enemyFiles.length) {
                console.log('All enemy sprites loaded successfully!');
                console.log(`Total sprites loaded: ${enemySprites.length}`);
                // Start the game loop after all sprites are loaded
                gameLoop();
            }
        };
        img.onerror = () => {
            console.error(`Failed to load sprite: ${file} - using fallback`);
            loadedCount++;

            if (loadedCount === enemyFiles.length) {
                console.log('Enemy sprites loaded with fallbacks');
                // Start the game loop even if some sprites failed to load
                gameLoop();
            }
        };
        img.src = file + '?t=' + Date.now(); // Add timestamp to prevent caching
    });

    // Load ship sprite asynchronously
    shipSprite = new Image();
    shipSprite.onload = () => {
        console.log('Ship sprite loaded successfully');
    };
    shipSprite.onerror = () => {
        console.error('Failed to load ship sprite - using fallback');
        createFallbackShip();
    };
    shipSprite.src = 'img/ship.png?t=' + Date.now(); // Add timestamp to prevent caching

    // Load logo sprite asynchronously
    logoSprite = new Image();
    logoSprite.onload = () => {
        console.log('Logo sprite loaded successfully');
    };
    logoSprite.onerror = () => {
        console.error('Failed to load logo sprite - will use text fallback');
    };
    logoSprite.src = 'img/logo.png?t=' + Date.now(); // Add timestamp to prevent caching

    // Load explosion frames from individual sprite files
    loadExplosionFrames();
}

function createFallbackSprites() {
    console.log('Creating fallback sprites');
    enemySprites = [];

    // Create red enemy sprite
    const redCanvas = document.createElement('canvas');
    redCanvas.width = 16;
    redCanvas.height = 16;
    const redCtx = redCanvas.getContext('2d');
    redCtx.fillStyle = '#ff0000';
    redCtx.fillRect(2, 2, 12, 12); // Smaller rectangle for sprite look
    enemySprites.push(redCanvas);

    // Create blue enemy sprite
    const blueCanvas = document.createElement('canvas');
    blueCanvas.width = 16;
    blueCanvas.height = 16;
    const blueCtx = blueCanvas.getContext('2d');
    blueCtx.fillStyle = '#0000ff';
    blueCtx.fillRect(2, 2, 12, 12); // Smaller rectangle for sprite look
    enemySprites.push(blueCanvas);

    // Create green enemy sprite
    const greenCanvas = document.createElement('canvas');
    greenCanvas.width = 16;
    greenCanvas.height = 16;
    const greenCtx = greenCanvas.getContext('2d');
    greenCtx.fillStyle = '#00ff00';
    greenCtx.fillRect(2, 2, 12, 12); // Smaller rectangle for sprite look
    enemySprites.push(greenCanvas);

    // Create yellow enemy sprite
    const yellowCanvas = document.createElement('canvas');
    yellowCanvas.width = 16;
    yellowCanvas.height = 16;
    const yellowCtx = yellowCanvas.getContext('2d');
    yellowCtx.fillStyle = '#ffff00';
    yellowCtx.fillRect(2, 2, 12, 12); // Smaller rectangle for sprite look
    enemySprites.push(yellowCanvas);

    // Create purple enemy sprite
    const purpleCanvas = document.createElement('canvas');
    purpleCanvas.width = 16;
    purpleCanvas.height = 16;
    const purpleCtx = purpleCanvas.getContext('2d');
    purpleCtx.fillStyle = '#ff00ff';
    purpleCtx.fillRect(2, 2, 12, 12); // Smaller rectangle for sprite look
    enemySprites.push(purpleCanvas);

    console.log('Created fallback sprites:', enemySprites.length);
}

function createFallbackShip() {
    console.log('Creating fallback ship sprite');
    shipSprite = document.createElement('canvas');
    shipSprite.width = 32;
    shipSprite.height = 32;
    const ctx = shipSprite.getContext('2d');

    // Draw a simple ship shape
    ctx.fillStyle = '#00ff00';
    // Ship body
    ctx.fillRect(12, 8, 8, 16);
    // Ship nose
    ctx.fillRect(14, 4, 4, 8);
    // Ship wings
    ctx.fillRect(8, 16, 16, 4);
}

function createFallbackExplosions() {
    console.log('Creating fallback explosion frames...');
    explosionFrames = [];
    
    for (let frame = 0; frame < explosionFrameCount; frame++) {
        const canvas = document.createElement('canvas');
        canvas.width = 32; // Larger size for better explosion effect
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        const centerX = 16;
        const centerY = 16;
        const progress = frame / (explosionFrameCount - 1); // 0 to 1
        
        // Create expanding explosion effect
        const maxRadius = 12;
        const radius = maxRadius * progress;
        
        // Outer explosion ring (orange to red)
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, `rgba(255, 255, 0, ${1 - progress * 0.8})`);
        gradient.addColorStop(0.5, `rgba(255, 165, 0, ${1 - progress * 0.9})`);
        gradient.addColorStop(1, `rgba(255, 0, 0, ${1 - progress})`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add inner bright core
        if (progress < 0.7) {
            const coreRadius = radius * 0.3;
            const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
            coreGradient.addColorStop(0, `rgba(255, 255, 255, ${1 - progress})`);
            coreGradient.addColorStop(1, `rgba(255, 255, 0, ${1 - progress * 1.2})`);
            
            ctx.fillStyle = coreGradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add explosion particles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + progress * Math.PI * 0.5;
            const particleDistance = radius * (0.8 + Math.random() * 0.4);
            const particleX = centerX + Math.cos(angle) * particleDistance;
            const particleY = centerY + Math.sin(angle) * particleDistance;
            const particleSize = 2 * (1 - progress);
            
            ctx.fillStyle = `rgba(255, ${Math.floor(255 * (1 - progress))}, 0, ${1 - progress * 1.5})`;
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        explosionFrames.push(canvas);
    }
    
    console.log('Created', explosionFrames.length, 'fallback explosion frames');
}

// Load explosion frames
function loadExplosionFrames() {
    console.log('Loading explosion frames from individual sprite files...');
    
    explosionFrames = [];
    let loadedCount = 0;
    
    // Try to load individual explosion frame files
    for (let i = 1; i <= explosionFrameCount; i++) {
        const img = new Image();
        const filename = `img/explosion${i}.png`;
        
        img.onload = () => {
            console.log(`Loaded explosion frame ${i}: ${filename}`);
            explosionFrames[i - 1] = img; // Store in correct position
            loadedCount++;
            
            if (loadedCount === explosionFrameCount) {
                console.log('All explosion frames loaded successfully!');
            }
        };
        
        img.onerror = () => {
            console.warn(`Failed to load explosion frame ${i}: ${filename} - will create fallback`);
            loadedCount++;
            
            if (loadedCount === explosionFrameCount) {
                console.log('Some explosion frames failed to load - creating fallbacks');
                createFallbackExplosions();
            }
        };
        
        img.src = filename + '?t=' + Date.now(); // Add timestamp to prevent caching
    }
}

// Wave system functions
function initializeWaveSystem() {
    currentWave = 0;
    currentWaveEnemyIndex = -1;
    waveEnemiesSpawned = 0;
    startNewWave();
}

function startNewWave() {
    currentWave++;
    waveEnemiesSpawned = 0;
    specialFormationSpawnedThisWave = false; // Reset special formation tracker
    
    // Create shuffled array of available enemy indices
    availableEnemyIndices = [];
    for (let i = 0; i < enemySprites.length; i++) {
        availableEnemyIndices.push(i);
    }
    
    // Shuffle the array using Fisher-Yates algorithm
    for (let i = availableEnemyIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableEnemyIndices[i], availableEnemyIndices[j]] = [availableEnemyIndices[j], availableEnemyIndices[i]];
    }
    
    // Select the first enemy from the shuffled array for this wave
    currentWaveEnemyIndex = availableEnemyIndices[0];
    
    console.log(`Starting wave ${currentWave} with enemy sprite ${currentWaveEnemyIndex}`);
}

function getCurrentWaveEnemyIndex() {
    return currentWaveEnemyIndex;
}

function shouldSpawnBossForWave() {
    // Spawn boss after waveLength enemies have been spawned in current wave
    return waveEnemiesSpawned >= waveLength;
}

// Special Enemy V Formation System
function spawnSpecialEnemyFormation(lane) {
    console.log("Spawning special enemy V formation in lane", lane);
    
    const baseX = (lane * LANE_WIDTH) + (LANE_WIDTH / 2);
    const baseY = -CONFIG.OBSTACLE_HEIGHT;
    const spriteIndex = getCurrentWaveEnemyIndex();
    
    // Calculate special enemy size for proper centering
    const specialEnemySize = Math.floor(16 * CONFIG.SPECIAL_ENEMY_SCALE);
    
    // Create 3 enemies in V formation
    // Bottom enemy (center) - positioned at lane center
    const bottomEnemy = {
        x: baseX - (specialEnemySize / 2), // Center the special enemy in lane
        y: baseY,
        lane: lane,
        spriteIndex: spriteIndex,
        isSpecial: true,
        specialType: 'v-bottom',
        scale: CONFIG.SPECIAL_ENEMY_SCALE
    };
    
    // Top left enemy (left wing of V) - offset from center
    const leftEnemy = {
        x: baseX - (specialEnemySize / 2) - CONFIG.SPECIAL_ENEMY_H_SPACING,
        y: baseY - CONFIG.SPECIAL_ENEMY_V_SPACING,
        lane: lane,
        spriteIndex: spriteIndex,
        isSpecial: true,
        specialType: 'v-left',
        scale: CONFIG.SPECIAL_ENEMY_SCALE
    };
    
    // Top right enemy (right wing of V) - offset from center
    const rightEnemy = {
        x: baseX - (specialEnemySize / 2) + CONFIG.SPECIAL_ENEMY_H_SPACING,
        y: baseY - CONFIG.SPECIAL_ENEMY_V_SPACING,
        lane: lane,
        spriteIndex: spriteIndex,
        isSpecial: true,
        specialType: 'v-right',
        scale: CONFIG.SPECIAL_ENEMY_SCALE
    };
    
    // Add all three enemies to obstacles array
    obstacles.push(bottomEnemy, leftEnemy, rightEnemy);
    
    console.log("Spawned V formation with 3 special enemies");
    
    // Track that we spawned a special formation this wave
    waveEnemiesSpawned += 3; // Count as 3 enemies for wave progress
    lastSpawnTime = score;
}

function isFreeLaneSafeForSpawning() {
    if (!boss) return true;
    
    // Simplified logic - always allow spawning when boss exists
    // The boss hurtbox will clear any enemies beneath it
    return true;
}

// Explosion system functions
function createExplosion(x, y) {
    console.log(`Creating explosion at x: ${x}, y: ${y}`);
    explosions.push({
        x: x,
        y: y,
        frame: 0,
        frameTimer: 0
    });
    console.log(`Total explosions: ${explosions.length}`);
}

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].frameTimer++;
        
        // Advance to next frame when timer reaches duration
        if (explosions[i].frameTimer >= explosionFrameDuration) {
            explosions[i].frame++;
            explosions[i].frameTimer = 0;
            
            // Remove explosion when animation is complete
            if (explosions[i].frame >= explosionFrameCount) {
                explosions.splice(i, 1);
            }
        }
    }
}

function drawExplosions() {
    if (explosionFrames.length === 0) {
        //console.log('No explosion frames available');
        return;
    }
    
    //console.log(`Drawing ${explosions.length} explosions`);
    
    explosions.forEach(explosion => {
        if (explosion.frame < explosionFrames.length && explosionFrames[explosion.frame]) {
            const frame = explosionFrames[explosion.frame];
            
            if (!frame || frame.width === 0 || frame.height === 0) {
                //console.warn('Invalid explosion frame', explosion.frame);
                return;
            }
            
            //console.log(`Drawing explosion frame ${explosion.frame} at (${explosion.x}, ${explosion.y})`);
            
            // Scale explosion using configurable setting and ensure pixel-perfect rendering
            const scale = CONFIG.EXPLOSION_SCALE;
            const destWidth = Math.round(frame.width * scale);
            const destHeight = Math.round(frame.height * scale);
            const destX = Math.round(explosion.x - destWidth / 2);
            const destY = Math.round(explosion.y - destHeight / 2);
            
            // Enable crisp pixel rendering for pixel-perfect scaling
            ctx.imageSmoothingEnabled = false;
            
            // Draw the explosion frame with pixel-perfect scaling
            ctx.drawImage(frame, destX, destY, destWidth, destHeight);
            
            // Restore image smoothing for other elements
            ctx.imageSmoothingEnabled = true;
        }
    });
}

// Game loop
function gameLoop() {
    //console.log('Game loop running, gameState:', gameState);
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    if (gameState === 'playing') {
        updatePlayer();
        updateObstacles();
        updateBullet();
        updateBoss();
        updateExplosions();
        updateStars();
        checkCollisions();
        checkBulletCollisions();
        checkBulletAward();
        
        // Update difficulty scaling for highscore challengers
        updateDifficultyScaling();
        
        score += CONFIG.SCORE_PER_FRAME;
        gameSpeed += CONFIG.GAME_SPEED_INCREASE * difficultyMultiplier;
    }
}

// Update stars
function updateStars() {
    stars.forEach(star => {
        star.y += star.speed * gameSpeed;
        if (star.y > CANVAS_HEIGHT) {
            star.y = 0;
            star.x = Math.random() * CANVAS_WIDTH;
        }
    });
}

// Update stars for highscore display (very slow movement)
function updateStarsSlow() {
    stars.forEach(star => {
        star.y += star.speed * 0.1; // Very slow movement (10% of normal speed)
        if (star.y > CANVAS_HEIGHT) {
            star.y = 0;
            star.x = Math.random() * CANVAS_WIDTH;
        }
    });
}

// Update stars for menu (very slow movement)
function updateStarsVerySlow() {
    stars.forEach(star => {
        star.y += star.speed * 0.02; // Extremely slow movement (2% of normal speed)
        if (star.y > CANVAS_HEIGHT) {
            star.y = 0;
            star.x = Math.random() * CANVAS_WIDTH;
        }
    });
}

// Update player
function updatePlayer() {
    // Lane switching
    let laneChanged = false;
    if ((keys['ArrowLeft'] || keys['KeyA'] || touchLeft) && player.currentLane > 0) {
        player.currentLane--;
        player.targetX = (player.currentLane * LANE_WIDTH) + (LANE_WIDTH / 2) - (CONFIG.PLAYER_WIDTH / 2);
        keys['ArrowLeft'] = false;
        keys['KeyA'] = false;
        touchLeft = false;
        laneChanged = true;
        player.targetRotation = -CONFIG.PLAYER_ROTATE_MAX_ANGLE;
    }
    if ((keys['ArrowRight'] || keys['KeyD'] || touchRight) && player.currentLane < CONFIG.LANES - 1) {
        player.currentLane++;
        player.targetX = (player.currentLane * LANE_WIDTH) + (LANE_WIDTH / 2) - (CONFIG.PLAYER_WIDTH / 2);
        keys['ArrowRight'] = false;
        keys['KeyD'] = false;
        touchRight = false;
        laneChanged = true;
        player.targetRotation = CONFIG.PLAYER_ROTATE_MAX_ANGLE;
    }

    // Smooth movement to target lane position
    if (player.x !== player.targetX) {
        const diff = player.targetX - player.x;
        if (Math.abs(diff) > CONFIG.PLAYER_SPEED) {
            player.x += diff > 0 ? CONFIG.PLAYER_SPEED : -CONFIG.PLAYER_SPEED;
        } else {
            player.x = player.targetX;
        }
    }

    // Ease rotation toward targetRotation
    player.rotation += (player.targetRotation - player.rotation) * CONFIG.PLAYER_ROTATE_EASE_SPEED;
    // When player is close to lane, ease back to 0 (start easing earlier)
    if (!laneChanged && Math.abs(player.x - player.targetX) < CONFIG.PLAYER_SPEED * CONFIG.PLAYER_ROTATE_RETURN_DISTANCE) {
        player.targetRotation = 0;
    }
}

// Update obstacles
function updateObstacles() {
    // Boss spawning is now handled by wave system
    
    // Intelligent obstacle spawning
    if (shouldSpawnObstacle()) {
        let lane;
        
        // Special logic when boss is present
        if (boss) {
            // Check if spawning in free lane would create an impossible situation
            const isFreeLaneSafe = isFreeLaneSafeForSpawning();
            
            // Check if we can spawn in the free lane (max 1 enemy allowed AND safe position)
            const canSpawnInFreeLane = isFreeLaneSafe && 
                (!boss.enemyInFreeLane || 
                (boss.enemyInFreeLane && boss.enemyInFreeLane.y > CONFIG.OBSTACLE_HEIGHT + getCurrentSpacing()));
            
            if (canSpawnInFreeLane && Math.random() < 0.7) { // 70% chance to spawn in free lane
                lane = boss.freeLane;
            } else {
                // Spawn in a non-boss lane (if available)
                const availableLanes = [0, 1, 2].filter(l => !boss.lanes.includes(l) && l !== boss.freeLane);
                if (availableLanes.length > 0) {
                    lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
                } else {
                    // If no other lanes available, only spawn in free lane if it's safe
                    lane = isFreeLaneSafe ? boss.freeLane : null;
                }
            }
            
            // If no safe lane available, skip spawning this frame
            if (lane === null) {
                return;
            }
        } else {
            // Normal spawning when no boss
            lane = Math.floor(Math.random() * CONFIG.LANES);
        }
        
        // Check if there's enough space in this lane
        let currentSpacing = getCurrentSpacing();
        
        // Increase spacing when boss is present to ensure larger gaps
        if (boss) {
            currentSpacing *= 2.0; // Double the spacing when boss is present
        }
        
        const minSpacing = CONFIG.OBSTACLE_HEIGHT + currentSpacing;
        const hasSpace = !obstacles.some(obstacle => 
            obstacle.lane === lane && 
            obstacle.y > -minSpacing && 
            obstacle.y < minSpacing
        ) && !isBossBlockingLane(lane);
        
        if (hasSpace) {
            // Check if we should spawn special V formation (once per wave, 30% chance)
            const shouldSpawnSpecial = !specialFormationSpawnedThisWave && 
                                      Math.random() < CONFIG.SPECIAL_ENEMY_SPAWN_CHANCE &&
                                      (!boss || (boss && lane === boss.freeLane)); // Allow special formation in free lane when boss is present
            
            if (shouldSpawnSpecial) {
                // Spawn special V formation
                spawnSpecialEnemyFormation(lane);
                specialFormationSpawnedThisWave = true; // Mark as spawned for this wave
                console.log('Spawned special V formation at lane', lane);
            } else {
                // Spawn regular obstacle
                const newObstacle = {
                    x: (lane * LANE_WIDTH) + (LANE_WIDTH / 2) - (CONFIG.OBSTACLE_WIDTH / 2),
                    y: -CONFIG.OBSTACLE_HEIGHT,
                    lane: lane,
                    spriteIndex: getCurrentWaveEnemyIndex()
                };
                
                obstacles.push(newObstacle);
                waveEnemiesSpawned++;
                lastSpawnTime = score; // Track when we last spawned
                console.log('Spawned obstacle at lane', lane, 'Y:', -CONFIG.OBSTACLE_HEIGHT);
                
                // If this is in the boss's free lane, track it
                if (boss && lane === boss.freeLane) {
                    boss.enemyInFreeLane = newObstacle;
                }
            }
            
            // Check if wave is complete and we should spawn a boss
            if (shouldSpawnBossForWave() && !boss) {
                spawnBoss();
                lastBossScore = score; // Prevent automatic boss spawning
            }
        }
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].y += CONFIG.OBSTACLE_SPEED * gameSpeed;
        
        // Count enemies that have been dodged
        if (obstacles[i].y > player.y + CONFIG.PLAYER_HEIGHT && !obstacles[i].counted && !hasBullet) {
            enemiesDodged++;
            obstacles[i].counted = true;
        }
        
        // Remove off-screen obstacles
        if (obstacles[i].y > CONFIG.CANVAS_HEIGHT) {
            // If this was the enemy in the boss's free lane, clear the reference
            if (boss && boss.enemyInFreeLane === obstacles[i]) {
                boss.enemyInFreeLane = null;
            }
            obstacles.splice(i, 1);
        }
    }
    
    // Update boss
    updateBoss();
}

// Update bullet
function updateBullet() {
    if (bullet) {
        bullet.y -= CONFIG.BULLET_SPEED;
        
        // Remove bullet if it goes off screen
        if (bullet.y < -CONFIG.BULLET_HEIGHT) {
            bullet = null;
        }
    }
}

// Shooting function
function shoot() {
    if (hasBullet && !bullet) {
        bullet = {
            x: player.x + CONFIG.PLAYER_WIDTH / 2 - CONFIG.BULLET_WIDTH / 2,
            y: player.y,
            width: CONFIG.BULLET_WIDTH,
            height: CONFIG.BULLET_HEIGHT
        };
        hasBullet = false;
        updateFireButtonState(); // Update button state
    }
}

// Check collisions
function checkCollisions() {
    // Check regular obstacle collisions
    obstacles.forEach(obstacle => {
        let collision = false;
        
        // Use tight bounds if available for this specific sprite, otherwise fallback to full rectangle
        const boundsKey = `enemy${obstacle.spriteIndex}`;
        if (scaledSpriteBounds[boundsKey]) {
            const bounds = scaledSpriteBounds[boundsKey];
            
            // Calculate actual collision rectangle based on sprite bounds
            let obstacleCollisionX, obstacleCollisionY, obstacleCollisionWidth, obstacleCollisionHeight;
            
            if (obstacle.isSpecial) {
                // For special enemies, use their scaled bounds
                const specialScale = obstacle.scale || CONFIG.SPECIAL_ENEMY_SCALE;
                obstacleCollisionX = obstacle.x + (bounds.x * specialScale / ENEMY_SCALE);
                obstacleCollisionY = obstacle.y + (bounds.y * specialScale / ENEMY_SCALE);
                obstacleCollisionWidth = bounds.width * specialScale / ENEMY_SCALE;
                obstacleCollisionHeight = bounds.height * specialScale / ENEMY_SCALE;
            } else {
                // Regular enemies use normal bounds
                obstacleCollisionX = obstacle.x + bounds.x;
                obstacleCollisionY = obstacle.y + bounds.y;
                obstacleCollisionWidth = bounds.width;
                obstacleCollisionHeight = bounds.height;
            }
            
            collision = player.x < obstacleCollisionX + obstacleCollisionWidth &&
                       player.x + CONFIG.PLAYER_WIDTH > obstacleCollisionX &&
                       player.y < obstacleCollisionY + obstacleCollisionHeight &&
                       player.y + CONFIG.PLAYER_HEIGHT > obstacleCollisionY;
        } else {
            // Fallback to rectangle collision
            let obstacleWidth, obstacleHeight;
            
            if (obstacle.isSpecial) {
                // Special enemies are smaller
                obstacleWidth = Math.floor(CONFIG.OBSTACLE_WIDTH * 0.5);
                obstacleHeight = Math.floor(CONFIG.OBSTACLE_HEIGHT * 0.5);
            } else {
                obstacleWidth = CONFIG.OBSTACLE_WIDTH;
                obstacleHeight = CONFIG.OBSTACLE_HEIGHT;
            }
            
            collision = player.x < obstacle.x + obstacleWidth &&
                       player.x + CONFIG.PLAYER_WIDTH > obstacle.x &&
                       player.y < obstacle.y + obstacleHeight &&
                       player.y + CONFIG.PLAYER_HEIGHT > obstacle.y;
        }
        
        if (collision) {
            gameOver();
        }
    });

    // Check boss collision (boss doesn't get hurt by bullets)
    if (boss) {
        let collision = false;
        
        // Use tight bounds if available for the boss sprite
        const boundsKey = `boss${boss.spriteIndex}`;
        if (scaledSpriteBounds[boundsKey]) {
            const bounds = scaledSpriteBounds[boundsKey];
            
            // Calculate where the sprite is actually drawn (centered in boss bounds)
            const scaledWidth = Math.floor(16 * CONFIG.BOSS_SCALE);
            const scaledHeight = Math.floor(16 * CONFIG.BOSS_SCALE);
            const spriteX = boss.x + (boss.width - scaledWidth) / 2;
            const spriteY = boss.y + (boss.height - scaledHeight) / 2;
            
            // Collision bounds relative to sprite position
            const collisionX = spriteX + bounds.x;
            const collisionY = spriteY + bounds.y;
            
            collision = player.x < collisionX + bounds.width &&
                       player.x + CONFIG.PLAYER_WIDTH > collisionX &&
                       player.y < collisionY + bounds.height &&
                       player.y + CONFIG.PLAYER_HEIGHT > collisionY;
        } else {
            // Fallback to rectangle collision
            collision = player.x < boss.x + boss.width &&
                       player.x + CONFIG.PLAYER_WIDTH > boss.x &&
                       player.y < boss.y + boss.height &&
                       player.y + CONFIG.PLAYER_HEIGHT > boss.y;
        }
        
        if (collision) {
            gameOver();
        }
    }
}

// Check bullet collisions
function checkBulletCollisions() {
    if (bullet) {
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacle = obstacles[i];
            let collision = false;
            
            // Use tight bounds if available for this specific sprite, otherwise fallback to full rectangle
            const boundsKey = `enemy${obstacle.spriteIndex}`;
            if (scaledSpriteBounds[boundsKey]) {
                const bounds = scaledSpriteBounds[boundsKey];
                
                // Calculate actual collision rectangle based on sprite bounds
                let obstacleCollisionX, obstacleCollisionY, obstacleCollisionWidth, obstacleCollisionHeight;
                
                if (obstacle.isSpecial) {
                    // For special enemies, use their scaled bounds
                    const specialScale = obstacle.scale || CONFIG.SPECIAL_ENEMY_SCALE;
                    obstacleCollisionX = obstacle.x + (bounds.x * specialScale / ENEMY_SCALE);
                    obstacleCollisionY = obstacle.y + (bounds.y * specialScale / ENEMY_SCALE);
                    obstacleCollisionWidth = bounds.width * specialScale / ENEMY_SCALE;
                    obstacleCollisionHeight = bounds.height * specialScale / ENEMY_SCALE;
                } else {
                    // Regular enemies use normal bounds
                    obstacleCollisionX = obstacle.x + bounds.x;
                    obstacleCollisionY = obstacle.y + bounds.y;
                    obstacleCollisionWidth = bounds.width;
                    obstacleCollisionHeight = bounds.height;
                }
                
                collision = bullet.x < obstacleCollisionX + obstacleCollisionWidth &&
                           bullet.x + bullet.width > obstacleCollisionX &&
                           bullet.y < obstacleCollisionY + obstacleCollisionHeight &&
                           bullet.y + bullet.height > obstacleCollisionY;
            } else {
                // Fallback to rectangle collision
                let obstacleWidth, obstacleHeight;
                
                if (obstacle.isSpecial) {
                    // Special enemies are smaller
                    obstacleWidth = Math.floor(CONFIG.OBSTACLE_WIDTH * 0.5);
                    obstacleHeight = Math.floor(CONFIG.OBSTACLE_HEIGHT * 0.5);
                } else {
                    obstacleWidth = CONFIG.OBSTACLE_WIDTH;
                    obstacleHeight = CONFIG.OBSTACLE_HEIGHT;
                }
                
                collision = bullet.x < obstacle.x + obstacleWidth &&
                           bullet.x + bullet.width > obstacle.x &&
                           bullet.y < obstacle.y + obstacleHeight &&
                           bullet.y + bullet.height > obstacle.y;
            }
            
            if (collision) {
                // Calculate explosion position based on enemy type
                let explosionX, explosionY;
                
                if (obstacle.isSpecial) {
                    // For special enemies, center explosion on their actual position
                    const specialSize = Math.floor(CONFIG.OBSTACLE_WIDTH * 0.5);
                    explosionX = obstacle.x + specialSize / 2;
                    explosionY = obstacle.y + specialSize / 2;
                } else {
                    // For regular enemies, use standard center
                    explosionX = obstacle.x + CONFIG.OBSTACLE_WIDTH / 2;
                    explosionY = obstacle.y + CONFIG.OBSTACLE_HEIGHT / 2;
                }
                
                // Remove both bullet and obstacle
                obstacles.splice(i, 1);
                bullet = null;
                score += CONFIG.SCORE_PER_ENEMY_DESTROYED;
                createExplosion(explosionX, explosionY); // Center explosion
                break;
            }
        }
        
        // Check bullet-boss collision (bullet disappears but boss is unaffected)
        if (boss && bullet) {
            let collision = false;
            
            // Use tight bounds if available for the boss sprite
            const boundsKey = `boss${boss.spriteIndex}`;
            if (scaledSpriteBounds[boundsKey]) {
                const bounds = scaledSpriteBounds[boundsKey];
                
                // Calculate where the sprite is actually drawn (centered in boss bounds)
                const scaledWidth = Math.floor(16 * CONFIG.BOSS_SCALE);
                const scaledHeight = Math.floor(16 * CONFIG.BOSS_SCALE);
                const spriteX = boss.x + (boss.width - scaledWidth) / 2;
                const spriteY = boss.y + (boss.height - scaledHeight) / 2;
                
                // Collision bounds relative to sprite position
                const collisionX = spriteX + bounds.x;
                const collisionY = spriteY + bounds.y;
                
                collision = bullet.x < collisionX + bounds.width &&
                           bullet.x + CONFIG.BULLET_WIDTH > collisionX &&
                           bullet.y < collisionY + bounds.height &&
                           bullet.y + CONFIG.BULLET_HEIGHT > collisionY;
            } else {
                // Fallback to rectangle collision
                collision = bullet.x < boss.x + boss.width &&
                           bullet.x + CONFIG.BULLET_WIDTH > boss.x &&
                           bullet.y < boss.y + boss.height &&
                           bullet.y + CONFIG.BULLET_HEIGHT > boss.y;
            }
            
            if (collision) {
                // Remove bullet but boss is unaffected
                bullet = null;
                hasBullet = false;
                updateFireButtonState(); // Update button state
            }
        }
    }
}

// Check bullet award system
function checkBulletAward() {
    // Award bullet after dodging certain number of enemies
    if (enemiesDodged >= ENEMIES_FOR_BULLET && !hasBullet) {
        hasBullet = true;
        enemiesDodged = 0; // Reset counter
        updateFireButtonState(); // Update button state
    }
}

// Game over
async function gameOver() {
    gameState = 'nameInput';
    playerName = '';
    nameInputActive = true;
    await loadHighscores();
    playerPosition = getPlayerPosition(score);
    showNameInput();
}

// Reset game
function resetGame() {
    player.currentLane = 1;
    player.targetX = (player.currentLane * LANE_WIDTH) + (LANE_WIDTH / 2) - (CONFIG.PLAYER_WIDTH / 2);
    player.x = player.targetX;
    player.y = CONFIG.CANVAS_HEIGHT - 100;
    obstacles = [];
    boss = null; // Reset boss
    lastBossScore = 0; // Reset boss score tracking
    bullet = null;
    hasBullet = true;
    enemiesDodged = 0;
    score = 0;
    gameSpeed = 1;
    lastSpawnTime = 0; // Reset spawn timing
    
    // Clear explosions
    explosions = [];
    
    // Reset difficulty scaling
    difficultyMultiplier = 1.0;
    isChallengingHighscore = false;
    playerPersonalBest = 0;
    
    // Reset wave system
    initializeWaveSystem();
    
    // Reset special formation tracker
    specialFormationSpawnedThisWave = false;
    
    updateFireButtonState(); // Update button state
}

// Intelligent spawning system
function shouldSpawnObstacle() {
    // Dynamic minimum time between spawns based on game speed
    // As game speed increases, spawn more frequently to maintain enemy density
    const baseMinTime = CONFIG.MIN_TIME_BETWEEN_SPAWNS;
    const dynamicMinTime = Math.max(5, baseMinTime / Math.sqrt(gameSpeed)); // Minimum 5 frames between spawns
    
    // Check if enough time has passed since last spawn
    if (score - lastSpawnTime < dynamicMinTime) {
        return false;
    }
    
    // Base spawn rate with intelligent adjustments
    let spawnChance = CONFIG.OBSTACLE_SPAWN_RATE;
    
    // Increase spawn chance with game speed to maintain enemy density
    // As game speed increases, we need more enemies to keep the screen populated
    spawnChance *= Math.sqrt(gameSpeed); // Scale spawn chance with square root of game speed
    
    // Reduce spawn chance if player lane is crowded
    const playerLaneObstacles = obstacles.filter(obs => obs.lane === player.currentLane).length;
    if (playerLaneObstacles > 0) {
        spawnChance *= CONFIG.PLAYER_LANE_CROWD_REDUCTION;
    }
    
    // Increase spawn chance if player lane is empty
    if (playerLaneObstacles === 0) {
        spawnChance *= CONFIG.EMPTY_LANE_BONUS;
    }
    
    // Increase spawn chance if player has bullet
    if (hasBullet) {
        spawnChance *= CONFIG.BULLET_SPAWN_BONUS;
    }
    
    // Reduce spawn chance if spawned recently
    if (score - lastSpawnTime < CONFIG.MIN_TIME_BETWEEN_SPAWNS * 2) {
        spawnChance *= CONFIG.RECENT_SPAWN_REDUCTION;
    }
    
    // Dramatically increase spawn rate in challenge mode
    if (isChallengingHighscore) {
        spawnChance *= CONFIG.HIGHSCORE_CHALLENGE_SPAWN_MULTIPLIER;
    }
    
    return Math.random() < spawnChance;
}

function getCurrentSpacing() {
    // Start with larger spacing, gradually decrease over time
    const baseSpacing = CONFIG.BASE_SPACING; // Starting spacing
    const minSpacing = CONFIG.MIN_SPACING; // Minimum spacing
    const spacingDecreaseRate = CONFIG.SPACING_DECREASE_RATE; // How fast spacing decreases
    
    // Calculate current spacing based on game progress
    const progress = Math.min(score / 1000, 1); // Normalize to 0-1 over 1000 points
    let currentSpacing = baseSpacing - (baseSpacing - minSpacing) * progress * spacingDecreaseRate;
    
    // Reduce spacing as game speed increases to maintain visual density
    currentSpacing /= Math.sqrt(gameSpeed);
    
    // Make spacing much tighter in challenge mode
    if (isChallengingHighscore) {
        currentSpacing *= 0.5; // Half the spacing
    }
    
    return Math.max(minSpacing, currentSpacing);
}

// Check if free lane is safe for spawning (won't create impossible situation)
function isFreeLaneSafeForSpawning() {
    if (!boss) return true;
    
    // Simplified logic - always allow spawning when boss exists
    // The boss hurtbox will clear any enemies beneath it
    return true;
}

// Boss system functions
function spawnBoss() {
    console.log("spawnBoss: Spawning boss", {
        spritesLoaded: spritesLoaded,
        enemySpritesLength: enemySprites.length
    });
    
    // Boss spawns in lanes 0-1, leaving lane 2 free, OR lanes 1-2, leaving lane 0 free
    // This ensures there's always exactly 1 free lane for the player
    const bossLanePair = Math.random() < 0.5 ? [0, 1] : [1, 2];
    const freeLane = bossLanePair[0] === 0 ? 2 : 0; // Determine which lane is free
    
    // Remove space checking logic - boss will always spawn now
    // The hurtbox will handle clearing enemies beneath
    
    boss = {
        x: bossLanePair[0] * LANE_WIDTH, // Start at left edge of first lane
        y: -CONFIG.BOSS_HEIGHT,
        lanes: bossLanePair, // Which lanes the boss covers
        freeLane: freeLane, // Which lane is left free for player passage
        width: CONFIG.BOSS_WIDTH, // Exactly 2 lanes wide
        height: CONFIG.BOSS_HEIGHT,
        spriteIndex: getCurrentWaveEnemyIndex(), // Use current wave's enemy sprite
        // Add hurtbox properties
        hurtbox: {
            width: CONFIG.BOSS_HURTBOX_WIDTH,
            height: CONFIG.BOSS_HURTBOX_HEIGHT,
            offsetX: 0, // Centered horizontally with boss
            offsetY: CONFIG.BOSS_HEIGHT + CONFIG.BOSS_HURTBOX_OFFSET // Directly beneath boss
        }
    };
    
    console.log("spawnBoss: Boss created", boss);
}

function updateBoss() {
    if (boss) {
        // Use same speed calculation as normal obstacles (without difficulty multiplier)
        boss.y += CONFIG.BOSS_SPEED * gameSpeed;
        
        // Check hurtbox collision with enemies
        if (boss.hurtbox) {
            const hurtboxX = boss.x + boss.hurtbox.offsetX;
            const hurtboxY = boss.y + boss.hurtbox.offsetY;
            const hurtboxWidth = boss.hurtbox.width;
            const hurtboxHeight = boss.hurtbox.height;
            
            // Check collision with each obstacle
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obstacle = obstacles[i];
                
                // Check if obstacle collides with hurtbox
                if (obstacle.x < hurtboxX + hurtboxWidth &&
                    obstacle.x + CONFIG.OBSTACLE_WIDTH > hurtboxX &&
                    obstacle.y < hurtboxY + hurtboxHeight &&
                    obstacle.y + CONFIG.OBSTACLE_HEIGHT > hurtboxY) {
                    
                    // Remove the obstacle (destroyed by hurtbox)
                    // This should not count for bullet reload
                    obstacles.splice(i, 1);
                    
                    // Create explosion effect
                    const explosionX = obstacle.x + CONFIG.OBSTACLE_WIDTH / 2;
                    const explosionY = obstacle.y + CONFIG.OBSTACLE_HEIGHT / 2;
                    createExplosion(explosionX, explosionY);
                }
            }
        }
        
        // Check if boss passed player
        if (!boss.passedPlayer && boss.y > player.y) {
            boss.passedPlayer = true;
            if (!hasBullet) { // Only award if player doesn't have a bullet
                hasBullet = true; // Award bullet for dodging boss
                updateFireButtonState(); // Update button state
            }
        }
        
        // Remove boss if off-screen
        if (boss.y > CONFIG.CANVAS_HEIGHT) {
            boss = null;
            startNewWave(); // Start new wave when boss is defeated
        }
    }
}

function isFreeLaneSafeForSpawning() {
    if (!boss) return true;
    
    // Simplified logic - always allow spawning when boss exists
    // The boss hurtbox will clear any enemies beneath it
    return true;
}

function drawBoss() {
    if (boss) {
        if (spritesLoaded && enemySprites.length > 0 && boss.spriteIndex < enemySprites.length) {
            // Use sprite with pixel-perfect rendering
            const sprite = enemySprites[boss.spriteIndex];
            
            // Calculate scaled dimensions for boss
            const scaledWidth = Math.floor(16 * CONFIG.BOSS_SCALE);
            const scaledHeight = Math.floor(16 * CONFIG.BOSS_SCALE);
            
            // Center scaled sprite in boss position
            const drawX = boss.x + (boss.width - scaledWidth) / 2;
            const drawY = boss.y + (boss.height - scaledHeight) / 2;
            
            // Enable pixel-perfect rendering
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(sprite, drawX, drawY, scaledWidth, scaledHeight);
            ctx.imageSmoothingEnabled = true; // Reset for other elements
        } else {
            // Fallback to red rectangle
            ctx.fillStyle = CONFIG.BOSS_COLOR;
            ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
            
            // Draw boss health bar
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(boss.x + 20, boss.y + boss.height - 20, boss.width - 40, 10);
            
            // Draw boss outline
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(boss.x, boss.y, boss.width, boss.height);
        }
    }
}

function isBossBlockingLane(lane) {
    if (!boss) return false;
    return boss.lanes.includes(lane);
}

// Update fire button state based on bullet availability
function updateFireButtonState() {
    const shootBtn = document.getElementById('shoot-btn');
    const colors = CONFIG.BUTTON_COLORS;
    
    if (shootBtn) {
        if (hasBullet) {
            shootBtn.disabled = false;
            shootBtn.style.opacity = '1';
            shootBtn.style.cursor = colors.BUTTON_ENABLED_CURSOR;
            shootBtn.style.backgroundColor = colors.SHOOT_BUTTON_DEFAULT;
        } else {
            shootBtn.disabled = true;
            shootBtn.style.opacity = colors.BUTTON_DISABLED_OPACITY;
            shootBtn.style.cursor = colors.BUTTON_DISABLED_CURSOR;
            shootBtn.style.backgroundColor = colors.SHOOT_BUTTON_DISABLED;
        }
    }
}

// Apply configurable button styles to all buttons
function applyButtonStyles() {
    const colors = CONFIG.BUTTON_COLORS;
    
    // Set CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--left-button-default', colors.LEFT_BUTTON_DEFAULT);
    root.style.setProperty('--left-button-active', colors.LEFT_BUTTON_ACTIVE);
    root.style.setProperty('--right-button-default', colors.RIGHT_BUTTON_DEFAULT);
    root.style.setProperty('--right-button-active', colors.RIGHT_BUTTON_ACTIVE);
    root.style.setProperty('--shoot-button-default', colors.SHOOT_BUTTON_DEFAULT);
    root.style.setProperty('--shoot-button-active', colors.SHOOT_BUTTON_ACTIVE);
    root.style.setProperty('--shoot-button-disabled', colors.SHOOT_BUTTON_DISABLED);
    root.style.setProperty('--highscores-button-default', colors.HIGHSCORES_BUTTON_DEFAULT);
    root.style.setProperty('--highscores-button-hover', colors.HIGHSCORES_BUTTON_HOVER);
    root.style.setProperty('--back-button-default', colors.BACK_BUTTON_DEFAULT);
    root.style.setProperty('--back-button-hover', colors.BACK_BUTTON_HOVER);
    root.style.setProperty('--button-text-color', colors.BUTTON_TEXT_COLOR);
    root.style.setProperty('--button-disabled-opacity', colors.BUTTON_DISABLED_OPACITY);
    root.style.setProperty('--button-disabled-cursor', colors.BUTTON_DISABLED_CURSOR);
    root.style.setProperty('--button-enabled-cursor', colors.BUTTON_ENABLED_CURSOR);
    
    // Game control buttons
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const shootBtn = document.getElementById('shoot-btn');
    
    if (leftBtn) {
        leftBtn.style.color = colors.BUTTON_TEXT_COLOR;
        leftBtn.style.cursor = colors.BUTTON_ENABLED_CURSOR;
    }
    
    if (rightBtn) {
        rightBtn.style.color = colors.BUTTON_TEXT_COLOR;
        rightBtn.style.cursor = colors.BUTTON_ENABLED_CURSOR;
    }
    
    if (shootBtn) {
        shootBtn.style.color = colors.BUTTON_TEXT_COLOR;
        // Shoot button state will be handled by updateFireButtonState
    }
    
    // Navigation buttons
    const highscoresBtn = document.getElementById('highscores-btn');
    const backBtn = document.getElementById('back-btn');
    
    if (highscoresBtn) {
        highscoresBtn.style.color = colors.BUTTON_TEXT_COLOR;
        highscoresBtn.style.cursor = colors.BUTTON_ENABLED_CURSOR;
    }
    
    if (backBtn) {
        backBtn.style.color = colors.BUTTON_TEXT_COLOR;
        backBtn.style.cursor = colors.BUTTON_ENABLED_CURSOR;
    }
}

// Check if player should have increased difficulty (challenging their own highscore)
function updateDifficultyScaling() {
    // Only apply to players who are currently #1
    if (!isFirstPlacePlayer()) {
        difficultyMultiplier = 1.0;
        isChallengingHighscore = false;
        return;
    }
    
    // Get player's personal best
    const playerBest = getPlayerBestScore();
    if (!playerBest) {
        difficultyMultiplier = 1.0;
        isChallengingHighscore = false;
        return;
    }
    
    playerPersonalBest = playerBest.score;
    
    // Calculate how close they are to beating their record (percentage)
    const progressToRecord = score / playerPersonalBest;
    
    // If they're within the configured threshold of their record, make it much harder
    if (progressToRecord >= CONFIG.HIGHSCORE_CHALLENGE_THRESHOLD) {
        difficultyMultiplier = CONFIG.HIGHSCORE_CHALLENGE_MULTIPLIER;
        isChallengingHighscore = true;
    } else {
        difficultyMultiplier = 1.0;
        isChallengingHighscore = false;
    }
}

// Draw functions
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    if (gameState === 'menu') {
        drawMenu();
    } else if (gameState === 'playing') {
        drawGame();
    } else if (gameState === 'gameOver') {
        drawGame();
        drawGameOver();
    } else if (gameState === 'nameInput') {
        drawGame();
        // Add 50% black transparent overlay over the game
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawNameInput();
    } else if (gameState === 'highscoreDisplay') {
        drawHighscoreDisplay();
    }
}

function drawMenu() {
    // Clear canvas with black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw stars background with very slow movement
    ctx.fillStyle = '#fff';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, 1, 1);
    });
    
    // Update stars for very slow movement in menu
    updateStarsVerySlow();
    
    // Draw logo if loaded, otherwise fall back to text
    if (logoSprite && logoSprite.width > 0 && logoSprite.height > 0) {
        // Calculate logo size using configurable scale (pixel-perfect)
        const logoWidth = Math.round(logoSprite.width * CONFIG.LOGO_SCALE);
        const logoHeight = Math.round(logoSprite.height * CONFIG.LOGO_SCALE);
        const logoX = Math.round((CANVAS_WIDTH - logoWidth) / 2); // Centered horizontally
        const logoY = Math.round(CONFIG.LOGO_POSITION_FROM_TOP); // Configurable position from top
        
        // Enable pixel-perfect rendering for logo
        ctx.imageSmoothingEnabled = false;
        
        // Draw logo with pixel-perfect scaling
        ctx.drawImage(logoSprite, logoX, logoY, logoWidth, logoHeight);
        
        // Restore image smoothing for other elements
        ctx.imageSmoothingEnabled = true;
        
        //console.log(`Drawing logo: ${logoWidth}x${logoHeight} at position (${logoX}, ${logoY})`);
    } else {
        // Fallback to text if logo not loaded
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Space Evaders', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80);
    }
    
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Top Scores:', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
    
    for (let i = 0; i < Math.min(3, highscores.length); i++) {
        const hs = highscores[i];
        const y = CANVAS_HEIGHT / 2 - 20 + i * 20;
        
        // Highlight if this is the current player's score
        if (playerFingerprint && hs.playerFingerprint === playerFingerprint) {
            ctx.fillStyle = '#f5a95b'; // Green for player's score
        } else {
            ctx.fillStyle = '#fff';
        }
        
        ctx.textAlign = 'left';
        ctx.fillText(`${i + 1}. ${hs.name}`, CANVAS_WIDTH / 2 - 80, y);
        ctx.textAlign = 'right';
               ctx.fillText(hs.score.toString(), CANVAS_WIDTH / 2 + 80, y);
        ctx.textAlign = 'center';
    }
    
    // Draw player's best score and ranking if they have scores
    const playerBest = getPlayerBestScore();
    if (playerBest) {
        ctx.fillStyle = '#c75533'; // Cyan for player info
        ctx.font = '14px Arial';
        ctx.fillText(`Your Best: #${playerBest.ranking} - ${playerBest.score}`, CANVAS_WIDTH /  2, CANVAS_HEIGHT / 2 + 40);
    }
    
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    
    // Draw start button
    drawStartButton();
    
    // Draw highscore button
    drawHighscoreButton();
}

function drawStartButton() {
    const buttonWidth = 180;
    const buttonHeight = 50;
    const buttonX = CANVAS_WIDTH / 2 - buttonWidth / 2;
    const buttonY = CANVAS_HEIGHT / 2 + 60;
    
    // Check if mouse is hovering over button
    let isHovering = false;
    if (typeof mouseX !== 'undefined' && typeof mouseY !== 'undefined') {
        isHovering = mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
                     mouseY >= buttonY && mouseY <= buttonY + buttonHeight;
    }
    
    
    // Draw button background
   
    ctx.fillStyle = isHovering ? '#c75533' : '#95392c'; // Green on hover, blue normally
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Draw button border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Draw button text
    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('START GAME', CANVAS_WIDTH / 2, buttonY + buttonHeight / 2 + 6);
}

function drawHighscoreButton() {
    const buttonWidth = 150;
    const buttonHeight = 40;
    const buttonX = CANVAS_WIDTH / 2 - buttonWidth / 2;
    const buttonY = CANVAS_HEIGHT / 2 + 120; // Moved below start button
    
    // Check if mouse is hovering over button
    let isHovering = false;
    if (typeof mouseX !== 'undefined' && typeof mouseY !== 'undefined') {
        isHovering = mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
                     mouseY >= buttonY && mouseY <= buttonY + buttonHeight;
    }
    
    // Draw button background
    ctx.fillStyle = isHovering ? '#444' : '#333';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Draw button border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Draw button text
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('High Scores', CANVAS_WIDTH / 2, buttonY + buttonHeight / 2 + 5);
}

function drawPlayer() {
    if (spritesLoaded && shipSprite) {
        // Use ship sprite with pixel-perfect rendering
        const spriteWidth = PLAYER_WIDTH;
        const spriteHeight = PLAYER_HEIGHT;
        const centerX = player.x + spriteWidth / 2;
        const centerY = player.y + spriteHeight / 2;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(player.rotation);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            shipSprite,
            -spriteWidth / 2,
            -spriteHeight / 2,
            spriteWidth,
            spriteHeight
        );
        ctx.imageSmoothingEnabled = true;
        ctx.restore();
    } else {
        // Fallback to green rectangle with rotation
        const spriteWidth = PLAYER_WIDTH;
        const spriteHeight = PLAYER_HEIGHT;
        const centerX = player.x + spriteWidth / 2;
        const centerY = player.y + spriteHeight / 2;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(player.rotation);
        ctx.fillStyle = '#0f0';
        ctx.fillRect(-spriteWidth / 2, -spriteHeight / 2, spriteWidth, spriteHeight);
        ctx.restore();
       }
}

function drawObstacle(obstacle) {
    if (spritesLoaded && enemySprites.length > 0 && obstacle.spriteIndex < enemySprites.length) {
        // Use static sprite image with pixel-perfect rendering
        const sprite = enemySprites[obstacle.spriteIndex];

        // Check if this is a special enemy with custom scale
        const enemyScale = obstacle.isSpecial ? obstacle.scale : ENEMY_SCALE;
        
        // Calculate scaled dimensions for pixel-perfect rendering
        const scaledWidth = Math.floor(16 * enemyScale); // Original sprite is 16x16
        const scaledHeight = Math.floor(16 * enemyScale);

        // For special enemies, use their actual position and size
        let drawX, drawY, obstacleWidth, obstacleHeight;
        
        if (obstacle.isSpecial) {
            // Special enemies use their exact position and scaled size
            drawX = obstacle.x;
            drawY = obstacle.y;
            obstacleWidth = scaledWidth;
            obstacleHeight = scaledHeight;
        } else {
            // Regular enemies are centered in obstacle bounds
            drawX = obstacle.x + (OBSTACLE_WIDTH - scaledWidth) / 2;
            drawY = obstacle.y + (OBSTACLE_HEIGHT - scaledHeight) / 2;
            obstacleWidth = OBSTACLE_WIDTH;
            obstacleHeight = OBSTACLE_HEIGHT;
        }

        // Enable pixel-perfect rendering
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sprite, drawX, drawY, scaledWidth, scaledHeight);
        ctx.imageSmoothingEnabled = true; // Reset for other elements
        
        // Debug: Draw special enemy indicator (remove in production)
        if (obstacle.isSpecial && showDebugCollision) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 1;
            ctx.strokeRect(drawX, drawY, scaledWidth, scaledHeight);
        }
    } else {
        // Fallback to red rectangle
        ctx.fillStyle = '#f00';
        if (obstacle.isSpecial) {
            // Special enemies are smaller
            const specialSize = Math.floor(OBSTACLE_WIDTH * 0.5); // 50% of normal size
            ctx.fillRect(obstacle.x, obstacle.y, specialSize, specialSize);
        } else {
            ctx.fillRect(obstacle.x, obstacle.y, OBSTACLE_WIDTH, OBSTACLE_HEIGHT);
        }
    }
}

function drawGame() {
    // Draw stars
    ctx.fillStyle = '#fff';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, 1, 1);
    });
    
    // Draw lane indicators
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    
    for (let i = 1; i < LANES; i++) {
        ctx.beginPath();
        ctx.moveTo(i * LANE_WIDTH, 0);
        ctx.lineTo(i * LANE_WIDTH, CANVAS_HEIGHT);
        ctx.stroke();
    }
    
    ctx.setLineDash([]);
    
    // Draw player
    drawPlayer();
    
    // Draw obstacles
    obstacles.forEach(obstacle => {
        drawObstacle(obstacle);
    });
    
    // Draw boss
    drawBoss();
    
    // Draw bullet
    if (bullet) {
        ctx.fillStyle = '#f5a95b';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
    
    // Draw explosions
    drawExplosions();
    
    // Draw UI
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, CONFIG.SCORE_COUNTER_X_OFFSET, CONFIG.SCORE_COUNTER_Y_OFFSET);
    
    // Show challenge mode indicator
    if (isChallengingHighscore) {
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CHALLENGE MODE!', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);
        ctx.fillStyle = '#ff8888';
        ctx.font = '14px Arial';
        ctx.fillText('Beating your record: ' + Math.round((score / playerPersonalBest) + 100) + '%', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);
        ctx.textAlign = 'left'; // Reset alignment
    }
    
    // Draw bullet loading bar
    drawBulletLoadingBar();
}

// Draw debug collision boxes
function drawCollisionBoxes() {
    if (!showCollisionBoxes) return;
    
    ctx.strokeStyle = '#808080'; // Gray color
    ctx.lineWidth = 1;
    
    // Draw player collision box
    ctx.strokeRect(player.x, player.y, CONFIG.PLAYER_WIDTH, CONFIG.PLAYER_HEIGHT);
    
    // Draw enemy collision boxes
    obstacles.forEach(obstacle => {
        if (spriteBounds['enemy0'] || spriteBounds['enemy1']) {
            const bounds = spriteBounds['enemy0'] || spriteBounds['enemy1'];
            ctx.strokeRect(
                obstacle.x + bounds.x,
                obstacle.y + bounds.y,
                bounds.width,
                bounds.height
            );
        } else {
            // Fallback to full rectangle
            ctx.strokeRect(obstacle.x, obstacle.y, CONFIG.OBSTACLE_WIDTH, CONFIG.OBSTACLE_HEIGHT);
        }
    });
    
    // Draw bullet collision box
    if (bullet) {
        ctx.strokeRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
    
    // Draw boss collision box
    if (boss) {
        ctx.strokeRect(boss.x, boss.y, boss.width, boss.height);
    }
}

function drawBulletLoadingBar() {
    const barWidth = CONFIG.BULLET_BAR_WIDTH;
    const barHeight = 8;
    const barX = CONFIG.BULLET_COUNTER_X_OFFSET;
    const barY = CONFIG.BULLET_COUNTER_Y_OFFSET + 20; // Increased spacing to prevent overlap
    
    // Draw background bar
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Draw progress bar
    let progress = 0;
    if (hasBullet) {
        progress = 1; // Full bar when bullet is ready



        ctx.fillStyle = '#f5a95b'; // Yellow for ready
    } else {
               progress = enemiesDodged / ENEMIES_FOR_BULLET; // Progress toward next bullet
        ctx.fillStyle = '#f5a95b'; // Gray for loading
    }
    
    // Fill the progress bar
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    
    // Draw border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // Draw text label
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    if (hasBullet) {
        ctx.fillText('Bullet: Ready', barX, barY - 5);
    } else {
        ctx.fillText(`Bullet: ${enemiesDodged}/${ENEMIES_FOR_BULLET}`, barX, barY - 5);
    }
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', CANVAS_WIDTH / 2, CANVAS_WIDTH / 2 - 50);
    ctx.font = '16px Arial';
    ctx.fillText('Score: ' + score, CANVAS_WIDTH / 2, CANVAS_WIDTH / 2);
    ctx.fillText('High Score: ' + highScore, CANVAS_WIDTH / 2, CANVAS_WIDTH / 2 + 30);
    ctx.fillText('Press SPACE or Tap to Play Again', CANVAS_WIDTH / 2, CANVAS_WIDTH / 2 + 80);
}

function drawNameInput() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(50, CANVAS_HEIGHT / 2 - 80, CANVAS_WIDTH - 100, 140);
    
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Enter Your Name', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
    
    ctx.font = '16px Arial';
    ctx.fillText('Score: ' + score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    
    // Show player's personal high score instead of global high score
    const playerBest = getPlayerBestScore();
    const personalHighScore = playerBest ? playerBest.score : 0;
    ctx.fillStyle = '#bab7b2';
    ctx.fillText('Your High Score: ' + personalHighScore, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    
    // Draw input field background (visual only, HTML input handles text)
    ctx.fillStyle = '#222';
    ctx.fillRect(70, CANVAS_HEIGHT / 2 + 30, CANVAS_WIDTH - 140, 50);
    
    // Don't draw the name text here - let the HTML input handle it
    // The HTML input is positioned over this area
    
    // Draw cursor (optional visual indicator)
    if (nameInputActive) {
        // Simple cursor indicator - HTML input has its own cursor
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press Enter to submit', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
    }

    // Draw buttons
    const buttonWidth = 80;
    const buttonHeight = 30;
    const buttonY = CANVAS_HEIGHT / 2 + 110;

    // Submit button
    ctx.fillStyle = '#95392c';
    ctx.fillRect(CANVAS_WIDTH / 2 - buttonWidth - 50, buttonY, buttonWidth, buttonHeight);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('Submit', CANVAS_WIDTH / 2 - buttonWidth / 2 - 50, buttonY + 20);

    // Main Menu button
    ctx.fillStyle = '#c75533';
    ctx.fillRect(CANVAS_WIDTH / 2 - buttonWidth / 2, buttonY, buttonWidth, buttonHeight);
    ctx.fillStyle = '#fff';
    ctx.fillText('Menu', CANVAS_WIDTH / 2, buttonY + 20);

    // Restart button
    ctx.fillStyle = '#f5a95b';
    ctx.fillRect(CANVAS_WIDTH / 2 + 50, buttonY, buttonWidth, buttonHeight);
    ctx.fillStyle = '#fff';
    ctx.fillText('Restart', CANVAS_WIDTH / 2 + buttonWidth / 2 + 50, buttonY + 20);
}

function drawHighscoreDisplay() {
       // Clear canvas with black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw stars background
    ctx.fillStyle = '#fff';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, 1, 1);
    });
    
    // Update stars for slow movement
    updateStarsSlow();
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('High Scores', CANVAS_WIDTH / 2, 50);
    
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    
    if (highscores.length === 0) {
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('No high scores yet!', CANVAS_WIDTH / 2, 200);
    } else {
        // Always show top 5 scores
        const topScoresToShow = Math.min(5, highscores.length);
        for (let i = 0; i < topScoresToShow; i++) {
            const hs = highscores[i];
            const y = 100 + i * 30;
            
            // Special highlighting for first place
            if (i === 0) {
                ctx.fillStyle = '#C75533'; // Gold color for first place
                //ctx.fillText('👑', 35, y); // Crown emoji for first place
            }
            
            // Highlight player's score
            if (hs.name === playerName.trim() && hs.score === score) {
                ctx.fillStyle = '#aac39e';
            } else if (i === 0) {
                ctx.fillStyle = '#f5a95b'; // Keep gold for first place
            } else {
                ctx.fillStyle = '#fff';
            }
            
            ctx.fillText((i + 1) + '. ' + hs.name, 50, y);
            ctx.textAlign = 'right';
            ctx.fillText(hs.score, CANVAS_WIDTH - 50, y);
        ctx.textAlign = 'left';
        }
        
        // If there are more than 5 scores, show scrollable area
        if (highscores.length > 5) {
            drawScrollableHighscores();
        }
    }
    
    // Draw back button
    drawBackButton();
}

// Draw scrollable high scores area
function drawScrollableHighscores() {
    const scrollAreaY = 100 + 5 * 30 + 20; // Start after top 5 + spacing
    const scrollAreaHeight = CANVAS_HEIGHT - scrollAreaY - 120; // Leave space for buttons
    const scrollItemHeight = 25; // Smaller text for scrollable area
    
    // Draw scrollable area background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(30, scrollAreaY, CANVAS_WIDTH - 60, scrollAreaHeight);
    
    // Draw border
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, scrollAreaY, CANVAS_WIDTH - 60, scrollAreaHeight);
    
    // Draw scroll indicator text
    ctx.fillStyle = '#aaa';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Scroll for more scores', CANVAS_WIDTH / 2, scrollAreaY + 15);
    
    // Calculate visible range
    const startIndex = 5 + Math.floor(highscoreScrollOffset / scrollItemHeight);
    const visibleItems = Math.floor((scrollAreaHeight - 25) / scrollItemHeight);
    const endIndex = Math.min(highscores.length, startIndex + visibleItems);
    
    // Draw scrollable scores
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    
    for (let i = startIndex; i < endIndex; i++) {
        const hs = highscores[i];
        const relativeIndex = i - startIndex;
        const y = scrollAreaY + 30 + relativeIndex * scrollItemHeight;
        
        // Highlight player's score
        if (hs.name === playerName.trim() && hs.score === score) {
            ctx.fillStyle = '#0f0';
        } else {
            ctx.fillStyle = '#ccc';
        }
        
        ctx.fillText((i + 1) + '. ' + hs.name, 50, y);
        ctx.textAlign = 'right';
               ctx.fillText(hs.score, CANVAS_WIDTH - 50, y);
        ctx.textAlign = 'left';
    }
    
    // Draw scroll bar if needed
    const totalScrollableItems = highscores.length - 5;
    if (totalScrollableItems > visibleItems) {
        const scrollBarHeight = (visibleItems / totalScrollableItems) * (scrollAreaHeight - 40);
        const scrollBarY = scrollAreaY + 20 + (highscoreScrollOffset / (totalScrollableItems * scrollItemHeight)) * (scrollAreaHeight - 40 - scrollBarHeight);
        
                ctx.fillStyle = '#666';
        ctx.fillRect(CANVAS_WIDTH - 25, scrollBarY, 8, scrollBarHeight);
       }
}

// Draw back button for highscore display
function drawBackButton() {
    const buttonWidth = 120;
   
    const buttonHeight = 35;
    const buttonX = CANVAS_WIDTH /  2 - buttonWidth / 2; // Centered again
    const buttonY = CANVAS_HEIGHT - 80;
    
    // Check if mouse is hovering over button
    let isHovering = false;
    if (typeof mouseX !== 'undefined' && typeof mouseY !== 'undefined') {
        isHovering = mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
                     mouseY >= buttonY && mouseY <= buttonY + buttonHeight;
    }
    
    // Draw button background
    ctx.fillStyle = isHovering ? '#444' : '#333';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Draw button border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Draw button text
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Back to Menu', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2 +  4);
}

// Name input functions
function showNameInput() {
    nameInputElement.style.display = 'block';
    nameInputElement.value = playerName;
    nameInputElement.focus();
    
    // Force keyboard to show on mobile
    if ('ontouchstart' in window) {
        nameInputElement.click();
    }
}

function hideNameInput() {
    nameInputElement.style.display = 'none';
    nameInputElement.blur();
}

// Setup name input handling
function setupNameInput() {
    nameInputElement.addEventListener('input', (e) => {
        playerName = e.target.value;
    });
    
    // Add keyboard event listener for Enter key
    nameInputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            submitName();
        }
    });
}

// Submit name and save highscore
function submitName() {
    // Check if a name was actually entered
    const trimmedName = playerName.trim();
    if (!trimmedName) {
        // No name entered, don't save the highscore
        hideNameInput();
        return;
    }
    
    // Save the highscore with the entered name
    addHighscore(trimmedName, score);
    
    // Hide the name input
    hideNameInput();
    
    // Reset name input state
    nameInputActive = false;
    
    // Return to menu
    gameState = 'menu';
}

// Go to main menu without saving
function goToMainMenu() {
    // Hide the name input
    hideNameInput();
    
    // Reset name input state
    nameInputActive = false;
    
    // Return to menu
    gameState = 'menu';
}

// Restart the game
function restartGame() {
    // Hide the name input
    hideNameInput();
    
    // Reset name input state
    nameInputActive = false;
    
    // Reset and start game
    resetGame();
    gameState = 'playing';
}

// Highscore management
async function loadHighscores() {
    console.log('🔄 loadHighscores called');
    
    // First test if server is responding at all
    try {
        console.log('🧪 Testing server connectivity...');
        const testResponse = await fetch('/', { method: 'HEAD' });
       
        console.log('🏠 Server root response:', testResponse.status);
    } catch (testError) {
        console.error('🚫 Server not responding at all:', testError);
    }
    
    try {
        console.log('🌐 Fetching from /api/highscores...');
        const response = await fetch('/api/highscores?t=' + Date.now(), {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error('Failed to load highscores - status: ' + response.status);
        }
        
        const data = await response.json();
        console.log('📦 Received data:', data);
        console.log('🏆 Highscores array:', data.highscores);
        console.log('📊 Highscores length:', data.highscores ? data.highscores.length : 'undefined');
        
        highscores = data.highscores || [];
        console.log('✅ Final highscores array:', highscores);
    } catch (error) {
        console.error('❌ Error loading highscores:', error);
        // Fallback to localStorage if server fails
        try {
            const saved = localStorage.getItem('spaceEvadersHighscores');
            if (saved) {
                highscores = JSON.parse(saved);
                console.log('💾 Loaded from localStorage:', highscores.length, 'entries');
            } else {
                highscores = [];
                console.log('📭 No highscores in localStorage');
            }
        } catch (fallbackError) {
            console.error('❌ Fallback failed:', fallbackError);
            highscores = [];
        }
    }
}

// Highscore management
async function addHighscore(name, score) {
    // Generate fingerprint if not already done
    if (!playerFingerprint) {
        generatePlayerFingerprint();
    }
    
    const newHighscore = {
        name: name,
        score: score,
        date: new Date().toISOString(),
        playerFingerprint: playerFingerprint
    };
    
    try {
        const response = await fetch('/api/highscores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            body: JSON.stringify(newHighscore)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save highscore');
        }
        
        // Reload highscores from server to get the updated list
        await loadHighscores();
    } catch (error) {
        console.error('Error saving highscore:', error);
        // Fallback to localStorage if server fails
        highscores.push(newHighscore);
        highscores.sort((a, b) => b.score - a.score);
        highscores = highscores.slice(0, 10);
        try {
            localStorage.setItem('spaceEvadersHighscores', JSON.stringify(highscores));
        } catch (fallbackError) {
            console.error('Fallback failed:', fallbackError);
        }
    }
}

function getPlayerPosition(score) {
    let position =  1;
    for (let i = 0; i < highscores.length; i++) {
        if (score <= highscores[i].score) {
            position = i + 1;
        } else {

            break;
        }
    }
    return position;
}

// Player fingerprint generation for unique identification
function generatePlayerFingerprint() {
    // Try to get existing fingerprint from localStorage first
    let storedFingerprint = localStorage.getItem('spaceEvadersDeviceId');
    
    if (storedFingerprint) {
        playerFingerprint = storedFingerprint;
        return;
    }
    
    try {
        // Generate a new device fingerprint based on hardware/software characteristics
        const fingerprint = {
            screen: screen ? `${screen.width}x${screen.height}x${screen.colorDepth}` : 'unknown',
            timezone: 'unknown',
            language: navigator ? navigator.language : 'unknown',
            platform: navigator ? navigator.platform : 'unknown',
            userAgent: navigator ? navigator.userAgent.substring(0, 100) : 'unknown', // Limit length
            timestamp: Date.now() // Add timestamp for uniqueness
        };
        
        // Try to get timezone
        try {
            fingerprint.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (e) {
            // Keep default 'unknown'
        }
        
        // Create a hash-like identifier from the fingerprint data
        const fingerprintString = JSON.stringify(fingerprint);
        let hash = 0;
        for (let i = 0; i < fingerprintString.length; i++) {
            const char = fingerprintString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Convert hash to a positive 8-character hex string
        playerFingerprint = Math.abs(hash).toString(16).substring(0, 8).padStart(8, '0');
    } catch (e) {
        // Fallback: generate a random fingerprint if everything fails

        console.warn('Fingerprint generation failed, using fallback:', e);
        playerFingerprint = 'fallback_' + Math.random().toString(36).substring(2, 10);
    }
    
    // Store it in localStorage for future sessions
    try {
        localStorage.setItem('spaceEvadersDeviceId', playerFingerprint);
    } catch (e) {
               console.warn('Could not store device ID in localStorage:', e);
    }
}

function getPlayerIdentifier() {
    if (!playerFingerprint) {
        generatePlayerFingerprint();
    }
    return playerFingerprint;
}

// Get the device ID of the current first place player
function getFirstPlacePlayerId() {
   
    if (highscores.length > 0) {
        return highscores[0].playerFingerprint;
    }
    return null;
}

// Check if current player is the first place player
function isFirstPlacePlayer() {
    const firstPlaceId = getFirstPlacePlayerId();
    return firstPlaceId && playerFingerprint === firstPlaceId;
}

// Get player's best score and ranking
function getPlayerBestScore() {
    if (!playerFingerprint || highscores.length === 0) {
        return null;
    }
    
    // Find all scores for this player
    const playerScores = highscores.filter(hs => hs.playerFingerprint === playerFingerprint);
    
    if (playerScores.length === 0) {
        return null;
    }
    
    // Get the best (highest) score
    const bestScore = Math.max(...playerScores.map(hs => hs.score));
    
    // Find the ranking of this best score
    let ranking = 1;
    for (const hs of highscores) {
        if (hs.score > bestScore) {
            ranking++;
        } else if (hs.score === bestScore && hs.playerFingerprint !== playerFingerprint) {
            // If same score but different player, this player ranks lower
            ranking++;
        }
    }
    
    return {
        score: bestScore,
        ranking: ranking
    };
}

// Pixel-perfect collision detection system
let spriteCollisionMasks = {};
let spriteBounds = {}; // Store tight collision bounds
let scaledSpriteBounds = {}; // Store scaled collision bounds

// Generate collision mask from sprite image data
function generateCollisionMask(image, threshold = 128) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const mask = {
        width: canvas.width,
        height: canvas.height,
        pixels: []
    };
    
    // Create boolean mask where true = solid pixel (not transparent)
    for (let y = 0; y < canvas.height; y++) {
        mask.pixels[y] = [];
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const alpha = data[index + 3]; // Alpha channel
            mask.pixels[y][x] = alpha > threshold; // Consider pixel solid if alpha > threshold
        }
    }
    
    return mask;
}

// Calculate tight bounding rectangle based on sprite pixels
function calculateSpriteBounds(image, threshold = 128) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let minX = canvas.width;
       let maxX = 0;
    let minY = canvas.height;
    let maxY = 0;
    let hasPixels = false;
    
    // Find the bounding box of non-transparent pixels
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const alpha = data[index + 3]; // Alpha channel
            
            if (alpha > threshold) { // Consider pixel solid
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
                hasPixels = true;
            }
        }
    }

    
    return {
        x: minX,
        y: minY,
        width: maxX - minX +  1,
        height: maxY - minY + 1
    };
}

// Check pixel-perfect collision between two sprites
function checkPixelCollision(mask1, mask1_ref, x1, y1, mask2, mask2_ref, x2, y2) {
    // First do a quick bounding box check
    const bounds1 = getSpriteBounds(mask1, x1, y1);
   
    const bounds2 = getSpriteBounds(mask2, x2, y2);
    
    if (!rectanglesOverlap(bounds1, bounds2)) {
        return false;
    }
    
    // Check overlapping pixels
    const overlap = getOverlapRegion(bounds1, bounds2);
    
    for (let y = overlap.y1; y < overlap.y2; y++) {
        for (let x = overlap.x1; x < overlap.x2; x++) {
            // Convert world coordinates to sprite local coordinates
            const localX1 = x - x1;
            const localY1 = y - y1;
            const localX2 = x - x2;
            const localY2 = y - y2;
            
            // Check bounds and pixel data existence
            if (localX1 >= 0 && localX1 < mask1.width && localY1 >= 0 && localY1 < mask1.height &&
                localX2 >= 0 && localX2 < mask2.width && localY2 >= 0 && localY2 < mask2.height &&
                mask1.pixels && mask1.pixels[localY1] && mask1.pixels[localY1][localX1] !== undefined &&
                mask2.pixels && mask2.pixels[localY2] && mask2.pixels[localY2][localX2] !== undefined) {
                
                if (mask1.pixels[localY1][localX1] && mask2.pixels[localY2][localX2]) {
                    return true; // Collision detected
                }
            }
        }
    }
    
    return false;
}

// Get bounding box of non-transparent pixels
function getSpriteBounds(mask, worldX, worldY) {
    let minX = mask.width;
    let maxX = 0;
    let minY = mask.height;
    let maxY = 0;
    
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

    
    return {
        x: worldX + minX,
        y: worldY + minY,
        width: maxX - minX + 1,
       
        height: maxY - minY + 1
    };
}

// Check if two rectangles overlap
function rectanglesOverlap(rect1, rect2) {
    return !(rect1.x + rect1.width < rect2.x ||
             rect2.x + rect2.width < rect1.x ||
             rect1.y + rect1.height < rect2.y ||
             rect2.y + rect2.height < rect1.y);
}

// Get the overlapping region between two rectangles
function getOverlapRegion(rect1, rect2) {
    const x1 = Math.max(rect1.x, rect2.x);
    const y1 = Math.max(rect1.y, rect2.y);
    const x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
    const y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);
    
    return { x1, y1, x2, y2 };
}

// Create a rectangular collision mask (all pixels solid)
function createRectangularMask(width, height) {
    const pixels = [];
    for (let y = 0; y < height; y++) {
        pixels[y] = [];
               for (let x = 0; x < width; x++) {
            pixels[y][x] = true; // All pixels are solid for rectangular collision
        }
    }
    return pixels;
}

// Get the maximum scroll offset for highscore display
function getMaxHighscoreScrollOffset() {
    if (highscores.length <= 5) return 0;
    
    const scrollAreaY = 100 + 5 * 30 + 20; // Start after top 5 + spacing
    const scrollAreaHeight = CANVAS_HEIGHT - scrollAreaY - 120; // Leave space for buttons
    const scrollItemHeight = 25; // Smaller text for scrollable area
    
    // Calculate the values needed for max scroll calculation
    const totalScrollableItems = highscores.length - 5;
    const visibleItems = Math.floor((scrollAreaHeight - 25) / scrollItemHeight);
    
    // Max scroll should allow the last score to be at the bottom of the visible area
    return Math.max(0, (totalScrollableItems - visibleItems) * scrollItemHeight);
}

// Initialize
window.addEventListener('load', init);