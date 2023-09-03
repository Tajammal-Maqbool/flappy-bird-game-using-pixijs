import { sound } from '@pixi/sound';
import * as PIXI from 'pixi.js';

// Constants for the game
const GROUND_SPEED = 3.5;
const GROUND_WIDTH = 336;
const GROUND_HEIGHT = 112;
const PIPE_WIDTH = 52;
const MIN_PIPE_HEIGHT = 80;
const MAX_PIPE_HEIGHT = 200;
const PIPE_SPAWN_INTERVAL = 2000;
const PIPE_SPEED = 3.5;
const GRAVITY = 0.2;
const JUMP_FORCE = 4;
const BIRD_JUMP_INTERVAL = 100;

export default function Game(birdColor) {
    const app = new PIXI.Application({
        backgroundColor: 0x6cc851,
        antialias: true,
        width: 400,
        height: 600,
    });
    document.body.appendChild(app.view);

    let isStarted = false;
    let isGameOver = false;
    let bird = null;
    let canJump = true;
    let lastBirdJump = 0;
    let groundsContainer = null;
    let pipesContainer = null;
    let score = 0;
    let scoreContainer = null;
    let isPipeSpawn = false;
    let lastPipeSpawnTime = 0;
    let isAddedIntoDatabase = false;
    let textures = null;

    function loadAssets() {
        sound.removeAll();
        PIXI.Assets.cache.reset();
        PIXI.Assets.reset();

        // general sprites
        PIXI.Assets.add('background', '/sprites/background.png');
        PIXI.Assets.add('ground', '/sprites/ground.png');
        PIXI.Assets.add('gameready', '/sprites/gameready.png');
        PIXI.Assets.add('pipe', '/sprites/pipe.png');
        PIXI.Assets.add('gameover', '/sprites/gameover.png');

        // digits sprites
        PIXI.Assets.add('0', '/sprites/0.png');
        PIXI.Assets.add('1', '/sprites/1.png');
        PIXI.Assets.add('2', '/sprites/2.png');
        PIXI.Assets.add('3', '/sprites/3.png');
        PIXI.Assets.add('4', '/sprites/4.png');
        PIXI.Assets.add('5', '/sprites/5.png');
        PIXI.Assets.add('6', '/sprites/6.png');
        PIXI.Assets.add('7', '/sprites/7.png');
        PIXI.Assets.add('8', '/sprites/8.png');
        PIXI.Assets.add('9', '/sprites/9.png');

        // birds sprites
        PIXI.Assets.add('bluebird-0', '/sprites/bluebird-downflap.png');
        PIXI.Assets.add('bluebird-1', '/sprites/bluebird-midflap.png');
        PIXI.Assets.add('bluebird-2', '/sprites/bluebird-upflap.png');
        PIXI.Assets.add('redbird-0', '/sprites/redbird-downflap.png');
        PIXI.Assets.add('redbird-1', '/sprites/redbird-midflap.png');
        PIXI.Assets.add('redbird-2', '/sprites/redbird-upflap.png');
        PIXI.Assets.add('yellowbird-0', '/sprites/yellowbird-downflap.png');
        PIXI.Assets.add('yellowbird-1', '/sprites/yellowbird-midflap.png');
        PIXI.Assets.add('yellowbird-2', '/sprites/yellowbird-upflap.png');

        // audio
        sound.add('die', '/audio/die.wav');
        sound.add('hit', '/audio/hit.wav');
        sound.add('point', '/audio/point.wav');
        sound.add('swoosh', '/audio/swoosh.wav');
        sound.add('wing', '/audio/wing.wav');

        // Load the assets and get a resolved promise once both are loaded
        const texturesPromise = PIXI.Assets.load(['background', 'ground', 'gameready', 'pipe', 'gameover', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'bluebird-0', 'bluebird-1', 'bluebird-2', 'redbird-0', 'redbird-1', 'redbird-2', 'yellowbird-0', 'yellowbird-1', 'yellowbird-2', 'die', 'hit', 'point', 'swoosh', 'wing']);

        // When the promise resolves, we have the texture!
        texturesPromise.then((newTextures) => {
            // start the game
            initGame(newTextures);
        });
    }

    // Load assets 
    loadAssets();

    function initGame(newTextures) {
        // Save the textures
        textures = newTextures;

        // Create initial game objects
        createBackground();
        createGameReady();

        // Listen for pointerdown event
        app.view.addEventListener('pointerdown', handleOnPointerDown);

        // Start the game loop
        app.ticker.add(delta => {
            updateGame(delta);
        });
    }

    function createBackground() {
        // Create the background sprite
        const background = new PIXI.Sprite(textures['background']);
        background.width = app.view.width;
        background.height = app.view.height;

        // add into stage
        app.stage.addChild(background);
    }

    function createGameReady() {
        // Create the game ready sprite
        const gameReady = new PIXI.Sprite(textures['gameready']);
        gameReady.anchor.set(0.5);
        gameReady.x = app.view.width / 2;
        gameReady.y = app.view.height / 2;
        gameReady.scale.set(1.6);
        gameReady.name = 'gameReady';

        // add into stage
        app.stage.addChild(gameReady);
    }

    function handleOnPointerDown() {
        if (!isStarted) {
            isStarted = true;
            startGame();

            // Remove game ready sprite
            const gameReady = app.stage.getChildByName('gameReady');
            app.stage.removeChild(gameReady);
        } else {
            if (!isGameOver) {
                // Play wing sound
                sound.play("wing")

                if (canJump && Date.now() - lastBirdJump > BIRD_JUMP_INTERVAL) {
                    if (bird.vy > 0) {
                        bird.vy = 0;
                        bird.vy -= JUMP_FORCE;
                    } else if (bird.vy > -2) {
                        bird.vy -= JUMP_FORCE * 0.6;
                    }
                    else if (bird.vy > -4) {
                        bird.vy -= JUMP_FORCE * 0.2;
                    }
                    lastBirdJump = Date.now();
                };
            }
        }
    }

    function startGame() {
        createGrounds();
        createBird();
        createPipes();
        createScoreContainer();
    }

    function createGrounds() {
        // Create the ground sprites
        const ground1 = new PIXI.Sprite(textures['ground']);
        ground1.anchor.set(0, 1);
        ground1.x = 0;
        ground1.y = app.view.height;
        ground1.width = GROUND_WIDTH;
        ground1.height = GROUND_HEIGHT;

        const ground2 = new PIXI.Sprite(textures['ground']);
        ground2.anchor.set(0, 1);
        ground2.x = GROUND_WIDTH;
        ground2.y = app.view.height;
        ground2.width = GROUND_WIDTH;
        ground2.height = GROUND_HEIGHT;

        const ground3 = new PIXI.Sprite(textures['ground']);
        ground3.anchor.set(0, 1);
        ground3.x = GROUND_WIDTH * 2;
        ground3.y = app.view.height;
        ground3.width = GROUND_WIDTH;
        ground3.height = GROUND_HEIGHT;

        groundsContainer = new PIXI.Container();
        app.stage.addChild(groundsContainer);

        groundsContainer.addChild(ground1);
        groundsContainer.addChild(ground2);
        groundsContainer.addChild(ground3);

        // Start the ground movement
        ground1.vx = -GROUND_SPEED;
        ground2.vx = -GROUND_SPEED;
        ground3.vx = -GROUND_SPEED;
    }

    function createBird() {
        // Create the bird sprite
        bird = new PIXI.AnimatedSprite([textures[`${birdColor}bird-0`], textures[`${birdColor}bird-1`], textures[`${birdColor}bird-2`]]);
        bird.x = 60;
        bird.anchor.set(0.5);
        bird.y = app.view.height / 2 - 80;
        bird.scale.set(1.4)
        bird.animationSpeed = 0.1;
        bird.play();

        app.stage.addChild(bird);

        bird.vy = 0;
    }

    function createPipes() {
        // Create the pipes container
        pipesContainer = new PIXI.Container();
        pipesContainer.width = app.view.width;
        pipesContainer.height = app.view.height;
        app.stage.addChild(pipesContainer);

        // Start the pipe spawn timer
        isPipeSpawn = true;
    }

    function spawnPipe() {
        // Create the pipe sprite
        const PIPE_START_X = app.view.width + 100;
        const pipeTopHeight = Math.floor(Math.random() * (MAX_PIPE_HEIGHT - MIN_PIPE_HEIGHT + 1)) + MIN_PIPE_HEIGHT;
        const pipeBottomHeight = app.view.height - GROUND_HEIGHT - pipeTopHeight - 100;

        const pipeTop = new PIXI.Sprite(textures['pipe']);
        pipeTop.width = PIPE_WIDTH;
        pipeTop.height = pipeTopHeight;
        pipeTop.angle = 180;
        pipeTop.scale.x = -1;
        pipeTop.anchor.set(0, 1);
        pipeTop.x = 0;
        pipeTop.y = 0;

        const pipeBottom = new PIXI.Sprite(textures['pipe']);
        pipeBottom.width = PIPE_WIDTH;
        pipeBottom.x = 0;
        pipeBottom.height = pipeBottomHeight;
        pipeBottom.anchor.set(0, 1);
        pipeBottom.y = app.view.height - GROUND_HEIGHT;

        // Add the pipe sprites to the pipes container
        const pipesGroup = new PIXI.Container();
        pipesGroup.x = PIPE_START_X;
        pipesGroup.addChild(pipeTop);
        pipesGroup.addChild(pipeBottom);
        pipesGroup.isScored = false;
        pipesContainer.addChild(pipesGroup);

        // Start the pipe movement
        pipesGroup.vx = -PIPE_SPEED;
    }

    function createScoreContainer() {
        // Create the score group
        scoreContainer = new PIXI.Container();
        scoreContainer.y = 20;
        app.stage.addChild(scoreContainer);

        // UPDATE SCORE IMAGES
        updateScoreImages();
    }

    function updateScoreImages() {
        // Remove all children from the score group
        scoreContainer.removeChildren();

        const scoreString = score.toString();
        const scoreDigits = scoreString.split('');
        const digitWidth = 27;
        for (let i = 0; i < scoreDigits.length; i++) {
            const scoreImage = new PIXI.Sprite(textures[scoreDigits[i]]);
            scoreImage.x = i * (digitWidth);
            scoreImage.scale.set(1.2);

            // Add the score character sprite to the score group
            scoreContainer.addChild(scoreImage);
        };
        scoreContainer.x = app.view.width / 2 - scoreContainer.width / 2;
    }

    function updateGame(delta) {
        if (isStarted && !isGameOver) {
            updateGrounds(delta);
            updateBird(delta);
            updatePipes(delta);

            if (isPipeSpawn && Date.now() - lastPipeSpawnTime > PIPE_SPAWN_INTERVAL) {
                lastPipeSpawnTime = Date.now();
                spawnPipe();
            }
        }
    }

    function updateGrounds(delta) {
        if (groundsContainer.canMoveGround === false) return;

        // Update the ground sprites
        for (let ground of groundsContainer.children) {
            ground.x += ground.vx * delta;

            if (ground.x < -GROUND_WIDTH) {
                ground.x += GROUND_WIDTH * 3;
            }
        }
    }

    function updateBird(delta) {
        // update bird vy
        bird.vy += GRAVITY;

        // Update the bird sprite
        bird.y += bird.vy * delta;
        if (bird.y < 0) {
            bird.y = 0;
            bird.vy = 0;
        }

        if (bird.vy >= 4) {
            let angle = bird.angle + 30;
            if (angle <= 90)
                bird.angle = angle;
        }
        else if (bird.vy > 0) {
            bird.angle = 0;
        }
        else {
            bird.angle = -30;
        }

        // Check if the bird is off the screen
        if (bird.y > app.view.height - GROUND_HEIGHT) {
            // Game over
            gameOver();
        }

        app.stage.setChildIndex(bird, app.stage.children.length - 1);
    }

    function updatePipes(delta) {
        if (pipesContainer.canMovePipes === false) return;

        for (let pipeGroup of pipesContainer.children) {
            pipeGroup.x += pipeGroup.vx * delta;

            // Check if the pipe has left the screen
            if (pipeGroup.x < -PIPE_WIDTH) {
                // Remove the pipe sprite
                pipesContainer.removeChild(pipeGroup);
            }

            // check pipeGroup is passed bird
            if (pipeGroup.x + PIPE_WIDTH < bird.x && !pipeGroup.isScored) {
                pipeGroup.isScored = true;
                score++;
                updateScoreImages();

                // play swoosh sound
                sound.play("swoosh")
            }

            // Check for collisions
            if (checkCollision(pipeGroup)) {
                // play hit sound
                sound.play("hit")

                canJump = false;
                isPipeSpawn = false;
                bird.vy = bird.vy < 0 ? 0 : bird.vy;
                setTimeout(() => {
                    groundsContainer.canMoveGround = false;
                    pipesContainer.canMovePipes = false;
                }, 30);
            }
        }
    }

    function checkCollision(pipeGroup) {
        // Check for collision with the pipes
        for (let pipe of pipeGroup.children) {
            if (checkCollisionWithPipe(pipe)) {
                return true;
            }
        }
        return false;
    }

    function checkCollisionWithPipe(pipe) {
        const pipeBounds = pipe.getBounds();
        const birdBounds = bird.getBounds();

        const OFFSET = 10;
        birdBounds.x += OFFSET;
        birdBounds.y += OFFSET;
        birdBounds.width -= 2 * OFFSET;
        birdBounds.height -= 2 * OFFSET;

        // Check for collision between the bird and the pipe
        if (birdBounds.x + birdBounds.width > pipeBounds.x &&
            birdBounds.x < pipeBounds.x + pipeBounds.width &&
            birdBounds.y + birdBounds.height > pipeBounds.y &&
            birdBounds.y < pipeBounds.y + pipeBounds.height) {


            return true;
        }
        return false;
    }

    function gameOver() {
        // play game over sound
        sound.play("die")

        isGameOver = true;
        canJump = false;

        bird.stop();
        isPipeSpawn = false;


        createGameOver();
    }

    function createGameOver() {
        // Create the game ready sprite
        const gameOver = new PIXI.Sprite(textures['gameover']);
        gameOver.anchor.set(0.5);
        gameOver.x = app.view.width / 2;
        gameOver.y = app.view.height / 2;
        gameOver.scale.set(1.6);
        gameOver.name = 'gameOver';

        // add into stage
        app.stage.addChild(gameOver);

        if (!isAddedIntoDatabase) {
            isAddedIntoDatabase = true;

            // Add score to GameFuse database
            let lastScore = GameFuseUser.CurrentUser.getAttributeValue("Score");
            lastScore = Number(lastScore)
            if (lastScore < score) {
                GameFuseUser.CurrentUser.setAttribute("Score", `${score}`, function (message, hasError) {
                    if (hasError) {
                        console.log("Error setting attribute: " + message);
                    }
                    else {
                        console.log("Attribute set successfully");
                    }
                });

                if (score > 100) {
                    GameFuseUser.CurrentUser.setAttribute("IsPassed100Points", "true", function (message, hasError) {
                        if (hasError) {
                            console.log("Error setting attribute: " + message);
                        }
                        else {
                            console.log("Attribute set successfully");
                        }
                    });
                }
                if (score > 200) {
                    GameFuseUser.CurrentUser.setAttribute("IsPassed200Points", "true", function (message, hasError) {
                        if (hasError) {
                            console.log("Error setting attribute: " + message);
                        }
                        else {
                            console.log("Attribute set successfully");
                        }
                    });
                }
            }

            GameFuseUser.CurrentUser.addLeaderboardEntry("GameLeaderboard", Number(score), [], function (message, hasError) {
                if (hasError) {
                    console.log("Error adding leaderboard entry: " + message);
                }
                else {
                    console.log("Leaderboard entry added successfully");

                    let menu = document.getElementById('menu');
                    menu.style.display = 'flex';
                    let mainMenu = document.getElementById('mainMenu');
                    mainMenu.style.display = 'flex';

                    //desctory app
                    app.destroy(true)
                }
            });
        }
    }
}
