import GameScene from "./scenes/game";
import PreloadScene from "./scenes/preload";

var config = {
    type: Phaser.AUTO,
    parent: 'body',
    width: 400,
    height: 600,
    backgroundColor: "#6cc851",
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scale: {
        mode: Phaser.Scale.MAX_ZOOM,
    },
    scene: [PreloadScene, GameScene], // Include the preload scene and other scenes
};

export default config;