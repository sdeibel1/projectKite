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
    constructor(input, kite) {
        this.input = input
        this.kite = kite

        this.input.onDown.add(this.onTouchDown, this);
        // this.input.onUp.add(this.onTouchUp, this);
        this.input.addMoveCallback(function(pointer, x, y, fromClick) {
            this.onTouchMove(pointer, x, y, fromClick);
        }, this);
    }

    onTouchDown() {
        this.pointerIsDown = true;
        this.touchStartX = this.input.activePointer.x;
        console.log(this.touchStartX);
    }

    onTouchUp() {
        this.pointerIsDown = false;    
    }

    onTouchMove(pointer, x, y, fromClick) {
        if (this.pointerIsDown) {
            var deltaX = this.input.activePointer.x - this.touchStartX;
            this.kite.body.velocity.x = deltaX;
        }
    }
}
