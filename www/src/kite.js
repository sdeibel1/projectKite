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
}

var kiteCollisionGroup;
var powerupCollisionGroup;

var boost;
var directional;
var lastX;

var cameraYmin;
var distToRedLine;

var kite;
var kiteStartingX;
var kiteStartingY;
var score = 0;

// Pertain to the lose boundary
var graphics;
var loseBoundary;

var playerIsAlive;
var timer;
var timer2;
var loseTimer;

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
var powerUpScaleRatio = window.devicePixelRatio / 3;

var kiteScaleRatio = window.devicePixelRatio / 2;


function create() {

    // ********Setting up the game********
    game.world.setBounds(0, 0, 360, 1000000);
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.p2.gravity.y = 0;

    background = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'bigClouds');

    // ********Creating the kite********
    kiteStartingX = game.world.centerX;
    kiteStartingY = game.world.height*.80;

    kite = game.add.sprite(kiteStartingX, kiteStartingY, 'kite');
    //scales kite sprite for all devices
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

    // ********Adds tail********
    //createRope(5, kite.x, kite.y + 20);

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
    directional= game.input.keyboard.createCursorKeys();
    boost = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    game.input.onDown.add(onDown, this);
    game.input.onUp.add(onUp, this);

    // ********Camera********
    game.camera.y = kite.y;
    game.camera.follow(kite, Phaser.Camera.FOLLOW_LOCKON, .1, .1); //comment this out to go back to the old camera

    playerIsAlive = true;

    // ********Timer********
    timer = game.time.create(false);
    timer.loop(2500, createPowerup, this);
    // timer.loop(10000,createGoon,this);
    timer.start();

    timer2 = game.time.create(false);
    loseTimer = game.time.create(false);
    loseTimer.loop(50, moveLoseBoundary, this);
    loseTimer.start();

    // timer2.add(500, game.camera.unfollow, this);

    // ********Lose boundary********
    graphics = game.add.graphics();
    graphics.beginFill(0xff0000);
    graphics.lineStyle(2, 0xff0000, 1);
    loseBoundary = graphics.drawRect(0, kiteStartingY + 400, game.world.width, 15);
    graphics.endFill();
}

function kiteOut(kite) {
    //kite.reset(0, kite.y);
    if(kite.body.x - kite.width/2 <= 0) {
      kite.body.x = game.width - kite.width/2;
    } else if(kite.body.x + kite.width/2 >= game.width) {
      kite.body.x = 0 + kite.width/2;
    }
}

//********Button Controls********
function up() {
}

function over() {
}

function out() {
}

function actionOnClick () {
    loseBoundary.moveTo(0, kiteStartingY + 400);
    kite.revive();
    restartButton.visible = false;
    gameOverText.visible = false;
    highScoreText.visible = false;
    background.visible = true;
    scoreText.visible = true;

    kite.body.x = game.world.centerX;
    kite.body.y = kiteStartingY;
    kite.body.velocity.x = 0;
    kite.body.velocity.y = -300;

    game.camera.y = kite.body.y;
    game.camera.follow(kite, Phaser.Camera.FOLLOW_LOCKON, .1 ,.1);
    playerIsAlive = true;
}


//******* Movement Controls ***********
function onDown() {
    lastX = game.input.activePointer.x;
}

function onUp() {
    deltaX = game.input.activePointer.x - lastX;
    kite.body.velocity.x += deltaX*1.4;
}

function update() {

    distToRedLine = loseBoundary.y-kite.body.y ;

    if (playerIsAlive) {
        background.tilePosition.y += 10;
    }
    updateKiteAngle();

    if(playerIsAlive == true && kite.body.y >= loseBoundary.position.y + kiteStartingY + 400) { // For some reason loseBoundary.worldPosition.y is negative, so I multiply by -1
      lose();
    }

    for (powerup of powerups) {
        if (powerup.body.velocity.y <= 20) {
            powerup.kill();
        }
    }

    kite.body.velocity.y += 2.5; // Gravity

    if (directional.left.isDown ) {
      kite.body.velocity.x = -75;
    } else if (directional.right.isDown) {
      kite.body.velocity.x = 75;
    } else if (directional.up.isDown || boost.isDown) {
      kite.body.velocity.y = -75;
    } else if (directional.down.isDown) {
      kite.body.velocity.y = 75;
    }

   altitude =  Math.round(kiteStartingY - kite.body.y);
   if(altitude >= score) {
     score = altitude;
   }
   scoreText.setText(score + " ft");

   game.world.wrap(kite.body, 10);
}

function render() {
    game.debug.cameraInfo(game.camera, 32, 32);
}

// Does not work
function move(pointer, x, y, click) {
    kite.body.velocity.x += 1000 * (game.input.activePointer.x - x);
}

