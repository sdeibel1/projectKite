class KeyboardControls {
    constructor(input, kite) {
        this.kite = kite;
        this.directionKeys = input.keyboard.createCursorKeys();
    }

    update() {
        if (this.directionKeys.left.isDown ) {
            this.kite.body.velocity.x = -75;
        } else if (this.directionKeys.right.isDown) {
            this.kite.body.velocity.x = 75;
        } else if (this.directionKeys.up.isDown) {
            this.kite.body.velocity.y = -75;
        } else if (this.directionKeys.down.isDown) {
            this.kite.body.velocity.y = 75;
        }
    }
}

class GestureControls {
    constructor(input, kite, time) {
        this.input = input
        this.kite = kite
        this.time = time;
        this.moveTimer = this.time.create(false);
        // this.moveTimer.loop(100, function(){
        //     this.getX();
        // }, this);
        this.moveTimer.start();
 
        this.input.onDown.add(this.onTouchDown, this);
        this.input.onUp.add(this.onTouchUp, this);
        this.input.addMoveCallback(function(pointer, x, y, fromClick) {
            this.onTouchMove(pointer, x, y, fromClick);
        }, this);
    }

    getX() {
        this.prevX = this.input.activePointer.x;
    }

    onTouchDown() {
        this.pointerIsDown = true;
        this.prevX = this.input.activePointer.x;
    }

    onTouchUp() {
        this.pointerIsDown = false;    
    }

    onTouchMove(pointer, x, y, fromClick) {
        if (this.pointerIsDown) {
            var deltaX = this.input.activePointer.x - this.kite.body.x;
            this.kite.body.velocity.x = 1.8*deltaX;

            // var deltaX = this.input.activePointer.x - this.prevX;
            // this.kite.body.velocity.x = deltaX;
        }
    }
}
