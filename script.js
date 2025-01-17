function myMap(value, fromLow, fromHigh, toLow, toHigh) {
    return ((value - fromLow) * (toHigh - toLow)) / (fromHigh - fromLow) + toLow
}
function getDist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}
class Vector {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    add(v) {
        this.x += v.x
        this.y += v.y
    }
    sub(v) {
        this.x -= v.x
        this.y -= v.y
    }
}
var programCode = function (processingInstance) {
    with (processingInstance) {
        size(window.innerWidth, window.innerHeight)
        frameRate(30)
        //

        class Particle {
            constructor(p, v) {
                this.p = p
                this.v = v
            }
            display() {
                // ellipse(this.p.x, this.p.y, 10, 10)
		textSize(this.v.x*4);
		text(`${this.v.x}, ${this.v.y}`, this.p.x, this.p.y);
                // fill(0,myMap(this.v.x, 0, 1, 0, 255), 0)
                // if (this.v.x >= 0 && this.v.x <= 7) {
                //     fill(78, 0, 0)
                // } else if (this.v.x > 7) {
                //     fill(0, 0, 255)
                // }else{
		// 	fill(0, 255, 0)
		// }
		//change the color of the text based on the x value of the velocity vector
        noStroke()
        colorMode(RGB, 10)
	fill(this.v.x,0, this.v.x)
            }
            move() {
                this.p.x += this.v.x
                this.p.y += this.v.y
                if (this.p.x > width) {
                    this.p.x = 0
                }
            }
            checkCollision() {
                for (let i = 0; i < particles.length; i++) {
                    let other = particles[i]
                    if (this !== other) {
                        if (
                            getDist(this.p.x, this.p.y, other.p.x, other.p.y) <
                            10
                        ) {
                        //     this.v.add(other.v);
                        //     other.v.add(this.v);
                        }
                    }
                }
            }
        }
        let particles = []
        for (let k = 0; k < 50; k++) {
            vector = new Vector(Math.round(Math.random() * 1000)/100, 0)
            position = new Vector(10, Math.random() * window.innerHeight)
            particles.push(new Particle(position, vector))
        }

        draw = function () {
            background(0, 0, 0)
            for (let myP = 0; myP < particles.length; myP++) {
                const myParticle = particles[myP]
                myParticle.display()
                myParticle.move()
                myParticle.checkCollision()
            }

            // x = Math.random()*1000
            // y = Math.random()*1000
        }

        //
    }
}

// Get the canvas that ProcessingJS will use
var canvas = document.getElementById("mycanvas")
// Pass the function to ProcessingJS constructor
var processingInstance = new Processing(canvas, programCode)
