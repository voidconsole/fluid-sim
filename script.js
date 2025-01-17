function myMap(value, fromLow, fromHigh, toLow, toHigh) {
  return (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
}

var programCode = function (processingInstance) {
  with (processingInstance) {
    size(window.innerWidth, window.innerHeight);
    frameRate(30);
    //

    class Particle {
      constructor(x, y, xVel, yVel) {
        this.x = x;
        this.y = y;
        this.xVel = xVel;
        this.yVel = yVel;
      }
      display() {
        ellipse(this.x, this.y, 10, 10);
        fill(myMap(this.xVel, 0, 10, 0,255), myMap(this.yVel, 0, 10, 0,255), 255);
      }
      move() {
        this.x += this.xVel;
        this.y += this.yVel;
        if(this.x > width) {
          this.x = 0;
        }
      }
          }
    let particles = []
    for (let k = 0; k < 50; k++) {
       particles.push(new Particle(10,Math.random()*window.innerHeight,Math.floor(Math.random(11)*10),0))
    }

    draw = function () {
      background(0, 0, 0);
      for (let myP = 0; myP < particles.length; myP++) {
        const myParticle = particles[myP];
        myParticle.move();
        myParticle.display();
      }

      // x = Math.random()*1000
      // y = Math.random()*1000
    };

    //
  }
};

// Get the canvas that ProcessingJS will use
var canvas = document.getElementById("mycanvas");
// Pass the function to ProcessingJS constructor
var processingInstance = new Processing(canvas, programCode);
