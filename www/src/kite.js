var game = new Phaser.Game(360, 640, Phaser.AUTO, 'project-kite',{ preload: preload, create: create, update: update}) ;

function preload() {
        //scaling window for all devices
        //game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        game.load.image('bigClouds', 'assets/images/tallClouds.jpg');
        game.load.spritesheet('string', 'assets/images/testString2.png', 4, 26);
        game.load.spritesheet('kite', 'assets/images/simpleKite.png', 40, 60);
        game.load.spritesheet('powerUp','assets/images/powerup.png', 76, 76);
        game.load.spritesheet('restartButton', 'assets/images/restartButton.png', 100, 100);
        game.load.spritesheet('goon', 'assets/images/turtleShell.png', 50, 50);
        game.load.spritesheet('loseBoundary', 'assets/images/loseBoundary.png', 15, game.width);
        game.load.audio('theme','assets/audio/theme1.wav');
        game.load.audio('collect','assets/audio/collect.wav');
        game.load.audio('gameOverSound','assets/audio/lose.wav');
        game.load.audio('losstheme','assets/audio/losstheme.wav');
        game.load.audio('whoosh','assets/audio/whoosh.wav');
        game.load.audio('danger','assets/audio/danger.wav');
}

var kiteCollisionGroup;
var powerupCollisionGroup;

var keyboardControls;

var cameraYmin;
var bum;
var kite;
var kiteStartingX;
var kiteStartingY;
var score = 0;

// Pertain to the lose boundary
var graphics;
var loseBoundary;

var playerIsAlive;
var powerupTimer;
var loseBoundaryTimer;

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

var powerupsToCreate = [];
var powerups = [];
var altitude;
var startingPowerUp;
var playingScoreText;
var distToRedLine;
var background;

// Inctruction variables
var moveText;
var moveArrow;
var obstacleText;
var redBarText;
var instructionsTimer;
var gameStart = 0;

//scaling ratios//
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
    music.loop=true;
    music.play();
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
    console.log(altitude);
    increaseDifficulty();
    powerupTimer.start();
    playerIsAlive = true;

    // Instructions
    instructionsTimer = game.time.create(false);
    moveText = game.add.text(kiteStartingX - 100, kiteStartingY, "Hold down and drag to move the kite",
               {font: '12px Arial', fill: '#B03A2E'});
    timer.loop(5000, updateCounter, this);
    instructionsTimer.start();
}

function updateCounter() {
  gameStart = 1;
}


function actionOnClick () {
    // console.log("KITE STARTING Y: " + kiteStartingY);
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
    console.log("LOSE BOUNDARY Y: " + (loseBoundary.position.y + kiteStartingY + 400));

    kite.revive();
    kite.body.x = game.world.centerX;
    kite.body.y = kiteStartingY;
    kite.body.velocity.x = 0;
    kite.body.velocity.y = -300;

    game.camera.y = kite.body.y;
    game.camera.follow(kite, Phaser.Camera.FOLLOW_LOCKON, .1 ,.1);
    playerIsAlive = true;
}

//functions for handling screen rotation
function handleIncorrect(){
    if(!game.device.desktop){
        document.getElementById("turn").style.display="block";
    }
}
function handleCorrect(){
    if(!game.device.desktop){
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

    updateKiteAngle();
    kite.body.velocity.y += 2.5; // Gravity
    game.world.wrap(kite.body, 10);

    keyboardControls.update();

    altitude =  Math.round(kiteStartingY - kite.body.y);
    if (altitude >= score) {
        score = altitude;
    }
    playingScoreText.setText(score + " ft");
    currentHeightText.setText(altitude + " ft");
}

// Creates 2 powerups, one below the kite and one above the kite (unless the kite is near the top of the screen).
function createPowerup() {
    // Calculating the positions for the powerups that will be created
    var randomX = 1 + Math.random()*(game.world.width-2);
    var randomX2 = 1 + Math.random()*(game.world.width-2);
    var acceptableAboveYRange = kite.body.y - game.camera.y - 50;
    var aboveKiteY = kite.body.y - Math.random()*acceptableAboveYRange - 225;

    if (playerIsAlive) {


        if (kite.body.y - 50 >= game.camera.y) { // if the kite isn't near the top of the screen
            /* Note: we don't want to spawn powerups if the kite is at the top of the screen because they are likely to spawn
            on top of the kite which ends up being confusing */
            var abovePowerUp = game.add.sprite(randomX2, aboveKiteY, 'powerUp');
            abovePowerUp.scale.setTo(powerUpScaleRatio,powerUpScaleRatio);
            game.physics.enable(abovePowerUp, Phaser.Physics.P2JS);

            // add the above powerup to powerupsToCreate array
            powerupsToCreate.push(abovePowerUp);
            powerups.push(abovePowerUp);
        }

        for (powerup of powerupsToCreate) { // creates the powerups
            powerup.anchor.setTo(.5, .5);
            game.physics.enable(powerup, Phaser.Physics.P2JS);
            powerup.body.velocity.y = kite.body.velocity.y +400;
            powerup.body.setCollisionGroup(powerupCollisionGroup);
            powerup.body.collides(kiteCollisionGroup);
            kite.body.createBodyCallback(powerup, hitPowerup, this);
        }
    }
    powerupsToCreate = [];
}

function lose() {
    playerIsAlive = false;
    music.stop();
    danger.stop();
    gameOverSound.play();
    losstheme.loop=true;
    losstheme.play();

    gameOverText = game.add.text(game.camera.x + game.width/2, game.camera.y + game.height/2 - 130, 'Game Over', { font: '25px Arial', fill: '#F1503A'});
    gameOverText.anchor.setTo(0.5);

    endScoreText = game.add.text(game.camera.x + game.width/2, game.camera.y + game.height/2 - 100, 'Score: '+ score + " ft", { font: '20px Arial', fill: '#2534F50'});
    endScoreText.anchor.setTo(0.5);

    restartButton = game.add.button(game.camera.x + game.width/2 - 50, game.camera.y + game.height/2 - 80, 'restartButton', actionOnClick);

    kite.kill();
    for (powerup of powerups) {
        powerup.kill();
    }

    game.camera.unfollow();
    playingScoreText.visible = false;
    currentHeightText.visible = false;
    powerupsToCreate = [];
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
    }

    else{
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

function increaseDifficulty(){
     if(altitude<1000){
        powerupTimer.loop(500, createPowerup, this);

    }

    else if(altitude>=1000 && altitude< 1500){
        powerupTimer.loop(2500, createPowerup, this);
    }

    else if(altitude>=1500){
        powerupTimer.loop(3500, createPowerup, this);
    }
}


// Displays instructions for the first 5 seconds of the game
function showInstructions() {
  moveText.visible = true;
}

function instructionsCondition() {
  if(gameStart == 0) {
    showInstructions();
  } else if(gameStart == 1) {
    actionOnClick();
  }
}
