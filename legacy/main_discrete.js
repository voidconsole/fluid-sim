

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
			const mag = (A.x ** 2 + A.y ** 2) ** (1 / 2)
			if (mag === 0) return new Vector(0, 0)
			return new Vector(A.x / mag, A.y / mag)
		},
		project: (A, B, clamp = false) => {
			let s = (A.x * B.x + A.y * B.y) / (B.x ** 2 + B.y ** 2)
			if (clamp) {
				s = Math.max(0, Math.min(1, s))
			}
			return new Vector(B.x * s, B.y * s)
		},

		intersect: (A1, A2, B1, B2) => {
			const o1 = (A2.y - A1.y) * (B1.x - A2.x) - (A2.x - A1.x) * (B1.y - A2.y)
			const o2 = (A2.y - A1.y) * (B2.x - A2.x) - (A2.x - A1.x) * (B2.y - A2.y)
			const o3 = (B2.y - B1.y) * (A1.x - B2.x) - (B2.x - B1.x) * (A1.y - B2.y)
			const o4 = (B2.y - B1.y) * (A2.x - B2.x) - (B2.x - B1.x) * (A2.y - B2.y)
			const crosses = (o1 * o2 < 0) && (o3 * o4 < 0) // unlike signs -> collision
			return crosses // does not handle collinear cases and bounds overlap
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
			this.wall = ops.difference(this.end, this.start)
			this.direction = ops.unit(this.wall)
			this.length = ops.magnitude(this.wall)
		}
		display() {
			stroke(255)
			strokeWeight(1)
			line(this.start.x, this.start.y, this.end.x, this.end.y)
			// ellipse(this.start.x, this.start.y, this.end.x - this.start.x, this.end.y - this.start.y)
		}
		bounce(particle) {
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
		if(!ops.intersect(particle.position, ops.sum(particle.position, particle.velocity), this.start, this.end)) return
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
				particle.velocity.add(ops.scale(ops.project(particle.velocity, normal), -2)) //reflect v
				// console.log(" True ghost 	future position", prediction, "future velocity", FutureVelocity)
				particle.lastcontact = this
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
			this.lastcontact = null
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
				this.lastcontact = null
				if (thisWorld.containX) this.velocity.x = -this.velocity.x
				else this.position.x = 0
			} else if (this.position.x <= 0) {
				this.lastcontact = null
				if (thisWorld.containX) this.velocity.x = -this.velocity.x
				else this.position.x = width
			}
			if (this.position.y >= height) {
				this.lastcontact = null
				if (thisWorld.containY) this.velocity.y = -this.velocity.y
				else this.position.y = 0
			} else if (this.position.y <= 0) {
				this.lastcontact = null
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
		// for (let i = 0; i < colliders.length; i++) {
		// 	for (let j = i + 1; j < colliders.length; j++) {
		// 		colliders[i].collide(colliders[j]);
		// 	}
		// }

		for (let i = 0; i < colliders.length; i++) {
			contraints.forEach((constraint) => {
				constraint.bounce(colliders[i])
			})
		}

		for (let i = 0; i < colliders.length; i++) {
			// if (colliders[i].lastcontact === "wall") continue
			colliders[i].move()

		}
		for (let i = 0; i < colliders.length; i++) {
			for (let j = i + 1; j < colliders.length; j++) {
				colliders[i].collide(colliders[j]);
			}
		}

		for (let i = 0; i < colliders.length; i++) {
			colliders[i].display()
		}
		contraints.forEach((constraint) => constraint.display());
	}


	function initWalls() {
		walls = []
		// let MyWall = new Wall(new Vector(0, 200), new Vector(100, 500))
		// walls.push(MyWall)
	}
	function initParticles() {
		particles = []
		for (let k = 0; k < thisWorld.particleCount; k++) {
			let [size, position, velocity, mass] = thisWorld.particleGenerator(k)
			particles.push(new Particle(size, position, velocity, mass, false, thisWorld.trailLength ? [position, position, thisWorld.trailLength] : [null, null, 0]))
		}
		// particles.push(new Particle(30, new Vector(13, 10), new Vector(100, 10), 1, false))
		// particles.push(new Particle(30, new Vector(13, 20), new Vector(40, 1), 1, false))
		// particles.push(new Particle(30, new Vector(13, 30), new Vector(20, 10), 1, false))
		// particles.push(new Particle(30, new Vector(13, 40), new Vector(20, 10), 1, false))
		// particles.push(new Particle(30, new Vector(13, 50), new Vector(20, 10), 1, false))

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

