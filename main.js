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
		const mag = Math.hypot(A.x, A.y)
		if (mag === 0) return new Vector(0, 0)
		return new Vector(A.x / mag, A.y / mag)
	},
	project: (A, B, clamp = false) => {
		const denom = B.x ** 2 + B.y ** 2
		if (denom === 0) return new Vector(0, 0) // Prevents division by zero
		let s = (A.x * B.x + A.y * B.y) / denom
		if (clamp) {
			s = Math.max(0, Math.min(1, s))
		}
		return new Vector(B.x * s, B.y * s)
	},
	intersect: (A1, A2, B1, B2, coordinate = false) => {
		const o1 = (A2.y - A1.y) * (B1.x - A2.x)
			- (A2.x - A1.x) * (B1.y - A2.y)

		const o2 = (A2.y - A1.y) * (B2.x - A2.x)
			- (A2.x - A1.x) * (B2.y - A2.y)

		const o3 = (B2.y - B1.y) * (A1.x - B2.x)
			- (B2.x - B1.x) * (A1.y - B2.y)

		const o4 = (B2.y - B1.y) * (A2.x - B2.x)
			- (B2.x - B1.x) * (A2.y - B2.y)

		const crosses = (o1 * o2 < 0) && (o3 * o4 < 0)
		if (!coordinate) return crosses
		if (!crosses) return null
		const weight = o1 / (o1 - o2)
		return new Vector(
			B1.x + weight * (B2.x - B1.x),
			B1.y + weight * (B2.y - B1.y)
		)
	},
	rotate: (A, theta) => {  // theta must be in radians
		/* [ cost -sint ] [x]
		    [ sint  cost ] [y] */
		//applying linear transformation of a rotation matrix 
		const cos = Math.cos(theta)
		const sin = Math.sin(theta)
		return new Vector(cos * A.x - sin * A.y, sin * A.x + cos * A.y)
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
	rotate(theta) {
		const cos = Math.cos(theta)
		const sin = Math.sin(theta)
		let x = cos * this.x - sin * this.y
		let y = sin * this.x + cos * this.y
		this.x = x
		this.y = y
	}
}
// class absorber {
// 	constructor(start, end, size, mass, rate) {
// 		this.start = start
// 		this.end = end
// 		this.position = position
// 		this.velocity = velocity
// 		this.size = size
// 		this.rate = rate
// 		this.wall = ops.difference(this.end, this.start)
// 	}
// 	display() {
// 		if (typeof stroke !== 'function') return
// 		stroke(255)
// 		strokeWeight(1)
// 		line(this.start.x, this.start.y, this.end.x, this.end.y)
// 	}
// 	absorb(particle) {
// 		if (particle.rigid) return
// 		if (particle.lastcontact === this) return
// 		const index = fruits.indexOf('banana'); // Finds the first 'banana' at index 1

// 		if (index !== -1) {
// 			particles.splice(index, 1); // Removes exactly 1 item at that index
// 		}
// 		particles.remove(particle)
// }
// }
// class emitter {
// 	constructor(start, end, size, mass, rate) {
// 		this.start = start
// 		this.end = end
// 		this.position = position
// 		this.velocity = velocity
// 		this.size = size
// 		this.rate = rate
// 		this.wall = ops.difference(this.end, this.start)
// 	}
// 	display() {
// 		if (typeof stroke !== 'function') return
// 		stroke(255)
// 		strokeWeight(1)
// 		line(this.start.x, this.start.y, this.end.x, this.end.y)
// 	}	
// }
class Wall {
	constructor(start, end, anchorSize = anchor) {
		this.start = start
		this.end = end
		this.wall = ops.difference(this.end, this.start)
		this.direction = ops.unit(this.wall)
		this.length = ops.magnitude(this.wall)
		particles.push(new Particle(anchorSize, this.start, new Vector(0, 0), 1, true))
		particles[particles.length - 1].display()
		particles.push(new Particle(anchorSize, this.end, new Vector(0, 0), 1, true))
		particles[particles.length - 1].display()
	}

