var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('clouds', 'clouds.jpg');
   // game.load.image('clouds', 'clouds.jpg');
    game.load.spritesheet('chain', 'chain.png', 16, 26);

}

var floatLinks = [];
var lastRect;
var wind = 0;
var windUp = -10;
var windUpVariance = 0;

function create() {

    game.add.tileSprite(0, 0, 800, 600, 'clouds');
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = 0;

    //  Length, xAnchor, yAnchor
    createRope(20, 400, 200);
    game.input.onDown.add(lock,this);
    game.input.addMoveCallback(move, this);
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
    console.log(windUp);


    for (var i = 0; i < floatLinks.length; i++) {
        floatLinks[i].body.velocity.y = windUp;
        floatLinks[i].body.velocity.x += wind;
    }

    // lastRect.body.velocity.x += wind;
    // lastRect.body.velocity.y = windUp;
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

function createRope(length, xAnchor, yAnchor) {
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
            newRect = game.add.sprite(x, y, 'chain', 1);
        }   
        else
        {
            newRect = game.add.sprite(x, y, 'chain', 0);
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
