function myMap(value, fromLow, fromHigh, toLow, toHigh) {
	return ((value - fromLow) * (toHigh - toLow)) / (fromHigh - fromLow) + toLow;
}
function getDist(a, b) {
	return Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y);
}
function triangulate(colliders) {
	for (let i = 0; i < colliders.length; i++) {
		colliders[i].display();
		colliders[i].move();
	}
	for (let i = 0; i < colliders.length; i++) {
		for (let j = i + 1; j < colliders.length; j++) {
			colliders[i].collide(colliders[j]);
		}
	}
}

class Vector {
	constructor(x, y) { this.x = x; this.y = y; }
	add(v) { this.x += v.x; this.y += v.y; }
	sub(v) { this.x -= v.x; this.y -= v.y; }
	scale(s) { this.x *= s; this.y *= s; }
}

let thisWorld = null;
let collisions = 0;
let isPaused = false;
let processingInstance = null;
var maxParticleSpeed = 15;

var programCode = function (processingInstance) {
	with (processingInstance) {
		size(window.innerWidth, window.innerHeight);
		frameRate(thisWorld ? thisWorld.frameRate : 30);

		class Particle {
			constructor(size, position, velocity, density = 0.01) {
				this.size = size;
				this.position = position;
				this.velocity = velocity;
				this.mass = size * density;
			}
			display() {
				noStroke();
				colorMode(RGB, 255);
				let speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
				const maxSpeed = (typeof maxParticleSpeed === 'number' && maxParticleSpeed > 0) ? maxParticleSpeed : 15;
				const s = Math.min(speed, maxSpeed);
				let red = myMap(s, 0, maxSpeed, 0, 255);
				let blue = myMap(s, 0, maxSpeed, 255, 0);
				red = Math.max(0, Math.min(255, red));
				blue = Math.max(0, Math.min(255, blue));
				fill(red, 0, blue);
				ellipse(this.position.x, this.position.y, this.size, this.size);
			}
			move() {
				if (this.position.x > width) {
					if (thisWorld.containX) this.velocity.x = -this.velocity.x;
					else this.position.x = 0;
				} else if (this.position.x < 0) {
					if (thisWorld.containX) this.velocity.x = -this.velocity.x;
					else this.position.x = width;
				}
				if (this.position.y > height) {
					if (thisWorld.containY) this.velocity.y = -this.velocity.y;
					else this.position.y = 0;
				} else if (this.position.y < 0) {
					if (thisWorld.containY) this.velocity.y = -this.velocity.y;
					else this.position.y = height;
				}
				this.position.add(this.velocity);
			}
			collide(other) {
				if (getDist(this, other) <= this.size / 2 + other.size / 2) {
					let hyp = Math.hypot(
						other.position.x - this.position.x,
						other.position.y - this.position.y
					);
					var normal = new Vector(
						(other.position.x - this.position.x) / hyp,
						(other.position.y - this.position.y) / hyp
					);
					var overlap = (getDist(this, other) - (this.size / 2 + other.size / 2)) / 2;
					var backoff = new Vector(normal.x * overlap, normal.y * overlap);
					this.position.add(backoff);
					other.position.sub(backoff);
					var relative = new Vector(this.velocity.x - other.velocity.x, this.velocity.y - other.velocity.y);
					var influence = relative.x * normal.x + relative.y * normal.y;
					var delta = new Vector(influence * normal.x, influence * normal.y);
					this.velocity.sub(delta);
					other.velocity.add(delta);
					collisions += 1;
				}
			}
		}

		let particles = [];
		for (let k = 0; k < thisWorld.particleCount; k++) {
			let [size, position, velocity] = thisWorld.particleGenerator(k);
			particles.push(new Particle(size, position, velocity));
		}

		draw = function () {
			background(4, 8, 12);
			triangulate(particles);
		};
	}
};

function startSimulation(world) {
	thisWorld = world;
	collisions = 0;
	isPaused = false;

	const canvas = document.getElementById('mycanvas');
	if (processingInstance) {
		try { processingInstance.exit(); } catch (e) { }
	}
	processingInstance = new Processing(canvas, programCode);
	updatePlayPauseBtn();
}

function handlePlayPause() {
	if (!processingInstance) return;
	isPaused = !isPaused;
	if (isPaused) processingInstance.noLoop();
	else processingInstance.loop();
	updatePlayPauseBtn();
}

function handleRestart() {
	if (thisWorld) startSimulation(thisWorld);
}

function updatePlayPauseBtn() {
	const icon = document.getElementById('play-icon');
	const label = document.getElementById('play-label');
	if (!icon || !label) return;
	icon.textContent = isPaused ? '▶' : '⏸';
	label.textContent = isPaused ? 'Play' : 'Pause';
}

let prevCollisions = 0;
setInterval(() => {
	const el = document.getElementById('collision-count');
	if (!el) return;
	const formatted = collisions.toLocaleString();
	el.textContent = formatted;
	if (collisions !== prevCollisions) {
		el.classList.add('bump');
		setTimeout(() => el.classList.remove('bump'), 300);
		prevCollisions = collisions;
	}
}, 120);