	display() {
		if (typeof stroke !== 'function') return
		stroke(255)
		strokeWeight(1)
		line(this.start.x, this.start.y, this.end.x, this.end.y)
		// ellipse(this.start.x, this.start.y, this.end.x - this.start.x, this.end.y - this.start.y)
	}
	bounce(particle) {
		// console.log("bouncing", particle)
		if (particle.rigid) return
		if (particle.lastcontact === this) return
		let P = ops.difference(particle.position, this.start) // wall frame
		let projection = ops.project(P, this.wall, true)
		let normal = ops.difference(ops.project(P, this.wall, true), P)
		if (ops.magnitude(normal) < particle.radius) {
			const correction = ops.scale(
				ops.unit(normal),
				ops.magnitude(normal) - particle.radius
			)
			particle.position.add(correction)
			const delta = ops.dot(particle.velocity, ops.unit(normal))
			if (delta > 0) {
				particle.velocity.sub(ops.scale(ops.unit(normal), 2 * delta)
				)
			}
			particle.lastcontact = this
			return
		}
		if (!ops.intersect(particle.position, ops.sum(particle.position, particle.velocity), this.start, this.end)) return
		P = ops.difference(particle.position, this.start) // wall frame
		normal = ops.difference(ops.project(P, this.wall, false), P)
		let G = ops.sum(P, particle.velocity) // ghost
		let apexP = ops.sum(P, ops.scale(ops.unit(normal), particle.radius)) // apex point
		let apexG = ops.sum(G, ops.scale(ops.unit(normal), particle.radius))
		if (ops.cross(apexG, this.wall) * ops.cross(apexP, this.wall) <= 0) {
			// console.log("collided", apexG, Pa, n, ops.cross(Ga, this.wall), ops.cross(Pa, this.wall))
			// let GTFPs = ops.sum(apexG, ops.scale(n, -2))
			let apexGNormal = ops.difference(
				ops.project(apexG, this.wall, false),
				apexG
			)
			let prediction = ops.sum(this.start, ops.sum(G, ops.scale(apexGNormal, 2))) // world frame from wall frame
			particle.position = prediction
			if (!particle.rigid) particle.velocity.add(ops.scale(ops.project(particle.velocity, normal), -2)) //reflect v
			// console.log(" True ghost 	future position", prediction, "future velocity", FutureVelocity)
			particle.lastcontact = this
			particle.skipnext = true
		}

	}
}


