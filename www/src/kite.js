var game = new Phaser.Game(360, 640, Phaser.AUTO, 'project-kite',{ preload: preload, create: create, update: update}) ;
var firstRunLandscape;

function preload() {
        // Scaling window for all devices
        firstRunLandscape = game.scale.isGameLandscape;
<<<<<<< HEAD
        //game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
=======
>>>>>>> 5b927192fadd3bfb697dfd605b17d0e171458348
        game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;

        game.load.image('bigClouds', 'assets/images/tallClouds.jpg');
        game.load.image('playPortrait', 'landscapeTextDisplay.png');
        game.load.spritesheet('string', 'assets/images/testString2.png', 4, 26);
        game.load.spritesheet('kite', 'assets/images/simpleKite.png', 40, 60);
        game.load.spritesheet('powerUp','assets/images/wind.png', 76, 76);
        game.load.spritesheet('restartButton', 'assets/images/restartButton.png', 100, 100);
        game.load.spritesheet('goon', 'assets/images/turtleShell.png', 50, 50);
        game.load.spritesheet('loseBoundary', 'assets/images/loseBoundary.png', 15, game.width);
        game.load.spritesheet('arrow', 'assets/images/arrow3.png', 70, 23);
        game.load.audio('theme','assets/audio/theme1.wav');
        game.load.audio('collect','assets/audio/collect.wav');
        game.load.audio('gameOverSound','assets/audio/lose.wav');
        game.load.audio('losstheme','assets/audio/losstheme.wav');
        game.load.audio('whoosh','assets/audio/whoosh.wav');
        game.load.audio('danger','assets/audio/danger.wav');

        game.scale.forceOrientation(false, true);
        game.scale.enterIncorrectOrientation.add(handleIncorrect);
        game.scale.leaveIncorrectOrientation.add(handleCorrect);
}

var kiteCollisionGroup;
var powerupCollisionGroup;

var keyboardControls;
var gestureControls;

var kite;
var kiteStartingX;
var kiteStartingY;
var score = 0;
var difficulty = 0;
var lastScore = 0;
var maxScoreInRun = 0;

// Pertain to the lose boundary
var graphics;
var loseBoundary;
var playerIsAlive;
var powerupTimer;
var loseBoundaryTimer;

// Sounds
var music;
var collect;
var gameOverSound;
var losstheme;
var whoosh;
var danger;

var restartButton;
var gameOverText;
var endScoreText;
var currentHeightText;
var textConstant = 140;

var powerups = [];
var altitude;
var startingPowerUp;
var playingScoreText;
var distToRedLine;
var background;
var portraitText;

// Inctruction variables
var moveText;
var moveArrow;
var powerupText;
var redBarText;
var instructionsTimer;
var instructionsColor;

var powerUpScaleRatio = window.devicePixelRatio / 6;
var kiteScaleRatio = window.devicePixelRatio / 4;

