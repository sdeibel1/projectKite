var game = new Phaser.Game(360, 640, Phaser.AUTO, 'project-kite',{ preload: preload, create: create, update: update}) ;

function preload() {
        //scaling window for all devices
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        game.load.image('bigClouds', 'assets/images/tallClouds.jpg');
        game.load.spritesheet('string', 'assets/images/testString2.png', 4, 26);
        game.load.spritesheet('kite', 'assets/images/simpleKite.png', 40, 60);
        game.load.spritesheet('powerUp','assets/images/powerup.png', 76, 76);
        game.load.spritesheet('restartButton', 'assets/images/restartButton.jpeg', 100, 100);
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
var powerupsToCreate = [];
var powerups = [];
var altitude;
var floatLinks = []; // The number of pieces in the string
var lastRect;
var wind = 0;
var startingPowerUp;
var windUp = -10;
var windUpVariance = 0;
var scoreText;

var background;

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

    // ********Creating altitude text********
    altitude =  Math.round(kiteStartingY - kite.body.y);
    scoreText = game.add.text(0, 0, "0", {font: '19px Arial', fill: '#fff', align: "left"});
    scoreText.fixedToCamera = true;
    scoreText.cameraOffset.setTo(game.world.width - 10, 10);
    scoreText.anchor.setTo(1, 0);

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
    powerupTimer.loop(2500, createPowerup, this);
    powerupTimer.start();

    playerIsAlive = true;
}

//********Button Controls********
function up() {
}

function over() {
}

function out() {
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
    highScoreText.visible = false;
    background.visible = true;
    scoreText.visible = true;

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

function update() {
    //console.log(loseBoundary.position.y + kiteStartingY + 400 + "\n" + kite.body.y);
    if (playerIsAlive) {
        moveLoseBoundary();
        adjustLoseVolume();
        background.tilePosition.y += 10;
        if (kite.body.y >= loseBoundary.y) {
            lose();
        }
    }

    for (powerup of powerups) {
        if (powerup.body.velocity.y <= 20) {
            powerup.kill();
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
    scoreText.setText(score + " ft");
}

// Creates 2 powerups, one below the kite and one above the kite (unless the kite is near the top of the screen).
function createPowerup() {
    // Calculating the positions for the powerups that will be created
    var randomX = 1 + Math.random()*(game.world.width-2);
    var randomX2 = 1 + Math.random()*(game.world.width-2);
    var acceptableBelowYRange = (game.camera.y + game.camera.height) - kite.body.y - 50;
    var acceptableAboveYRange = kite.body.y - game.camera.y - 50;
    var belowKiteY = Math.random()*acceptableBelowYRange + kite.body.y + 50;
    var aboveKiteY = kite.body.y - Math.random()*acceptableAboveYRange - 150;

    if (playerIsAlive) {
        var belowPowerUp = game.add.sprite(randomX, belowKiteY, 'powerUp');
        belowPowerUp.scale.setTo(powerUpScaleRatio,powerUpScaleRatio);

        powerupsToCreate.push(belowPowerUp);
        powerups.push(belowPowerUp);
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
            powerup.body.velocity.y = 100;
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

    gameOverText = game.add.text(game.camera.x + game.width/2, game.camera.y + game.height/2 - 60, 'Game Over', { font: '20px Arial', fill: '#fff'});
    gameOverText.anchor.setTo(0.5);

    highScoreText = game.add.text(game.camera.x + game.width/2, game.camera.y + game.height/2 - 40, 'High Score:'+ score, { font: '20px Arial', fill: '#fff'});
    highScoreText.anchor.setTo(0.5);

    restartButton = game.add.button(game.camera.x + game.width/2 - 50, game.camera.y + game.height/2 - 25, 'restartButton', actionOnClick, this, 2, 1, 0);
    restartButton.onInputOver.add(over, this);
    restartButton.onInputOut.add(out, this);
    restartButton.onInputUp.add(up, this);

    kite.kill();
    for (powerup of powerups) {
        powerup.kill();
    }
    game.camera.unfollow();
    scoreText.visible = false;
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
    console.log(kite.body.y, loseBoundary.y);
    var loseBoundarySpeed = 0.02;
    loseBoundary.y -= loseBoundarySpeed * this.game.time.elapsed;
}

function adjustLoseVolume() {
    distToRedLine = loseBoundary.y - kite.body.y;
    if (distToRedLine >= 350 && danger.volume > 0) {
        danger.volume -= .1;
    } else if (danger.volume < 2) {
        danger.volume += .1;
    }
}