class Particle {
	constructor(size, position, velocity, mass = 1, rigid = false, trail = [null, null]) {
		this.radius = size / 2
		this.size = size
		this.position = position
		this.mass = rigid ? Infinity : mass
		this.rigid = rigid
		this.velocity = velocity
		this.trail = trail
		this.lastcontact = null
		this.skipnext = false
	}
	display() {
		if (typeof noStroke !== 'function') return
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
		if (this.rigid) fill(255, 255, 0)
		else fill(red, 0, blue)
		ellipse(this.position.x, this.position.y, this.size, this.size)
	}
	move() {
		if (this.position.x > width) {
			this.lastcontact = null
			applyConstraint(this, getConstraintFor("right"), "x", 0)
		} else if (this.position.x < 0) {
			this.lastcontact = null
			applyConstraint(this, getConstraintFor("left"), "x", width)
		}
		if (this.position.y > height) {
			this.lastcontact = null
			applyConstraint(this, getConstraintFor("bottom"), "y", 0)
		} else if (this.position.y < 0) {
			this.lastcontact = null
			applyConstraint(this, getConstraintFor("top"), "y", height)
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
		if (this.rigid && other.rigid) return
		// if (this.lastcontact === other || other.lastcontact === this) return  // consider persistent contact
		let difference = ops.difference(
			other.position,
			this.position
		)
		let hyp = ops.magnitude(difference)

		if (hyp === 0) { // prevent superposition
			difference = new Vector(Math.random() - 0.5, Math.random() - 0.5)
			hyp = ops.magnitude(difference)
		}

		let overlap = (hyp - (this.radius + other.radius)) / 2
		if (overlap < 0) {
			let normal = ops.scale(difference, 1 / hyp)
			// this was supposed to be dimensions of mass. and using case A = B, it tells it must be a mean, and using A = Infinity, tells it should be harmonic mean
			let harmonic = 2 / ((1 / this.mass) + (1 / other.mass)) // Not using reduced form because inf mass results in NaN
			if (harmonic === Infinity) harmonic = Math.min(this.mass, other.mass)
			let backoff = ops.scale(normal, overlap)
			this.position.add(ops.scale(backoff, (harmonic / this.mass))) // pauli exclusion ;)
			other.position.sub(ops.scale(backoff, (harmonic / other.mass)))

			let relative = ops.difference(
				this.velocity,
				other.velocity
			)
			let projection = ops.dot(normal, relative)

			if (projection > 0) { // only if heading towards
				let delta = ops.scale(normal, projection)
				this.velocity.sub(ops.scale(delta, (harmonic / this.mass)))
				other.velocity.add(ops.scale(delta, (harmonic / other.mass)))
				this.lastcontact = other
				other.lastcontact = this
				collisions += 1
			}

		}

	}
}


let thisWorld = null
let collisions = 0
let isPaused = false
let worldLoading = false
let particles = []
let walls = []
let anchor = 4
let pathdensity = 50
let pathAnchor = 4
let pathScale = 1
let pathoffset = { transform: new Vector(window.innerWidth / 2, window.innerHeight / 2), theta: 0 }
let shapeWalls = []
let shapeCornerParticles = []
// let emit = thisWorld.constrainX 

function totalEnergy() {
	energy = 0
	for (let p of particles) {
		if (p.rigid) continue
		energy += 0.5 * p.mass * (p.velocity.x ** 2 + p.velocity.y ** 2)
	}
	return energy
}
function totalMomentum() {
	momentumX = 0
	momentumY = 0
	for (let p of particles) {
		if (p.rigid) continue
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
	// for (let i = 0; i < colliders.length; i++) {
	// 	for (let j = i + 1; j < colliders.length; j++) {
	// 		colliders[i].collide(colliders[j]);
	// 	}
	// }

	handleEmitters(colliders)
	for (let i = 0; i < colliders.length; i++) {
		contraints.forEach((constraint) => {
			constraint.bounce(colliders[i])
		})
	}

	for (let i = 0; i < colliders.length; i++) {
		if (colliders[i].rigid) continue
		if (colliders[i].skipnext) { colliders[i].skipnext = false; continue }
		colliders[i].move()
	}
	if (toRemove.length) {
		const removeSet = new Set(toRemove) // using temp list to not mutate colliders when  iterating
		for (let i = colliders.length - 1; i >= 0; i--) {
			if (removeSet.has(colliders[i])) colliders.splice(i, 1)
		}
		toRemove.length = 0
	}
	for (let i = 0; i < colliders.length; i++) {
		for (let j = i + 1; j < colliders.length; j++) {
			colliders[i].collide(colliders[j]);
		}
	}
	for (let i = 0; i < colliders.length; i++) {
		contraints.forEach((constraint) => {
			constraint.bounce(colliders[i])
		})
	}

	for (let i = 0; i < colliders.length; i++) {
		colliders[i].display()
	}
	contraints.forEach((constraint) => constraint.display());
}


function initWalls() {
	walls = []
	// if(thisWorld.containX) {
	// 	walls.push(new Wall(new Vector(-1, 0), new Vector(-1, window.innerHeight)))
	// 	walls.push(new Wall(new Vector(window.innerWidth + 1, 0), new Vector(window.innerWidth + 1, window.innerHeight)))
	// }
	// if(thisWorld.containY) {
	// 	walls.push(new Wall(new Vector(0, -1), new Vector(window.innerWidth, -1)))
	// 	walls.push(new Wall(new Vector(0, window.innerHeight + 1), new Vector(window.innerWidth, window.innerHeight + 1)))
	// }
	if (thisWorld.wallCount && thisWorld.wallGenerator) {
		for (let k = 0; k < thisWorld.wallCount; k++) {
			let [start, end, anchorSize] = thisWorld.wallGenerator(k)
			walls.push(new Wall(start, end, anchorSize))
		}
	}
	refillEmitter(thisWorld.constrainX)
	refillEmitter(thisWorld.constrainY)
	handleInteractions()
	renderPath()
}

function initParticles() {
	particles = []
	for (let k = 0; k < thisWorld.particleCount; k++) {
		let [size, position, velocity, mass] = thisWorld.particleGenerator(k)
		particles.push(new Particle(size, position, velocity, mass, false, thisWorld.trailLength ? [position, position, thisWorld.trailLength] : [null, null, 0]))
	}
	// particles.push(new Particle(30, new Vector(80, 120), new Vector(10, 10), 10))
	// particles.push(new Particle(30, new Vector(13, 10), new Vector(10, 10), 3))
	// particles.push(new Particle(30, new Vector(13, 10), new Vector(10, 10), -12))


	// particles.push(new Particle(30, new Vector(13, 20), new Vector(40, 1), 1, false))
	// particles.push(new Particle(30, new Vector(13, 30), new Vector(20, 10), 1, false))
	// particles.push(new Particle(30, new Vector(13, 40), new Vector(20, 10), 1, false))
	// particles.push(new Particle(30, new Vector(13, 50), new Vector(20, 10), 1, false))

}

function populateIntersections(newWall) {
	if (newWall) {
		for (const other of walls) {
			if (other === newWall) continue
			const intersection = ops.intersect(newWall.start, newWall.end, other.start, other.end, true)
			if (!intersection) continue
			particles.push(new Particle(anchor, intersection, new Vector(0, 0), 1, true))
			particles[particles.length - 1].display()
		}
		return
	}
	// rebuild all intersections only on setup/restart
	for (let i = 0; i < walls.length; i++) {
		for (let j = i + 1; j < walls.length; j++) {
			const intersection = ops.intersect(walls[i].start, walls[i].end, walls[j].start, walls[j].end, true)
			if (!intersection) continue
			particles.push(new Particle(anchor, intersection, new Vector(0, 0), 1, true))
			particles[particles.length - 1].display()
		}
	}
}


function setup() {
	let cnv = createCanvas(window.innerWidth, window.innerHeight)
	cnv.id('mycanvas')
	colorMode(RGB, 255)
	if (panelOpen) cnv.elt.classList.add('panel-open')
	handleInteractions()
	populateIntersections()
	renderPath()
}

function draw() {
	background(4, 8, 12)
	if (!thisWorld || worldLoading) return
	triangulate(particles, walls)
}

function startSimulation(world) {
	console.log("Warning: Momentum will not be conserved if walls are enabled")
	const changingWorld = thisWorld !== world
	if (changingWorld) {
		clearShapeWalls()
		const imported = document.getElementById("imported-svg-container")
		if (imported) imported.innerHTML = ""
		const label = document.getElementById("svg-import-label")
		if (label) label.textContent = "No SVG selected"
		const clearBtn = document.getElementById("svg-clear-btn")
		if (clearBtn) clearBtn.style.display = "none"
		const section = document.getElementById("shape-section")
		if (section) section.classList.remove("visible")
	}
	thisWorld = world
	collisions = 0
	isPaused = false
	worldLoading = true
	Promise.resolve()
		.then(() => loadWorldSvgShape(world))
		.catch((e) => { console.warn("svg load failed:", e) }) 
		.then(() => {
			console.log("World loaded:", world)
			if (thisWorld !== world) return // a diff world was selected before loading
			try {
				initWalls()
				initParticles()
				if (typeof frameRate === 'function') frameRate(thisWorld.frameRate || 30)
				if (typeof loop === 'function') loop()
				updatePlayPauseBtn()
				handleInteractions()
				populateIntersections()
				renderPath()
			} finally {
				worldLoading = false
			}
		})
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
	}
}

function updatePlayPauseBtn() {
	const label = document.getElementById("play-label")
	label.textContent = isPaused ? "Play" : "Pause"
}
function windowResized() {
	resizeCanvas(window.innerWidth, window.innerHeight)
}

let interactionsInit = false;
function handleInteractions() {
	if (interactionsInit) return;
	interactionsInit = true;
	let dragged = false
	let start = null
	const isUIElement = (target) => !!(target && target.closest && target.closest('#panel, #toggle-btn'))

	window.addEventListener("mousedown", (e) => {
		if (isUIElement(e.target)) {
			start = null
			dragged = false
			return
		}
		start = new Vector(e.clientX, e.clientY)
		dragged = false
	})
	document.addEventListener("mousemove", () => {
		dragged = true
	})
	window.addEventListener("mouseup", (e) => {
		if (!start || !dragged) { start = null; return }
		const end = new Vector(e.clientX, e.clientY)
		walls.push(new Wall(start, end))
		walls[walls.length - 1].display()
		populateIntersections(walls[walls.length - 1])
		start = null
	})
	window.addEventListener("keydown", (e) => {
		const tag = (e.target && e.target.tagName) || ""
		if (tag === "TEXTAREA" || (e.target && e.target.isContentEditable)) return
		if (e.key === " ") {
			e.preventDefault()
			handlePlayPause()
		} else if (e.key === "r") {
			handleRestart()
		}
	});
}

// window constraints handling

let toRemove = [] // store the dead

function getConstraintFor(side) {
	if (!thisWorld) return "reflect"
	const axisValue = (side === "left" || side === "right") ? thisWorld.constrainX : thisWorld.constrainY
	if (typeof axisValue === "string") return axisValue
	if (axisValue && typeof axisValue === "object") {
		if (Object.prototype.hasOwnProperty.call(axisValue, side)) return axisValue[side]//pick common or specific axis
		return axisValue
	}
	return "reflect"
}

function applyConstraint(particle, constraint, axis, wrapTarget) {
	if (constraint && typeof constraint === "object") {
		toRemove.push(particle) //emitter  also absorbs particles
		return
	}
	if (constraint === "reflect") {
		particle.velocity[axis] = -particle.velocity[axis]
	} else if (constraint === "wrap") {
		particle.position[axis] = wrapTarget
	} else if (constraint === "absorb") {
		toRemove.push(particle)
	}
	//ignore rest
}

function emitParticle(side, config) { //spawn normal to emittor
	const size = config.size || 10
	const mass = config.mass || 1
	const speed = config.velocity === undefined ? 5 : config.velocity
	let position, velocity
	if (side === "left") {
		position = new Vector(0, Math.random() * height)
		velocity = new Vector(speed, 0)
	} else if (side === "right") {
		position = new Vector(width, Math.random() * height)
		velocity = new Vector(-speed, 0)
	} else if (side === "top") {
		position = new Vector(Math.random() * width, 0)
		velocity = new Vector(0, speed)
	} else {
		position = new Vector(Math.random() * width, height)
		velocity = new Vector(0, -speed)
	}
	return new Particle(size, position, velocity, mass, false, thisWorld.trailLength ? [position, position, thisWorld.trailLength] : [null, null, 0])
}


function handleEmitters(colliders) { //rmit per frame
	if (!thisWorld) return
	const fps = thisWorld.frameRate || 30
		;["left", "right", "top", "bottom"].forEach((side) => {
			const constraint = getConstraintFor(side)
			if (!constraint || typeof constraint !== "object") return
			if (constraint.emitted === undefined) constraint.emitted = 0
			if (constraint.accum === undefined) constraint.accum = 0
			const capacity = constraint.capacity === undefined ? Infinity : constraint.capacity
			const rate = constraint.rate || 0
			if (rate <= 0 || constraint.emitted >= capacity) return
			constraint.accum += rate / fps
			while (constraint.accum >= 1 && constraint.emitted < capacity) {
				constraint.accum -= 1
				constraint.emitted += 1
				colliders.push(emitParticle(side, constraint))
			}
		})
}

function refillEmitter(axisValue) {
	if (!axisValue || typeof axisValue !== "object") return
		;["left", "right", "top", "bottom"].forEach((side) => {
			if (axisValue[side] && typeof axisValue[side] === "object") {
				axisValue[side].emitted = 0
				axisValue[side].accum = 0
			}
		}) 
	if (axisValue.rate !== undefined || axisValue.capacity !== undefined || axisValue.velocity !== undefined || axisValue.size !== undefined) {
		axisValue.emitted = 0
		axisValue.accum = 0
	}
}





//// svg handling

function getActiveShapeElement() {
	const imported = document.getElementById("imported-svg-container")
	if (!imported || imported.childElementCount === 0) return null
	return imported.querySelector("path, rect, circle, ellipse, line, polyline, polygon")
}

function clearShapeWalls() {
	shapeWalls.forEach(w => {
		const wi = walls.indexOf(w)
		if (wi !== -1) walls.splice(wi, 1)
	})
	shapeCornerParticles.forEach(p => {
		const pi = particles.indexOf(p)
		if (pi !== -1) particles.splice(pi, 1)
	})
	shapeWalls = []
	shapeCornerParticles = []
}

function renderPath() {
	clearShapeWalls()

	const path = getActiveShapeElement()
	if (!path || typeof path.getTotalLength !== "function") return

	const thetaRad = (pathoffset.theta % 360) * Math.PI / 180
	const length = path.getTotalLength()
	const resolution = pathdensity
	const scale = pathScale

	const rawPoints = []
	let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
	for (let i = 0; i <= resolution; i++) {
		const p = path.getPointAtLength((i / resolution) * length)
		if (isNaN(p.x) || isNaN(p.y)) continue
		rawPoints.push(p)
		if (p.x < minX) minX = p.x
		if (p.x > maxX) maxX = p.x
		if (p.y < minY) minY = p.y
		if (p.y > maxY) maxY = p.y
	}
	if (rawPoints.length === 0) return
	const centerX = (minX + maxX) / 2
	const centerY = (minY + maxY) / 2

	const points = []
	let lineStart = null
	let lastPoint = null

	for (const p of rawPoints) {
		const current = new Vector((p.x - centerX) * scale, (p.y - centerY) * scale)
		current.rotate(thetaRad)
		current.add(pathoffset.transform)

		if (!lineStart) {
			lineStart = current
			points.push(current)
			lastPoint = current
			continue
		} if (points.length === 1) {
			points.push(current)
			lastPoint = current
			continue
		}

		const v1 = ops.difference(lastPoint, lineStart)
		const v2 = ops.difference(current, lastPoint)
		const angle1 = Math.atan2(v1.y, v1.x)
		const angle2 = Math.atan2(v2.y, v2.x)

		if (Math.abs(angle1 - angle2) < 0.01) {
			points[points.length - 1] = current
		} else {
			lineStart = lastPoint
			points.push(current)
		}
		lastPoint = current
	}

	function addShapeWall(a, b) {
		const w = new Wall(a, b, pathAnchor)
		walls.push(w)
		shapeWalls.push(w)
		shapeCornerParticles.push(...particles.slice(-2))
	}

	for (let i = 0; i < points.length - 1; i++) {
		addShapeWall(points[i], points[i + 1])
	}
	if (points.length > 2) {
		addShapeWall(points[points.length - 1], points[0])
	}
}

function isInlineSvgMarkup(str) {
	return typeof str === "string" && /^\s*<\s*(\?xml|svg)/i.test(str)
}



function applySvgMarkup(svgText) {
	const container = document.getElementById("imported-svg-container")
	if (!container) return false
	const parser = new DOMParser()
	const sanitized = String(svgText).replace(/<(\s+)(\/?)(\s*)([a-zA-Z])/g, "<$2$4")
	const doc = parser.parseFromString(sanitized, "image/svg+xml")
	const svgEl = doc.querySelector("svg")
	if (!svgEl || doc.querySelector("parsererror")) return false
	container.innerHTML = ""
	container.appendChild(svgEl)
	return true
}

function loadWorldSvgShape(world) {
	
	const config = ((shape) => {
		if (!shape) return null
		if (typeof shape === "string") return { svgPath: shape }
		if (typeof shape === "object" && shape.svgPath) return shape
		return null
	})(world && world.svgPath)
	if (!config) return Promise.resolve()

	const reveal = () => {
		if (config.x !== undefined) pathoffset.transform.x = config.x
		if (config.y !== undefined) pathoffset.transform.y = config.y
		if (config.theta !== undefined) pathoffset.theta = config.theta
		if (config.scale !== undefined) pathScale = config.scale
		if (config.density !== undefined) pathdensity = config.density
		if (config.anchor !== undefined) pathAnchor = config.anchor

		importedSvgName = ((path)=> {
			if (isInlineSvgMarkup(path)) return "Generator SVG"
			const parts = String(path).split("/")
			return parts[parts.length - 1] || String(path)
		})(config.svgPath)

		const label = document.getElementById("svg-import-label")
		if (label) label.textContent = importedSvgName
		const clearBtn = document.getElementById("svg-clear-btn")
		if (clearBtn) clearBtn.style.display = "inline-flex"
		const section = document.getElementById("shape-section")
		if (section) section.classList.add("visible")
		if (typeof syncShapeSliders === "function") syncShapeSliders()
	}

	const fail = (reason) => {
		if (typeof showError === "function") showError("Couldn't load this world's SVG shape: " + reason)
		else console.warn("Couldn't load world SVG shape:", reason)
	}

	try {
		if (isInlineSvgMarkup(config.svgPath)) {
			if (applySvgMarkup(config.svgPath)) reveal()
			else fail("the SVG markup couldn't be parsed")
			return Promise.resolve()
		}

		return fetch(config.svgPath)
			.then((res) => res.text())
			.then((text) => {
				if (applySvgMarkup(text)) reveal()
				else fail("the fetched file wasn't valid SVG")
			})
			.catch((err) => fail(err && err.message ? err.message : "the file couldn't be fetched"))
	} catch (err) {
		fail(err && err.message ? err.message : String(err))
		return Promise.resolve()
	}
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