function create() {

    // ********Setting up the game********
    game.world.setBounds(0, 0, 360, 1000000);
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.p2.gravity.y = 0;

    background = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'bigClouds');

    // ********creating the audio files********
    music = game.add.audio('theme');
    collect=game.add.audio('collect');
    gameOverSound=game.add.audio('gameOverSound');
    losstheme=game.add.audio('losstheme');
    whoosh=game.add.audio('whoosh');
    danger=game.add.audio('danger');
    danger.loop=true;
    danger.play();

    // ********Creating the kite********
    kiteStartingX = game.world.centerX;
    kiteStartingY = game.world.height*.80;
    kite = game.add.sprite(kiteStartingX, kiteStartingY, 'kite');
    kite.scale.setTo(kiteScaleRatio, kiteScaleRatio);
    kite.anchor.setTo(0.5, 0.5);
    game.physics.enable(kite, Phaser.Physics.P2JS);
    kite.enableBody = true;

    // Boundary Conditions
    kite.checkWorldBounds = false;
    //kite.events.onOutOfBounds.add(kiteOut, this);

    // Gravity
    kite.body.gravity.x = game.rnd.integerInRange(-50, 50);
    kite.body.gravity.y = 100 + Math.random() * 100;

    // ********Creating the powerup********
    startingPowerUp = game.add.sprite(game.world.centerX, kiteStartingY+100,'powerUp');
    startingPowerUp.scale.setTo(powerUpScaleRatio,powerUpScaleRatio); //scales powerup sprite for all devices
    startingPowerUp.anchor.setTo(0.5, 0.5);
    game.physics.enable(startingPowerUp, Phaser.Physics.P2JS);

    // ********Collisions********
    kiteCollisionGroup = game.physics.p2.createCollisionGroup();
    powerupCollisionGroup = game.physics.p2.createCollisionGroup();
    kite.body.setCollisionGroup(kiteCollisionGroup);
    startingPowerUp.body.setCollisionGroup(powerupCollisionGroup);
    startingPowerUp.body.collides(kiteCollisionGroup);
    kite.body.collides(powerupCollisionGroup);
    //game.physics.p2.updateBoundsCollisionGroup();
    // these next 2 lines assign a callback for when the kite hits a powerup (this callback is the hitPowerup function)
    kite.body.createBodyCallback(startingPowerUp, hitPowerup, this);
    game.physics.p2.setImpactEvents(true);

    // ********Creating score and current height text********
    altitude =  Math.round(kiteStartingY - kite.body.y);
    playingScoreText = game.add.text(0, 0, "0", {font: '25px Arial', fill: '#1A1A1D', align: "right"});
    playingScoreText.fixedToCamera = true;
    playingScoreText.cameraOffset.setTo(game.world.width - 10, 10);
    playingScoreText.anchor.setTo(1, 0);
    currentHeightText = game.add.text(0, 0, "0", {font: '15px Arial', fill: '#534F50', align: "right"});
    currentHeightText.fixedToCamera = true;
    currentHeightText.cameraOffset.setTo(game.world.width - 10, 40);
    currentHeightText.anchor.setTo(1, 0);

    // ********Setting up controls********
    keyboardControls = new KeyboardControls(game.input, kite);
    gestureControls = new GestureControls(game.input, kite);

    // ********Camera********
    game.camera.y = kite.y;
    game.camera.follow(kite, Phaser.Camera.FOLLOW_LOCKON, .1, .1); //comment this out to go back to the old camera

    // ********Lose boundary********
    graphics = game.add.graphics();
    graphics.beginFill(0xff0000);
    graphics.lineStyle(2, 0xff0000, 1);
    loseBoundary = graphics.drawRect(0, 0, game.world.width, 15);
    graphics.endFill();
    loseBoundary.y = kiteStartingY + 400;

    // ********Timers********
    powerupTimer = game.time.create(false);
    powerupTimer.loop(500, createPowerup, this);
    powerupTimer.start();
    playerIsAlive = true;

    moveText = game.add.text(kiteStartingX + 100, kiteStartingY + 20, "Hold down and drag to move the kite", {font: '12px Arial', fill: '#000000'});
    moveArrow = game.add.sprite(kiteStartingX, kiteStartingY, "arrow");
    powerupText = game.add.text(kiteStartingX + 100, kiteStartingY + 100, "Collect wind powerups to boost as high as you can!", {font: '12px Arial', fill: '#000000'});
    redBarText = game.add.text(kiteStartingX - 150, kiteStartingY + 150, "Don't hit the red bar below, or else!", {font: '12px Arial', fill: '#000000'});

    // ********* Gameover text ***********
    gameOverText = game.add.text(game.camera.x + game.width/2, game.camera.y + game.height/2 - textConstant, 'Game Over', { font: '25px Arial', fill: '#000000'});
    endScoreText = game.add.text(game.camera.x + game.width/2, game.camera.y + game.height/2 - textConstant + 30, 'Score: '+ score + " ft", { font: '20px Arial', fill: '#000000'});
    restartButton = game.add.button(game.camera.x + game.width/2 - 50, game.camera.y + game.height/2 - textConstant + 50, 'restartButton', actionOnClick);
    gameOverText.anchor.setTo(0.5);
    endScoreText.anchor.setTo(0.5);
    gameOverText.visible = false;
    endScoreText.visible = false;
    restartButton.visible = false;

    // ********Instructions*********
    instructionsTimer = game.time.create(false);
    instructionsTimer.add(5000, hideInstructions, this);
    showInstructions();
    instructionsTimer.start();
}

