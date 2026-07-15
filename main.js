

ops = {
	sum: (A, B) => {
		return new Vector(A.x + B.x, A.y + B.y)
	},
	difference: (A, B) => {
		return new Vector(A.x - B.x, A.y - B.y)
	},
	dot: (A, B) => {
		return A.x * B.x + A.y * B.y
	},
	cross: (A, B) => {
		return A.x * B.y - A.y * B.x
	},
	magnitude: (A) => {
		return (A.x ** 2 + A.y ** 2) ** (1 / 2)
	},
	scale: (A, s) => {
		return new Vector(A.x * s, A.y * s)
	},
	unit: (A) => {
		return new Vector(A.x / (A.x ** 2 + A.y ** 2) ** (1 / 2), A.y / (A.x ** 2 + A.y ** 2) ** (1 / 2))
	}
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
	mult(s) {
		this.x *= s
		this.y *= s
	}
}

class Wall {
	constructor(start, end) {
		this.start = start
		this.end = end
		this.direction = ops.difference(this.end, this.start)
	}
	display() {
		stroke(255)
		strokeWeight(1)
		line(this.start.x, this.start.y, this.end.x, this.end.y)
		// ellipse(this.start.x, this.start.y, this.end.x - this.start.x, this.end.y - this.start.y)
	}
	bounce(particle) {
		let proximity = ops.difference(particle.position, this.start);
		let wallLength = ops.magnitude(this.direction);
		if (wallLength === 0) return;
		let shadow = ops.dot(this.direction, proximity) / wallLength;
		if (shadow > wallLength || shadow < 0) return; // check if particle is within the line segment bounds
		let perpendicular = ops.cross(this.direction, proximity) / wallLength; // distance to particle

		if (Math.abs(perpendicular) <= particle.radius) {
			let sign = perpendicular >= 0 ? 1 : -1;
			let normal = ops.unit(new Vector(-this.direction.y * sign, this.direction.x * sign));
			let overlap = particle.radius - Math.abs(perpendicular);
			let backoff = ops.scale(normal, overlap);
			particle.position.add(backoff);
			let projection = ops.dot(particle.velocity, normal);
			if (projection < 0) { // Only bounce if moving towards the wall
				let delta = ops.scale(normal, 2 * projection);
				particle.velocity.sub(delta);
			}
		}
	}
}
class Particle {
	constructor(size, position, velocity, mass = 1, rigidity = false, trail = [null, null]) {
		this.radius = size / 2
		this.size = size
		this.position = position
		this.mass = mass
		this.velocity = velocity
		this.rigid = rigidity
		this.trail = trail
	}
	display() {
		noStroke()
		let speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2)
		const maxSpeed =
			typeof maxParticleSpeed === "number" && maxParticleSpeed > 0
				? maxParticleSpeed
				: 15
		const s = Math.min(speed, maxSpeed)
		let red = lerpBetween(s, 0, maxSpeed, 0, 255)
		let blue = lerpBetween(s, 0, maxSpeed, 255, 0)
		red = Math.max(0, Math.min(255, red))
		blue = Math.max(0, Math.min(255, blue))
		fill(red, 0, blue)
		ellipse(this.position.x, this.position.y, this.size, this.size)
	}
	move() {
		if (this.position.x >= width) {
			if (thisWorld.containX) this.velocity.x = -this.velocity.x
			else this.position.x = 0
		} else if (this.position.x <= 0) {
			if (thisWorld.containX) this.velocity.x = -this.velocity.x
			else this.position.x = width
		}
		if (this.position.y >= height) {
			if (thisWorld.containY) this.velocity.y = -this.velocity.y
			else this.position.y = 0
		} else if (this.position.y <= 0) {
			if (thisWorld.containY) this.velocity.y = -this.velocity.y
			else this.position.y = height
		}
		if (this.trail[0] !== null && this.trail[1] !== null) {
			this.trail[0] = new Vector(this.position.x, this.position.y)
			this.trail[1] = ops.sum(this.position, ops.scale(this.velocity, -this.trail[2]))
			stroke(255)
			strokeWeight(2)
			line(this.trail[0].x, this.trail[0].y, this.trail[1].x, this.trail[1].y)
		}
		this.position.add(this.velocity)
	}
	collide(other) {
		const particleDist = getDist(this, other)
		if (particleDist <= this.radius + other.radius) {
			let hyp = Math.hypot(
				other.position.x - this.position.x,
				other.position.y - this.position.y,
			)
			let normal = ops.scale(ops.difference(other.position, this.position), 1 / hyp)
			// this was supposed to be dimensions of mass. and using case A = B, it tells it must be a mean, and using A = Infinity, tells it should be harmonic mean
			let harmonic = 2 / ((1 / this.mass) + (1 / other.mass)) // Not using reduced form because inf mass results in NaN
			let overlap = (particleDist - (this.radius + other.radius)) / 2
			// if (Math.abs(overlap) > 0.00002) {
			let backoff = ops.scale(normal, overlap)
			this.position.add(ops.scale(backoff, (harmonic / this.mass)))
			other.position.sub(ops.scale(backoff, (harmonic / other.mass)))
			// }
			hyp = Math.hypot(
				other.position.x - this.position.x,
				other.position.y - this.position.y,
			); normal = ops.scale(ops.difference(other.position, this.position), 1 / hyp) // recompute normals
			let relative = ops.difference(this.velocity, other.velocity)
			let projection = ops.dot(normal, relative)
			let delta = ops.scale(normal, projection)

			if (projection <= 0) return; // only bounce if moving toward each other
			this.velocity.sub(ops.scale(delta, (harmonic / this.mass)))
			other.velocity.add(ops.scale(delta, (harmonic / other.mass)))
			collisions += 1
		}
	}
}


