  var game = new Phaser.Game(320, 560, Phaser.AUTO, 'phaser-example',{ preload: preload, create: create, update: update}) ;

function preload() {

    // game.load.image('bigClouds', 'assets/images/bigClouds.jpg');

    //testing out new bg

        game.load.image('bigClouds', 'assets/images/bg3.jpg');
        game.load.spritesheet('string', 'assets/images/testString2.png', 4, 26);
        //game.load.spritesheet('chain', 'assets/images/chain.png', 16, 26);
        //game.load.spritesheet('kite', 'assets/images/kite2.png', 135, 135);
        game.load.spritesheet('kite', 'assets/images/simpleKite.png', 40, 60);
        game.load.spritesheet('powerUp','assets/images/powerup.png', 76, 76);
        //game.load.spritesheet('restartButton', 'assets/images/restartButton.jpeg', 100, 100);

}

var kite;
var lives;
var boost;
var directional;
var powerUps;
var lastX;
//var restartButton;
var gameOverText;
var playerIsAlive;

var floatLinks = []; // The number of pieces in the string
var lastRect;
var wind = 0;
var windUp = -10;
var windUpVariance = 0;


function create() {

    // ********Setting up the game********
    game.add.tileSprite(0, 0, 320, 1500, 'bigClouds');
    game.world.setBounds(0, 0, 320, 1500);
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.p2.gravity.y = 0;

    // ********Creating the kite********
    kite = game.add.sprite(game.world.centerX, game.world.height*.25, 'kite');
    kite.anchor.setTo(0,0);
    game.physics.enable(kite, Phaser.Physics.P2JS);
    kite.body.collideWorldBounds = true;
    kite.body.gravity.x = game.rnd.integerInRange(-50, 50);
    kite.body.gravity.y = 100 + Math.random() * 100;

    // ********Creating the powerup********
    powerUp = game.add.sprite(game.world.centerX, game.world.height*.40,'powerUp');
    powerUp.anchor.setTo(1,1);
    game.physics.enable(powerUp, Phaser.Physics.P2JS);


    // ********Adds tail********
    //createRope(5,kite.x,kite.y+20);

    // ********Collisions********
    kite.body.createBodyCallback(powerUp, hitPowerup, this);
    game.physics.p2.setImpactEvents(true);

    // ********Creating lives text********
    lives = game.add.group();
    // game.add.text(game.world.width - 200, 10, 'Lives : ', { font: '25px Arial', fill: '#fff' });

    // ********Setting up controls********
    directional= game.input.keyboard.createCursorKeys();
    boost = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    //game.input.addMoveCallback(move, this); **THIS DOESN'T WORK RIGHT NOW**
    game.input.onDown.add(onDown, this);
    game.input.onUp.add(onUp, this);


    // ********Restart restartButton********
    //restartButton = game.add.button(50, 1100, 'restartButton', actionOnClick, this, 2, 1, 0);

    // restartButton.onInputOver.add(over, this);
    // restartButton.onInputOut.add(out, this);
    // restartButton.onInputUp.add(up, this);
    //
    // restartButton.visible = false;

    // ********Camera********
    //game.camera.y = 1400
    game.camera.follow(kite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

    playerIsAlive = true;

}

// ********Button Controls********
// function up() {
//     console.log('button up', arguments);
// }
//
// function over() {
//     console.log('button over');
// }
//
// function out() {
//     console.log('button out');
// }

function actionOnClick () {
    background.visible =! background.visible;

}
function onDown() {
  lastX = game.input.activePointer.x;
}

function onUp() {
    deltaX = game.input.activePointer.x - lastX;
    kite.body.velocity.x += deltaX*.9;
}

function update() {
    if(playerIsAlive == true && kite.body.y >= game.world.height - 30) {
      lose();
    }

    windUpVariance = Math.random()*10;
    if (windUpVariance <= 2) {
        windUp -= 3;
    } else if (windUpVariance >= 8) {
        windUp += 3;
    } else {

    }

    // if (windUp <= -400) {
    //     windUp = -200;
    // } else if (windUp >= 250) {
    //     windUp = -50;
    // }

    if (wind >= 50) {
        wind = 10;
    } else if(wind <= -50) {
        wind = -10;
    }

    wind += Math.random()*10 - Math.random()*10;
    // windUpVariance += Math.random()*10 - 5 - windUp / 1000 ;
    // windUp += windUpVariance;
    //console.log(windUp);


    for (var i = 0; i < floatLinks.length; i++) {
        floatLinks[i].body.velocity.y = windUp;
        floatLinks[i].body.velocity.x += wind;
    }

    kite.body.velocity.y += 150/60;

    if (directional.left.isDown){
      kite.body.velocity.x = -75;
    }
    else if (directional.right.isDown){
      kite.body.velocity.x = 75;
    }
    else if (directional.up.isDown || boost.isDown){
      kite.body.velocity.y = -75;
    }
    else if (directional.down.isDown){
      kite.body.velocity.y = 75;
    }


    // kite.body.velocity.x += wind;

    // if(kite.body.velocity.x<0)
    // {
    //     kite.angle = 135;

    // }else if(kite.body.velocity.x>0){

    //     kite.angle = 45;
    // }

    // if(boost.isDown)
    // {
    //     Boost();
    // }

    // yWindUpdate();
    // xWindUpdate();
    // yAcclCap();
    // xAcclCap();


    // game.physics.P2JS.overlap(kite, powerUp, collisionHandler, false, this);



}

function render() {

    game.debug.cameraInfo(game.camera, 32, 32);

}

// Does not work
function move(pointer, x, y, click) {
    kite.body.velocity.x += 1.2*game.input.activePointer.movementX;
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
    }
    else if (kite.body.velocity.y<-600){
        kite.body.velocity.y=-600;
    }
}

function xAcclCap(){
    if(kite.body.velocity.x>300){
        kite.body.velocity.x=300;
    }
    else if (kite.body.velocity.x<-300){
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
    console.log("CAMERA: " + game.camera.x, game.camera.height + "\nKITE: " + kite.x, kite.y);
    gameOverText = game.add.text(game.camera.x + game.width/2, game.camera.y + game.height/2, 'Game Over', { font: '20px Arial', fill: '#fff'});
    gameOverText.anchor.setTo(0.5);
    console.log(gameOverText.x, gameOverText.y);
    kite.kill();
    playerIsAlive = false;

    //restartButton.visible = true;
  }

//
function boundaryCollision() {
  kite.body.collideWorldBounds = true;
}

function hitPowerup(body1, body2) {
    // body1 is the kite's body and body2 is the powerup's body
    console.log("HITPOWERUP HAS BEEN REACHED");
    body2.sprite.kill();
    body1.velocity.y -= 300;
    //body2.kill();
}