function actionOnClick () {
    danger.play();
    losstheme.stop();
    gameOverSound.stop();
    music.loop = true;
    music.play();

    restartButton.visible = false;
    gameOverText.visible = false;
    endScoreText.visible = false;
    background.visible = true;
    playingScoreText.visible = true;
    currentHeightText.visible = true;

    loseBoundary.y = kiteStartingY + 400;
    difficulty = 0;
    powerupTimer.removeAll();
    powerupTimer.loop(500 + difficulty * 125, createPowerup, this);
    lastScore = 0;
    maxScoreInRun = 0;

    kite.revive();
    kite.body.x = game.world.centerX;
    kite.body.y = kiteStartingY;
    kite.body.velocity.x = 0;
    kite.body.velocity.y = -300;

    game.camera.y = kite.body.y;
    game.camera.follow(kite, Phaser.Camera.FOLLOW_LOCKON, .1 ,.1);
    playerIsAlive = true;
}

// Methods for handling screen rotation
function handleIncorrect(){
    if (!game.device.desktop) {
        document.getElementById("turn").style.display="block";
    }
}
function handleCorrect(){
    if (!game.device.desktop) {
        document.getElementById("turn").style.display="none";
    }
}

function update() {
    distToRedLine = loseBoundary.y - kite.body.y;

    if (playerIsAlive) {
        moveLoseBoundary();
        adjustLoseVolume();
        background.tilePosition.y += 10 - kite.body.velocity.y / 20;
        if (kite.body.y >= loseBoundary.y) {
            lose();
        }
    }
    increaseDifficulty();
    updateKiteAngle();
    kite.body.velocity.y += 2.5; // Gravity
    game.world.wrap(kite.body, 10);

    keyboardControls.update();

    altitude =  Math.round(kiteStartingY - kite.body.y);
    if (altitude >= score) {
        score = altitude;
    }
    if (altitude >= maxScoreInRun) {
        maxScoreInRun = altitude;
    }
    playingScoreText.setText(score + " ft");
    currentHeightText.setText(altitude + " ft");

    if(!playerIsAlive) {
      kite.body.velocity.x = 0;
      kite.body.velocity.y = 0;
    }
}

function increaseDifficulty() {
    if (playerIsAlive && maxScoreInRun >= lastScore + 1000 && difficulty < 15) {
        lastScore = maxScoreInRun;
        difficulty += 1;
        powerupTimer.removeAll();
        powerupTimer.loop(500 + difficulty * 125, createPowerup, this);
    }
}

// Creates 2 powerups, one below the kite and one above the kite (unless the kite is near the top of the screen).
function createPowerup() {
    // Calculating the positions for the powerup that will be created
    var randomX2 = 1 + Math.random()*(game.world.width-2);
    var acceptableAboveYRange = kite.body.y - game.camera.y - 50;
    var aboveKiteY = kite.body.y - Math.random()*acceptableAboveYRange - 225;

    if (playerIsAlive) {
        var abovePowerUp = game.add.sprite(randomX2, aboveKiteY, 'powerUp');
        abovePowerUp.scale.setTo(powerUpScaleRatio,powerUpScaleRatio);
        game.physics.enable(abovePowerUp, Phaser.Physics.P2JS);
        abovePowerUp.anchor.setTo(.5, .5);
        game.physics.enable(abovePowerUp, Phaser.Physics.P2JS);
        abovePowerUp.body.velocity.y = kite.body.velocity.y +400;
        abovePowerUp.body.setCollisionGroup(powerupCollisionGroup);
        abovePowerUp.body.collides(kiteCollisionGroup);
        kite.body.createBodyCallback(abovePowerUp, hitPowerup, this);
        powerups.push(abovePowerUp);
    }
}