let thisWorld = null
let collisions = 0
let isPaused = false
let particles = []
let walls = []

function totalEnergy() {
	energy = 0
	for (let p of particles) {
		energy += 0.5 * p.mass * (p.velocity.x ** 2 + p.velocity.y ** 2)
	}
	return energy
}
function totalMomentum() {
	momentumX = 0
	momentumY = 0
	for (let p of particles) {
		momentumX += p.velocity.x * p.mass
		momentumY += p.velocity.y * p.mass
	}
	return [momentumX, momentumY]
}

function lerpBetween(value, fromLow, fromHigh, toLow, toHigh) {
	return ((value - fromLow) * (toHigh - toLow)) / (fromHigh - fromLow) + toLow
}
function getDist(a, b) {
	return Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y)
}
function triangulate(colliders, contraints) {
	for (let i = 0; i < colliders.length; i++) {
		colliders[i].move();
		contraints.forEach((constraint) => constraint.bounce(colliders[i]));
	}

	for (let i = 0; i < colliders.length; i++) {
		for (let j = i + 1; j < colliders.length; j++) {
			colliders[i].collide(colliders[j]);
		}
	}
	contraints.forEach((constraint) => constraint.display());
	for (let i = 0; i < colliders.length; i++) {
		colliders[i].display();
	}
}


function initWalls() {
	// let MyWall = new Wall(new Vector(0, 200), new Vector(100, 500))
	// walls.push(MyWall)
}
function initParticles() {
	particles = []
	for (let k = 0; k < thisWorld.particleCount; k++) {
		let [size, position, velocity, mass] = thisWorld.particleGenerator(k)
		particles.push(new Particle(size, position, velocity, mass, false, thisWorld.trailLength ? [position, position, thisWorld.trailLength] : [null, null, 0]))
	}

}

function setup() {
	let cnv = createCanvas(window.innerWidth, window.innerHeight)
	cnv.id('mycanvas')
	colorMode(RGB, 255)
	if (panelOpen) cnv.elt.classList.add('panel-open')
	handleInteractions()
}

function draw() {
	background(4, 8, 12)
	if (!thisWorld) return
	triangulate(particles, walls)
}

function startSimulation(world) {
	console.log("Warning: Momentum will not be conserved if walls are enabled")
	thisWorld = world
	collisions = 0
	isPaused = false
	initWalls()
	initParticles()
	if (typeof frameRate === 'function') frameRate(thisWorld.frameRate || 30)
	if (typeof loop === 'function') loop()
	updatePlayPauseBtn()
	handleInteractions()
}
function handlePlayPause() {
	handleInteractions()
	isPaused = !isPaused
	if (isPaused) window.noLoop()
	else window.loop()
	updatePlayPauseBtn()
	console.log("Momentum:" + totalMomentum() + " Energy:", totalEnergy())
}

function handleRestart() {
	if (thisWorld) {
		startSimulation(thisWorld)
		walls = []
	}
}

function updatePlayPauseBtn() {
	const label = document.getElementById("play-label")
	label.textContent = isPaused ? "Play" : "Pause"
}
function windowResized() {
	resizeCanvas(window.innerWidth, window.innerHeight)
}

function svgHandler(svgObject) {
	let path = svg.Object(svgObject).select('path')
}



let interactionsInit = false;
function handleInteractions() {
	if (interactionsInit) return;
	interactionsInit = true;
	let dragged = false
	let start = null
	window.addEventListener("mousedown", (e) => {
		start = new Vector(e.clientX, e.clientY)
		dragged = false
	})
	document.addEventListener("mousemove", () => {
		dragged = true
	})
	window.addEventListener("mouseup", (e) => {
		if (!dragged) return
		const end = new Vector(e.clientX, e.clientY)
		walls.push(new Wall(start, end))
		walls[walls.length - 1].display()
	})
	window.addEventListener("keydown", (e) => {
		if (e.key === " ") {
			e.preventDefault()
			handlePlayPause()
		} else if (e.key === "r") {
			handleRestart()
		}
	});
}


let prevCollisions = 0
setInterval(() => {
	const el = document.getElementById("collision-count")
	if (!el) return
	const formatted = collisions.toLocaleString()
	el.textContent = formatted
	if (collisions !== prevCollisions) {
		el.classList.add("bump")
		setTimeout(() => el.classList.remove("bump"), 300)
		prevCollisions = collisions
	}
}, 120)
