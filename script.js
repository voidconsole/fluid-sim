function myMap(value, fromLow, fromHigh, toLow, toHigh) {
	return ((value - fromLow) * (toHigh - toLow)) / (fromHigh - fromLow) + toLow
}
function getDist(a, b) {
	return (((a.position.x - b.position.x) ** 2 + (a.position.y - b.position.y) ** 2) ** (1 / 2))
}


function triangulate(colliders) {
	for (let i = 0; i < colliders.length; i++) {
		colliders[i].display()
		colliders[i].move()
	}
	for (let i = 0; i < colliders.length; i++) {
		for (let j = i + 1; j < colliders.length; j++) {
			colliders[i].collide(colliders[j])
		}
	}
}

function particleGenerator(index){
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 10;
	let position = new Vector(rnd() * w, rnd() * h);
	let velocity;
	if(position.y < 450) {
		velocity = new Vector(2,rnd());
	}
	else if (position.y > 450 && position.y < 500) {
		// position = new Vector(position.x, position.y + 200);
		velocity = new Vector(20, rnd());
	}
	else {
		velocity = new Vector(2, rnd());
	}
	return new Particle(size, position, velocity);
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

		class Particle {
			constructor(size, position, velocity) {
				this.size = size
				this.position = position
				this.velocity = velocity
			}
			display() {
				noStroke();
				colorMode(RGB, 255);
				let speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
				let red = myMap(speed, 0, 10, 0, 255); // later change to speedRed = myMap(this.velocity.x, 0, 10, 0, 255)
				let blue = myMap(speed, 0, 10, 255, 0); // later change to speedBlue = myMap(this.velocity.x, 0, 10, 0, 255)
				fill(red, 0, blue);
				ellipse(
					this.position.x,
					this.position.y,
					this.size,
					this.size
				);
			}
			move() {
				if (this.position.x > width || this.position.x < 0) {
					this.position.x = 0;
					// this.velocity.x = -this.velocity.x;
				}
				if (this.position.y > height || this.position.y < 0) {
					// this.position.y = 0;	
					this.velocity.y = -this.velocity.y;
				}
				this.position.add(this.velocity);
			}
			collide(other) {
				if (getDist(this, other) <= this.size / 2 + other.size / 2) {
					var normal = new Vector(
						(other.position.x - this.position.x) /
						Math.hypot(
							other.position.x - this.position.x,
							other.position.y - this.position.y
						),
						(other.position.y - this.position.y) /
						Math.hypot(
							other.position.x - this.position.x,
							other.position.y - this.position.y
						)
					)


					var overlap = (getDist(this, other) - (this.size / 2 + other.size / 2)) / 2
					var backoff = new Vector(normal.x * overlap, normal.y * overlap)
					this.position.add(backoff)
					other.position.sub(backoff)

					var relative = new Vector(this.velocity.x - other.velocity.x, this.velocity.y - other.velocity.y)
					var influence = relative.x * normal.x + relative.y * normal.y
					var delta = new Vector(influence * normal.x, influence * normal.y);
					this.velocity.sub(delta);
					other.velocity.add(delta);
					console.log("Collide");
				}
			}
		}

		let particles = [];

		for (let k = 0; k < 500; k++) {
			particles.push(particleGenerator(k));
		}

		draw = function () {
			background(0, 0, 0);
			triangulate(particles);
		}


	}
}

var canvas = document.getElementById("mycanvas")
var processingInstance = new Processing(canvas, programCode)