function lose() {
    // Stops the game
    gameOverSound.play();
    losstheme.loop=true;
    losstheme.play();
    stopGame();

    // Displays game over text
    gameOverText = game.add.text(game.camera.x + game.width/2, game.camera.y + game.height/2 - textConstant, 'Game Over', { font: '25px Arial', fill: '#F1503A'});
    endScoreText = game.add.text(game.camera.x + game.width/2, game.camera.y + game.height/2 - textConstant + 30, 'Score: '+ maxScoreInRun + " ft", { font: '20px Arial', fill: '#2534F50'});
    restartButton = game.add.button(game.camera.x + game.width/2 - 50, game.camera.y + game.height/2 - textConstant + 50, 'restartButton', actionOnClick);
    gameOverText.anchor.setTo(0.5);
    endScoreText.anchor.setTo(0.5);
    gameOverText.visible = true;
    endScoreText.visible = true;
    restartButton.visible = true;
}

function hitPowerup(kiteBody, powerupBody) {
    collect.play();
    whoosh.play();
    powerupBody.sprite.kill();
    powerupBody.removeCollisionGroup(kiteCollisionGroup, true);
    kite.body.velocity.y = -300;
}

function updateKiteAngle(){
    if (kite.body.angle>45) {
        kite.body.angle=45;
    }
    if (kite.body.angle<-45) {
        kite.body.angle=-45;
    }

    kite.body.angle = kite.body.velocity.x / 8;
}

function moveLoseBoundary() {
    var loseBoundarySpeed = 0.02;
    if (playerIsAlive && distToRedLine>=500){
        loseBoundarySpeed = 0.1;
    } else {
        loseBoundarySpeed=0.02;
    }

    loseBoundary.y -= loseBoundarySpeed * this.game.time.elapsed;
}

function adjustLoseVolume() {
    if (distToRedLine >= 350 && danger.volume > 0) {
        danger.volume -= .1;
    } else if (danger.volume < 2) {
        danger.volume += .1;
    }
}

// Source for these next two methods: http://www.emanueleferonato.com/2015/04/23/how-to-lock-orientation-in-your-html5-responsive-game-using-phaser/
function handleIncorrect(){
    if (!game.device.desktop) {
        document.getElementById("turn").style.display="block";
    }
}

function handleCorrect(){
    if (!game.device.desktop) {
        if (firstRunLandscape) {
            gameRatio = window.innerWidth/window.innerHeight;
            game.width = Math.ceil(640*gameRatio);
            game.height = 640;
            game.renderer.resize(game.width,game.height);
        }
        document.getElementById("turn").style.display="none";
    }
}

// Displays instructions for the first 5 seconds of the game
function showInstructions() {
    stopGame();
    kite.revive();
    kite.body.x = kiteStartingX;
    kite.body.y = kiteStartingY + 200;

    moveArrow.x = kite.body.x + 20;
    moveArrow.y = kite.body.y - 10;
    moveText.x = kite.body.x - 90;
    moveText.y = kite.body.y - 50;
    powerupText.x = kite.body.x - 120;
    powerupText.y = kite.body.y - 150;
    redBarText.x = kite.body.x - 80;
    redBarText.y = kite.body.y + 170;

    moveText.visible = true;
    moveArrow.visible = true;
    powerupText.visible = true;
    redBarText.visible = true;
}

function stopGame() {
    playerIsAlive = false;
    music.stop();
    danger.stop();

    kite.kill();
    for (powerup of powerups) {
        powerup.kill();
    }

    game.camera.unfollow();
    playingScoreText.visible = false;
    currentHeightText.visible = false;
}

function hideInstructions() {
    music.loop=true;
    music.play();
    danger.play();
    moveText.visible = false;
    moveArrow.visible = false;
    powerupText.visible = false;
    redBarText.visible = false;

    background.visible = true;
    playingScoreText.visible = true;
    currentHeightText.visible = true;

    loseBoundary.y = kiteStartingY + 400;

    kite.revive();
    kite.body.x = game.world.centerX;
    kite.body.y = kiteStartingY;
    kite.body.velocity.x = 0;
    kite.body.velocity.y = -300;

    game.camera.y = kite.body.y;
    game.camera.follow(kite, Phaser.Camera.FOLLOW_LOCKON, .1 ,.1);
    playerIsAlive = true;
}
