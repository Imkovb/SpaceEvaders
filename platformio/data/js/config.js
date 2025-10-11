// Centralized game configuration
export const CONFIG = {
    // Player Rotation Settings
    PLAYER_ROTATE_MAX_ANGLE: Math.PI / 8,
    PLAYER_ROTATE_EASE_SPEED: 0.1,
    PLAYER_ROTATE_RETURN_DISTANCE: 8,
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
    CHALLENGE_MODE_X_OFFSET: 250,
    CHALLENGE_MODE_Y_OFFSET: 30,
    BULLET_BAR_WIDTH: 80,
    // Sprite Settings
    ENEMY_SCALE: 3.5,
    BOSS_SCALE: 16.0,
    // Special Enemy V Formation Settings
    SPECIAL_ENEMY_SCALE: 2.2,
    SPECIAL_ENEMY_V_SPACING: 25,
    SPECIAL_ENEMY_H_SPACING: 25,
    SPECIAL_ENEMY_SPAWN_CHANCE: 0.3,
    // Dynamic Spacing Settings
    BASE_SPACING: 150,
    MIN_SPACING: 40,
    SPACING_DECREASE_RATE: 0.1,
    // Intelligent Spawning Settings
    MIN_TIME_BETWEEN_SPAWNS: 15,
    MIN_TIME_BETWEEN_SPAWNS_MIN_FRAMES: 3,
    MIN_TIME_BETWEEN_SPAWNS_SPEED_POWER: 0.85,
    MIN_TIME_BETWEEN_SPAWNS_SPEED_BONUS: 0.5,
    PLAYER_LANE_SPAWN_WEIGHT: 1.25,
    PLAYER_LANE_CROWD_REDUCTION: 0.5,
    EMPTY_LANE_BONUS: 1.6,
    BULLET_SPAWN_BONUS: 1.6,
    RECENT_SPAWN_REDUCTION: 0.3,
    // Boss Settings
    BOSS_WIDTH: 200,
    BOSS_HEIGHT: 200,
    BOSS_SPAWN_CHANCE: 0.005,
    BOSS_SPEED: 2, // Same as OBSTACLE_SPEED to match enemy speed
    BOSS_COLOR: '#FF0000',
    // Boss Hurtbox Settings
    BOSS_HURTBOX_HEIGHT: 100,
    BOSS_HURTBOX_WIDTH: 200,
    BOSS_HURTBOX_OFFSET: 0,
    // Safety gap to keep special (3-mini) enemies away from the boss vertically (in free lane)
    // This reduces unwinnable situations where the player cannot clear all three before passing the boss
    BOSS_FREE_LANE_SPECIAL_SAFE_GAP: 220,
    // Highscore Challenge Settings
    HIGHSCORE_CHALLENGE_THRESHOLD: 0.85,
    HIGHSCORE_CHALLENGE_MULTIPLIER: 3.0, // Reduced from 12.0 for better balance
    HIGHSCORE_CHALLENGE_SPAWN_MULTIPLIER: 3.0, // Reduced from 20.0 for playability
    // Explosion Settings
    EXPLOSION_FRAME_DURATION_MS: 67,
    EXPLOSION_SCALE: 1.5,
    // Logo Settings
    LOGO_SCALE: 3.0,
    LOGO_POSITION_FROM_TOP: 50,
    // Button Color Settings
    BUTTON_COLORS: {
        LEFT_BUTTON_DEFAULT: '#343230',
        LEFT_BUTTON_ACTIVE: '#343230',
        RIGHT_BUTTON_DEFAULT: '#343230',
        RIGHT_BUTTON_ACTIVE: '#343230',
        SHOOT_BUTTON_DEFAULT: 'rgba(149, 57, 44, 1)',
        SHOOT_BUTTON_ACTIVE: '#a00',
        SHOOT_BUTTON_DISABLED: '#1b2026',
        HIGHSCORES_BUTTON_DEFAULT: '#0d4776ff',
        HIGHSCORES_BUTTON_HOVER: '#1976D2',
        BACK_BUTTON_DEFAULT: '#f44336',
        BACK_BUTTON_HOVER: '#d32f2f',
        BUTTON_TEXT_COLOR: '#fff',
        BUTTON_DISABLED_OPACITY: '0.5',
        BUTTON_DISABLED_CURSOR: 'not-allowed',
        BUTTON_ENABLED_CURSOR: 'pointer'
    }
};

// Export a few derived constants for convenience
export const ENEMY_SCALE = CONFIG.ENEMY_SCALE;
export const ENEMIES_FOR_BULLET = CONFIG.ENEMIES_FOR_BULLET;
