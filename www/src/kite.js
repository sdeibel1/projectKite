var game = new Phaser.Game(320, 560, Phaser.AUTO, 'project-kite',{ preload: preload, create: create, update: update}) ;

function preload() {
        //scaling window for all devices
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        game.load.image('bigClouds', 'assets/images/tallClouds.jpg');
        game.load.image('black', 'assets/images/black.jpg', 320, 560);
        game.load.spritesheet('string', 'assets/images/testString2.png', 4, 26);
        game.load.spritesheet('kite', 'assets/images/simpleKite.png', 40, 60);
        game.load.spritesheet('powerUp','assets/images/powerup.png', 76, 76);
        game.load.spritesheet('restartButton', 'assets/images/restartButton.jpeg', 100, 100);
}

var kiteCollisionGroup;
var powerupCollisionGroup;

var boost;
var directional;
var lastX;

var kite;
var playerIsAlive;
var timer;
var restartButton;
var gameOverText;
var powerupsToCreate = [];
var altitude;
var floatLinks = []; // The number of pieces in the string
var lastRect;
var altitudeString;
var background;

var powerUpScaleRatio = window.devicePixelRatio / 3;
var kiteScaleRatio = window.devicePixelRatio / 4;

function create() {

    // ********Setting up the game********
    background = game.add.tileSprite(0, 0, 320, 1500, 'bigClouds');
    game.world.setBounds(0, 0, 320, 1500);
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.p2.gravity.y = 0;

    // ********Creating the kite********
    kite = game.add.sprite(game.world.centerX, game.world.height*.80, 'kite');
    //scales kite sprite for all devices
    kite.scale.setTo(kiteScaleRatio, kiteScaleRatio);
    kite.anchor.setTo(0,0);
    game.physics.enable(kite, Phaser.Physics.P2JS);
    kite.checkWorldBounds = true;
    kite.events.onOutOfBounds.add(kiteOut, this);
    kite.body.gravity.x = game.rnd.integerInRange(-50, 50);
    kite.body.gravity.y = 100 + Math.random() * 100;

    // ********Creating the powerup********
    powerUp = game.add.sprite(game.world.centerX, game.world.height*.85,'powerUp');
    powerUp.scale.setTo(powerUpScaleRatio,powerUpScaleRatio); //scales powerup sprite for all devices
    powerUp.anchor.setTo(1,1);
    game.physics.enable(powerUp, Phaser.Physics.P2JS);

    // ********Adds tail********
    //createRope(5,kite.x,kite.y+20);

    // ********Collisions********
    kiteCollisionGroup = game.physics.p2.createCollisionGroup();
    powerupCollisionGroup = game.physics.p2.createCollisionGroup();
    kite.body.setCollisionGroup(kiteCollisionGroup);
    powerUp.body.setCollisionGroup(powerupCollisionGroup);
    kite.body.collides(powerupCollisionGroup);
    powerUp.body.collides(kiteCollisionGroup);
    game.physics.p2.updateBoundsCollisionGroup();
    // these next 2 lines assign a callback for when the kite hits a powerup (this callback is the hitPowerup function)
    kite.body.createBodyCallback(powerUp, hitPowerup, this);
    game.physics.p2.setImpactEvents(true);

    // ********Creating altitude text********
    altitude = kite.y;
    altitudeString = game.add.text(0,0, 'Current Altitude : ' + altitude, {font: '19px Arial', fill: '#fff', align: "left"});
    altitudeString.fixedToCamera = true;
    altitudeString.cameraOffset.setTo(10,10);

    // ********Setting up controls********
    directional= game.input.keyboard.createCursorKeys();
    boost = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    game.input.onDown.add(onDown, this);
    game.input.onUp.add(onUp, this);

    // ********Camera********
    game.camera.y = kite.y;

    playerIsAlive = true;

    // ********Timer********
    timer = game.time.create(false);
    timer.loop(2500, createPowerup, this);
    timer.start();
}

function kiteOut(alien) {
    //  Move the alien to the top of the screen again
    alien.reset(alien.x, 0);

    //  And give it a new random velocity
    alien.body.velocity.y = 50 + Math.random() * 200;
}

//********Button Controls********
function up() {
}

function over() {
}

function out() {
}

function actionOnClick () {
    kite.revive();
    restartButton.visible = false;
    gameOverText.visible = false;
    black.visible = false;
    background.visible = true;
    altitudeString.visible = true;

    kite.body.x = game.world.centerX;
    kite.body.y = game.world.height*.80;
    kite.body.velocity.x = 0;
    kite.body.velocity.y = -300;

    game.camera.y = kite.body.y;

    playerIsAlive = true;
}

function onDown() {
    lastX = game.input.activePointer.x;
}

function onUp() {
    deltaX = game.input.activePointer.x - lastX;
    kite.body.velocity.x += deltaX*.9;
}

