

// Sets up the keyboard controls when game is played on browser
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


// Sets up mouse controls on browser and finger touch controls on mobile
class GestureControls {
    constructor(input, kite) {
        this.input = input
        this.kite = kite

        this.input.onDown.add(this.onTouchDown, this);
        this.input.onUp.add(this.onTouchUp, this);
        this.input.addMoveCallback(function(pointer, x, y, fromClick) {
            this.onTouchMove(pointer, x, y, fromClick);
        }, this);
    }

    onTouchDown() {
        this.pointerIsDown = true;
        // this.touchStartX = this.input.activePointer.x;
        // console.log(this.touchStartX);
    }

    onTouchUp() {
        this.pointerIsDown = false;
    }

    onTouchMove(pointer, x, y, fromClick) {
        if (this.pointerIsDown) {
            var deltaX = this.input.activePointer.x - this.kite.body.x;
            if (deltaX < 25 && deltaX > 5) {
                deltaX = 25;
            } else if (deltaX > -25 && deltaX < 5) {
                deltaX = -25;
            }
            this.kite.body.velocity.x = 1.8*deltaX;
        }
    }
}
