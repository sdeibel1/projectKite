var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('bigClouds', 'assets/images/bigClouds.jpg');
    game.load.spritesheet('chain', 'assets/images/chain.png', 16, 26);
    game.load.spritesheet('kite', 'assets/images/simpleKite.png', 40, 60);

}

var floatLinks = [];
var lastRect;
var wind = 0;
var windUp = -10;
var windUpVariance = 0;

function create() {

    game.add.tileSprite(0, 0, 1500, 1500, 'bigClouds');
    game.world.setBounds(0, 0, 1500, 1500);
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = 0;
    //  Length, xAnchor, yAnchor
    var xCenter = game.world.width/2;

    createRope(20, xCenter);
    game.input.onDown.add(lock,this);
    game.input.addMoveCallback(move, this);
    game.camera.follow(lastRect, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

}

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

    for (var i = 0; i <= length; i++)
    {
        var x = xAnchor;                    //  All rects are on the same x position
        var y = (game.height) - (i * height);     //  Every new rect is positioned below the last

        if (i % 2 === 0)
        {
            //  Add sprite (and switch frame every 2nd time)
            if (i === length) {
                newRect = game.add.sprite(x, y, 'kite');
            } else {
                newRect = game.add.sprite(x, y, 'chain', 1);
            }
        }
        else
        {
            newRect = game.add.sprite(x, y, 'chain', 1);
            lastRect.bringToTop();
        }

        //  Enable physicsbody
        game.physics.p2.enable(newRect, false);

        //  Set custom rectangle
        newRect.body.setRectangle(width, height);

        if (i === 0)
        {
            //  Anchor the first one created
            newRect.body.static = true;
        }
        else
        {
           newRect.body.mass = length / i;     //  Reduce mass for evey rope element
        }

        //  After the first rectangle is created we can add the constraint
        if (lastRect)
        {
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