function update() {
    if(playerIsAlive == true && kite.body.y >= game.camera.y +550) {
      lose();
    }

    if (kite.body.y < game.camera.y) {
        kite.body.y = game.camera.y;
    }

    if(playerIsAlive == true){
        CameraPan();
    }

    kite.body.velocity.y += 2.5;

    if (directional.left.isDown ) {
      kite.body.velocity.x = -75;
    } else if (directional.right.isDown) {
      kite.body.velocity.x = 75;
    } else if (directional.up.isDown || boost.isDown) {
      kite.body.velocity.y = -75;
    } else if (directional.down.isDown) {
      kite.body.velocity.y = 75;
    }

   altitudeString.setText("Current Altitude : " + 0);
}

function render() {
    game.debug.cameraInfo(game.camera, 32, 32);
}

// Does not work
function move(pointer, x, y, click) {
    kite.body.velocity.x += 1000 * (game.input.activePointer.x - x);
}

// updates the altitude
function updateAltitude() {
    altitude = kite.body.y;
    altitudeString.setText("Current Altitude : " + altitude);
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
        powerUp = game.add.sprite(randomX, belowKiteY, 'powerUp');
        powerUp.scale.setTo(powerUpScaleRatio,powerUpScaleRatio);

        powerupsToCreate.push(powerUp);
        console.log(powerupsToCreate);
        if (kite.body.y - 50 >= game.camera.y) { // if the kite isn't near the top of the screen
        /* Note: we don't want to spawn powerups if the kite is at the top of the screen because they are likely to spawn
        on top of the kite which ends up being confusing */
            // add the above powerup to powerupsTo
            // this powerup will go above the kite
            powerUp2 = game.add.sprite(randomX2, aboveKiteY, 'powerUp');
            powerUp2.scale.setTo(powerUpScaleRatio,powerUpScaleRatio);

            powerupsToCreate.push(powerUp2);
        }

        for (powerup of powerupsToCreate) { // creates the powerups
            powerup.anchor.setTo(.5, .5);
            game.physics.enable(powerup, Phaser.Physics.P2JS);
            powerup.body.setCollisionGroup(powerupCollisionGroup);
            powerup.body.collides(kiteCollisionGroup);
            kite.body.createBodyCallback(powerup, hitPowerup, this);
        }
    }
}

function createRope(length, xAnchor,yAnchor) {
    var height = 16;        //  Height for the physics body - your image height is 8px
    var width = 30;         //  This is the width for the physics body. If too small the rectangles will get scrambled together.
    var maxForce = 30000;    // The force that holds the rectangles together.

    for (var i = 0; i <= length; i++) {
        var x = xAnchor;                    //  All rects are on the same x position
        var y = (yAnchor) - (i * height);     //  Every new rect is positioned below the last

        // Add string sprite
        newRect = game.add.sprite(x,y,'string');

        // Enable physicsbody
        game.physics.p2.enable(newRect, false);

        // Set custom rectangle
        newRect.body.setRectangle(width, height);

        if (i === 0) {
            // Anchor the first one created
            newRect.body.static = false;
            game.physics.p2.createRevoluteConstraint(kite, [0,+70], newRect, [0,10],maxForce);
        } else {
           newRect.body.mass = length / i;     //  Reduce mass for evey rope element
        }

        //  After the first rectangle is created we can add the constraint
        if (lastRect) {
            game.physics.p2.createRevoluteConstraint(newRect, [0, -10], lastRect, [0, 10], maxForce);
        }
        if (length - i < 3) {
            floatLinks.push(lastRect);
        }

        if (length - i > 8) {
            newRect.visible = false;
        }

        lastRect = newRect;
    }
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
    gameOverText = game.add.text(game.camera.x + game.width/2, game.camera.y + game.height/2 - 50, 'Game Over', { font: '20px Arial', fill: '#fff'});
    gameOverText.anchor.setTo(0.5);

    // ********Restart restartButton********
    restartButton = game.add.button(game.camera.x + game.width/2 - 50, game.camera.y + game.height/2 - 25, 'restartButton', actionOnClick, this, 2, 1, 0);
    restartButton.onInputOver.add(over, this);
    restartButton.onInputOut.add(out, this);
    restartButton.onInputUp.add(up, this);

    background.visible = false;
    black = game.add.tileSprite(0, 0, 320, 560, 'black');
    altitudeString.visible = false;

    // Kill everything
    kite.kill();
    for (powerup of powerupsToCreate) {
        powerup.kill();
    }
    powerupsToCreate = [];
    playerIsAlive = false;
  }

function hitPowerup(kiteBody, powerupBody) {
    // body1 is the kite's body and body2 is the powerup's body
    powerupBody.sprite.kill();
    if (kiteBody.velocity.y > 0) {
        kiteBody.velocity.y = -250
    } else {
        kiteBody.velocity.y -= 170;
    }
}

function CameraPan(){
    game.camera.y  +=-2;
}
