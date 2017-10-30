var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {

    // game.load.image('bigClouds', 'assets/images/bigClouds.jpg');

    //testing out new bg

    game.load.image('bigClouds', 'assets/images/bg3.jpg');
    game.load.spritesheet('string', 'assets/images/testString2.png', 4, 26);
    //game.load.spritesheet('chain', 'assets/images/chain.png', 16, 26);
    game.load.spritesheet('kite', 'assets/images/simpleKite.png', 40, 60);

}

// Initializes all variables
var kite;
var tail;
var lives;
var boost;
var directional;

var floatLinks = []; // The number of pieces in the string
var lastRect;
var wind = 0;
var windUp = -10;
var windUpVariance = 0;

function create() {

    game.add.tileSprite(0, 0, 1500, 1500, 'bigClouds');
    // game.world.setBounds(0, 0, 1500, 1500);

    game.world.setBounds(0, 0, 800, 1500);

    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = 0;
    //  Length, xAnchor, yAnchor
    var xCenter = game.world.width/2;


    kite = game.add.sprite(40,60, 'kite');
    kite.anchor.setTo(0,0);
    game.physics.enable(kite, Phaser.Physics.P2JS);


    lives = game.add.group();
    game.add.text(game.world.width - 200, 10, 'Lives : ', { font: '25px Arial', fill: '#fff' });

    directional= game.input.keyboard.createCursorKeys();
    boost = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    createRope(20, xCenter);
    game.input.onDown.add(lock, this);
    game.input.addMoveCallback(move, this);

    // (Clay) I'm guessing this command allows the camera to follow the kite
    // game.camera.follow(lastRect, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);


    //changed this a bit to follow kite object
    game.camera.follow(kite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

}

// Locks your cursor into the kite so you can control it
function lock() {
    if(game.input.mouse.locked) {
        game.input.mouse.releasePointerLock();
        game.input.mouse.locked = false;
    } else {
        game.input.mouse.requestPointerLock();
    }
}

function update() {
    windUpVariance = Math.random()*10;
    if (windUpVariance <= 2) {
        windUp -= 5;
    } else if (windUpVariance >= 8) {
        windUp += 5;
    } else {

    }

    // Why is this commented out? When I un-comment it, nothing seems to change
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

    kite.body.velocity.y = 150;

    if (directional.left.isDown){
            kite.body.velocity.x = -150;
        }
    else if (directional.right.isDown){
            kite.body.velocity.x = 150;
        }


    // kite.body.velocity.x += wind;

    // if(kite.body.velocity.x<0)
    // {
    //     kite.angle = 135;

    // }else if(kite.body.velocity.x>0){

    //     kite.angle = 45;
    // }

    if(boost.isDown)
    {
        Boost();
    }
}


function move(pointer, x, y, click) {
    if (game.input.mouse.locked) {
        for (var i = 0; i < floatLinks.length; i++) {
            // The y movement is broken right now and does not work
            floatLinks[i].body.velocity.y -= 5*game.input.mouse.event.movementY;
            floatLinks[i].body.velocity.x += 5*game.input.mouse.event.movementX;
        }
    }
}

function createRope(length, xAnchor) {
    var height = 16;        //  Height for the physics body - your image height is 8px
    var width = 30;         //  This is the width for the physics body. If too small the rectangles will get scrambled together.
    var maxForce = 30000;    // The force that holds the rectangles together.

    for (var i = 0; i <= length; i++) {
        var x = xAnchor;                    //  All rects are on the same x position
        var y = (game.height) - (i * height);     //  Every new rect is positioned below the last

        if (i % 2 === 0) {
            //  Add sprite (and switch frame every 2nd time)
            if (i === length) {
                width = 80;
                newRect = game.add.sprite(x, y, 'kite');
            } else {
                newRect = game.add.sprite(x, y, 'string');
            }
        } else {
            newRect = game.add.sprite(x, y, 'string');
            lastRect.bringToTop();
        }

        //  Enable physicsbody
        game.physics.p2.enable(newRect, false);

        //  Set custom rectangle
        newRect.body.setRectangle(width, height);

        if (i === 0) {
            //  Anchor the first one created
            newRect.body.static = true;
        } else {
           newRect.body.mass = length / i;     //  Reduce mass for evey rope element
        }

        //  After the first rectangle is created we can add the constraint
        if (lastRect) {
            game.physics.p2.createRevoluteConstraint(newRect, [0, 10], lastRect, [0, -10], maxForce);
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
    kite.body.velocity.y=-200;
}