// Creates 2 powerups, one below the kite and one above the kite (unless the kite is near the top of the screen).
function createPowerup() {
    // Calculating the positions for the powerups that will be created
    var randomX = 1 + Math.random()*(game.world.width-2);
    var randomX2 = 1 + Math.random()*(game.world.width-2);
    var acceptableBelowYRange = (game.camera.y + game.camera.height) - kite.body.y - 50;
    var acceptableAboveYRange = kite.body.y - game.camera.y - 50;
    var belowKiteY = Math.random()*acceptableBelowYRange + kite.body.y + 50;
    var aboveKiteY = kite.body.y - Math.random()*acceptableAboveYRange - 50;

    if (playerIsAlive) {
        // this powerup will go below the kite (so that the player has a chance of getting it)
        var powerUp = game.add.sprite(randomX, belowKiteY, 'powerUp');
        powerUp.scale.setTo(powerUpScaleRatio,powerUpScaleRatio);

        powerupsToCreate.push(powerUp);
        powerups.push(powerUp);
        if (kite.body.y - 50 >= game.camera.y) { // if the kite isn't near the top of the screen
        /* Note: we don't want to spawn powerups if the kite is at the top of the screen because they are likely to spawn
        on top of the kite which ends up being confusing */
            // add the above powerup to powerupsToCreate array
            // this powerup will go above the kite
            var powerUp2 = game.add.sprite(randomX2, aboveKiteY, 'powerUp');
            powerUp2.scale.setTo(powerUpScaleRatio,powerUpScaleRatio);

            powerupsToCreate.push(powerUp2);
            powerups.push(powerUp2);
        }

        for (powerup of powerupsToCreate) { // creates the powerups
            powerup.anchor.setTo(.5, .5);
            game.physics.enable(powerup, Phaser.Physics.P2JS);
            powerup.body.velocity.y = 80;
            //powerup.checkWorldBounds = true;
            powerup.body.setCollisionGroup(powerupCollisionGroup);
            powerup.body.collides(kiteCollisionGroup);
            kite.body.createBodyCallback(powerup, hitPowerup, this);
        }
    }
    powerupsToCreate = [];
}

function Boost(){
    kite.body.velocity.y+= -10;
}

function yAcclCap(){
    if(kite.body.velocity.y>400){
        kite.body.velocity.y=400;
    } else if (kite.body.velocity.y<-600){
        kite.body.velocity.y=-600;
    }
}

function xAcclCap(){
    if(kite.body.velocity.x>300){
        kite.body.velocity.x=300;
    } else if (kite.body.velocity.x<-300){
        kite.body.velocity.x=-300;
    }
}

function collisionHandler(kite, powerUp) {
    powerUp.kill();
    kite.body.velocity.y=-350;
}

function yWindUpdate(){
    kite.body.velocity.y+=wind;
}

function xWindUpdate(){
    kite.body.velocity.x+=wind;
}

function lose() {
    // Game Over Text
    gameOverText = game.add.text(game.camera.x + game.width/2, game.camera.y + game.height/2 - 60, 'Game Over', { font: '20px Arial', fill: '#fff'});
    gameOverText.anchor.setTo(0.5);

    // High Score Text
    highScoreText = game.add.text(game.camera.x + game.width/2, game.camera.y + game.height/2 - 40, 'High Score:'+ score, { font: '20px Arial', fill: '#fff'});
    highScoreText.anchor.setTo(0.5);

    // Restart Button
    restartButton = game.add.button(game.camera.x + game.width/2 - 50, game.camera.y + game.height/2 - 25, 'restartButton', actionOnClick, this, 2, 1, 0);
    restartButton.onInputOver.add(over, this);
    restartButton.onInputOut.add(out, this);
    restartButton.onInputUp.add(up, this);

    game.camera.unfollow();

    scoreText.visible = false;

    // powerUp.kill();

    // Kill everything
    kite.kill();
    for (powerup of powerups) {
        powerup.kill();
    }


    powerupsToCreate = [];

    playerIsAlive = false;
  }

function boundaryCollisions() {
  if(kite.body.x == 0) {
    //kite.body.x = game.width;
  } else if(kite.body.x = game.width) {
    //kite.body.x = 0;
  }
}

function hitPowerup(kiteBody, powerupBody) {
    powerupBody.sprite.kill();
    powerupBody.removeCollisionGroup(kiteCollisionGroup, true);
    // var boostTimer = game.time.create(false);
    // boostTimer.repeat(20, 8, boostUp, this);
    // boostTimer.start();
    //console.log(kite.body.velocity.y);
    kite.body.velocity.y -= 300;
    //console.log(kite.body.velocity.y);
}

function boostUp() {
    kite.body.velocity.y -= 60;
}

function CameraPan(){
    game.camera.y += -2;
}

function updateKiteAngle(){
         if(kite.body.angle>45){
            kite.body.angle=45;
        }


        if(kite.body.angle<-45){
            kite.body.angle=-45;
        }

        kite.body.angle = kite.body.velocity.x/8;
}

function catchUpToKite() {
    game.camera.follow(kite, Phaser.Camera.FOLLOW_LOCKON, .1, .1);
    timer2.start();
}

function unfollowKite() {
    game.camera.unfollow();
}

function moveLoseBoundary() {
<<<<<<< HEAD

        if (playerIsAlive){

                loseBoundary.y -= 3;
            }
}
=======
    if (playerIsAlive){
        loseBoundary.y -= 1;
    }
}
>>>>>>> 0e8828c84fe385189218d9a6123164638fa4d1c0
