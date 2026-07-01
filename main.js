
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

class Particle {
	constructor(size, position, velocity, mass = 1, rigidity = false, trail = [null, null]) {
		this.radius = size/2
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
			this.trail[1] = ops.sum(this.position, this.velocity)
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
function triangulate(colliders) {
	for (let i = 0; i < colliders.length; i++) {
		colliders[i].move();
	}

	for (let i = 0; i < colliders.length; i++) {
		for (let j = i + 1; j < colliders.length; j++) {
			colliders[i].collide(colliders[j]);
		}
	}
	for (let i = 0; i < colliders.length; i++) {
		colliders[i].display();
	}
}


function initParticles() {
	particles = []
	for (let k = 0; k < thisWorld.particleCount; k++) {
		let [size, position, velocity, mass] = thisWorld.particleGenerator(k)
		particles.push(new Particle(size, position, velocity, mass, false, thisWorld.trailEnabled ? [position, position] : [null, null]))
	}

}

function setup() {
	let cnv = createCanvas(window.innerWidth, window.innerHeight)
	cnv.id('mycanvas')
	colorMode(RGB, 255)
	if (panelOpen) cnv.elt.classList.add('panel-open')
}

function draw() {
	background(4, 8, 12)
	if (!thisWorld) return
	triangulate(particles)
}

function startSimulation(world) {
	console.log("Warning: Momentum will not be conserved if walls are enabled")
	thisWorld = world
	collisions = 0
	isPaused = false

	initParticles()
	if (typeof frameRate === 'function') frameRate(thisWorld.frameRate || 30)
	if (typeof loop === 'function') loop()
	updatePlayPauseBtn()
}
function handlePlayPause() {
	isPaused = !isPaused
	if (isPaused) window.noLoop();
	else window.loop();
	updatePlayPauseBtn()
	console.log("Momentum:" + totalMomentum() + " Energy:", totalEnergy())
}

function handleRestart() {
	if (thisWorld) startSimulation(thisWorld)
}

function updatePlayPauseBtn() {
	const icon = document.getElementById("play-icon")
	const label = document.getElementById("play-label")
	if (!icon || !label) return
	icon.textContent = isPaused ? "▶" : "⏸"
	label.textContent = isPaused ? "Play" : "Pause"
}
function windowResized() {
	resizeCanvas(window.innerWidth, window.innerHeight)
}

function svgHandler(svgObject) {
	let path = svg.Object(svgObject).select('path')
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
