	class World {
	constructor(particleCount, particleGenerator, constrainX = "reflect", constrainY = "reflect", trail = 0, wallCount = null, wallGenerator = null, shape = null, frameRate = 30) {
		this.particleCount = particleCount
		this.particleGenerator = particleGenerator
		this.constrainX = constrainX
		this.constrainY = constrainY
		this.wallCount = wallCount
		this.wallGenerator = wallGenerator
		this.trailLength = trail
		this.frameRate = frameRate
		this.svgPath = shape
	}
}

// Heat transmission wave and pressure
function heatWaveGen(index) {
	let rnd = () => Math.random()
	let w = window.innerWidth
	let h = window.innerHeight
	let size = 50
	let mass = 1
	let position = new Vector(rnd() * w, rnd() * h)
	let velocity
	if (position.x > 500) {
		velocity = new Vector(rnd() * 10, rnd() - 0.5)
	} else {
		position = new Vector(position.x + 400, position.y)
		velocity = new Vector(rnd() * 10, rnd() - 0.5)
	}

	return [size, position, velocity, mass]
}
var HeatTransmissionWave = new World(600, heatWaveGen, "reflect", "reflect")

// Hot line between cold gases
function hotLineGenerator(index) {
	let rnd = () => Math.random()
	let w = window.innerWidth
	let h = window.innerHeight
	let size = 20
	let mass = 1
	let position = new Vector(rnd() * w, rnd() * h)
	let velocity
	if (position.y < 450) {
		velocity = new Vector(2, rnd() - 0.5)
	} else if (position.y > 450 && position.y < 550) {
		velocity = new Vector(20, rnd() - 0.5)
	} else {
		velocity = new Vector(2, rnd() - 0.5)
	}

	return [size, position, velocity, mass]
}
var EnergyLine = new World(500, hotLineGenerator, "wrap", "reflect")

// High speed line above cold gas
function highSpeedLineGen(index) {
	let rnd = () => Math.random()
	let w = window.innerWidth
	let h = window.innerHeight
	let size = 20
	let mass = 1
	let position = new Vector(rnd() * w, rnd() * h)
	let velocity
	if (position.y < 300) {
		velocity = new Vector(20, rnd() - 0.5)
	} else if (position.y > 300 && position.y < 400) {
		position = new Vector(position.x, position.y + 200)
		velocity = new Vector(2, rnd() - 0.5)
	} else {
		velocity = new Vector(2, rnd() - 0.5)
	}

	return [size, position, velocity, mass]
}
var blowOver = new World(700, highSpeedLineGen, "wrap", "reflect")

// Fast fluid crashing into slow fluid
let partCount = 700
function fastFluidCrash(index) {
	let rnd = () => Math.random()
	let w = window.innerWidth
	let h = window.innerHeight
	let size = 15
	let mass = 1
	let position = new Vector(rnd() * w, rnd() * h)
	let velocity
	if (index < partCount - 50) {
		if (position.x > 500) {
			velocity = new Vector(rnd() - 0.5, rnd() - 0.5)
		} else {
			position = new Vector(position.x + 500, position.y)
			velocity = new Vector(rnd() - 0.5, rnd() - 0.5)
		}
	} else {
		position = new Vector(index / partCount, index / partCount + 400)
		velocity = new Vector(15, rnd() - 0.5)
	}
	return [size, position, velocity, mass]
}
var fluidCrash = new World(partCount, fastFluidCrash, "reflect", "reflect")

// High resolution collision of fast fluid crashing into slow fluid
let partCount2 = 7000
function fastFluidCrashHD(index) {
	let rnd = () => Math.random()
	let w = window.innerWidth
	let h = window.innerHeight
	let size = 5
	let mass = 1
	let position = new Vector(rnd() * w, rnd() * h)
	let velocity
	if (index < partCount2 - 100) {
		if (position.x > 200) {
			velocity = new Vector(rnd(), rnd())
		} else {
			position = new Vector(position.x + 200, position.y)
			velocity = new Vector(rnd(), rnd())
		}
	} else {
		position = new Vector(index / partCount2, index / partCount2 + 400)
		velocity = new Vector(15, rnd())
	}
	return [size, position, velocity, mass]
}
var fluidCrashHD = new World(partCount2, fastFluidCrashHD, "reflect", "reflect")

// Phase Wave
function phaseWaveGen(index) {
	let rnd = () => Math.random()
	let w = window.innerWidth
	let h = window.innerHeight
	let size = 20
	let mass = 1
	let position = new Vector(50 + index * 25, 10)
	let velocity = new Vector(0, 1 + index / 20)
	return [size, position, velocity, mass]
}
var phaseWave = new World(60, phaseWaveGen, "reflect", "reflect", 6000)

// Particles fill form lattice domains like a solid crystal
function latticeGen(index) {
	let rnd = () => Math.random()
	let w = window.innerWidth
	let h = window.innerHeight
	let size = 60
	let mass = 2
	let position = index > 500 ? new Vector(w / 2 - 100, h / 2) : new Vector(w / 2 + 100, h / 2)
	let velocity = new Vector(rnd() - 0.5, rnd() - 0.5)
	return [size, position, velocity, mass]
}
var lattice = new World(1000, latticeGen, "reflect", "reflect")



// Crash of two concentrated walls made of particles
function wallCrashGen(index) {
	let rnd = () => Math.random()
	let w = window.innerWidth
	let h = window.innerHeight
	let size = 20
	let mass = 1
	let position = new Vector(rnd() * w, rnd() * h)
	let velocity
	if (index > 150) {
		position = new Vector(1100, h / 2 + rnd() * 100)
		velocity = new Vector(-2, 0)
	} else {
		position = new Vector(100, 100 + rnd() * 100)
		velocity = new Vector(15, 0)
	}
	return [size, position, velocity, mass]
}
var wallCrash = new World(400, wallCrashGen, "reflect", "reflect")

// Chain of balls barely colliding
function ballChainGen(index) {
	let rnd = () => Math.random()
	let w = window.innerWidth
	let h = window.innerHeight
	let size = 20
	let mass = 1
	let position = new Vector(rnd() * w, rnd() * h)
	let velocity
	if (position.x > 500) {
		position = new Vector(1100, h / 2 + index)
		velocity = new Vector(-2, 0)
	} else {
		position = new Vector(200, index)
		velocity = new Vector(15, 0)
	}
	return [size, position, velocity, mass]
}
var ballChain = new World(50, ballChainGen, "reflect", "reflect")

// Concentrated explosion in the middle of the screen
function explodeGen(index) {
	let rnd = () => Math.random()
	let w = window.innerWidth
	let h = window.innerHeight
	let size = 20
	let mass = 1
	let position = new Vector(rnd() * w, rnd() * h)
	let velocity
	if (index < 300) {
		position = new Vector(400, h / 2 + rnd() * 100)
		velocity = new Vector(rnd() - 0.5, 0)
	} else {
		position = new Vector(400, h / 2 + rnd() * 100)
		velocity = new Vector(15, 0)
	}
	return [size, position, velocity, mass]
}
var explode = new World(500, explodeGen, "reflect", "reflect")


// Random walk caused by a swarm of massive particles
function swarmGen(index) {
	let rnd = () => Math.random()
	let w = window.innerWidth
	let h = window.innerHeight
	if (index === 0) {
		let size = 60
		let mass = 5
		let position = new Vector(w / 2 + (rnd() - 0.5) * 50, h / 2 + (rnd() - 0.5) * 120)
		let velocity = new Vector(rnd() - 0.5, rnd() - 0.5)
		return [size, position, velocity, mass]
	} else {
		let size = 4 + rnd() * 6
		let mass = size / 5
		let position = new Vector(rnd() * w, rnd() * h)
		let velocity = new Vector((rnd() - 0.5) * 10.2, (rnd() - 0.5) * 10.2)
		return [size, position, velocity, mass]
	}
}
var swarmWalk = new World(1000, swarmGen, "reflect", "reflect")


// Custom Generator template
// See the "Help me" link above the editor for the full reference.
let ParticleCount = 400
let ConstrainX = "reflect"
let ConstrainY = "reflect"
let CustomFrameRate = 30
let Trail = 3;
function myGenerator(ParticleIndex) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = rnd() * 30 + 10;
	let mass = size / 10;
	let position = new Vector(rnd() * w * 0.8 + 0.1 * w, rnd() * h * 0.8 + h * 0.1);
	let velocity = new Vector(rnd() * 10, rnd() * 10);
	return [size, position, velocity, mass];
}

let Teeth = 14; 
let jaggedness = 24;
function buildZigzagPerimeter() {
	let w = window.innerWidth;
	let h = window.innerHeight;
	// four corners, walked clockwise
	const edges = [
	];
	const points = [];
	edges.forEach(([from, to]) => {
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const len = Math.hypot(dx, dy);
		const nx = -dy / len; // unit normal, pointing inward
		const ny = dx / len;
		for (let t = 0; t < Teeth; t++) {
			const along = t / Teeth;
			const px = from.x + dx * along;
			const py = from.y + dy * along;
			const inward = (t % 2 === 0) ? 0 : jaggedness; // alternate
			points.push(new Vector(px + nx * inward, py + ny * inward));
		}
	});
	return points;
}

let zigzagPoints = buildZigzagPerimeter();
function zigzagWallGenerator(index) {
	const start = zigzagPoints[index];
	const end = zigzagPoints[(index + 1) % zigzagPoints.length]; // wrap around
	return [start, end];
}

var myWorld = new World(
	ParticleCount,
	myGenerator,
	ConstrainX,
	ConstrainY,
	Trail,
	zigzagPoints.length, 
	zigzagWallGenerator,
	null,
	CustomFrameRate
);


// bernoulli compression and continuity through nozzle
function nozzleWalls(index) {
	let w = window.innerWidth
	let h = window.innerHeight
	if (index === 0) return [new Vector(w * 0.35, 0), new Vector(w * 0.65, h * 0.4)]
	return [new Vector(w * 0.35, h), new Vector(w * 0.65, h * 0.6)]
}
var nozzle = new World(
	0,
	null,
	{
		left: { size: 16, mass: 1, velocity: 6, rate: 520, capacity: 10000 },
		right: "absorb"
	},
	"absorb",
	0,
	2,
	nozzleWalls
)



//svg airfoil in wind tunnel
var airfoil = new World(
	null,
	null,
	{
		left: { size: 16, mass: 1, velocity: 6, rate: 520, capacity: 10000 },
		right: "absorb"
	},
	"absorb",
	2,
	0,
	null,
	{
		svgPath: `<svg width="311" height="45" viewBox="0 0 311 45" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path d="M67.4443 4.20117C118.122 -3.13517 169.962 1.2647 220.196 10.1484C222.192 10.5014 224.168 10.9915 226.156 11.501C228.139 12.0091 230.139 12.5381 232.156 12.959L232.164 12.96C241.897 14.8285 251.373 17.0267 261.021 19.2676V19.2686C272.894 22.0651 284.724 25.0379 296.509 28.1865V28.1875C298.245 28.6538 301.132 29.3701 303.854 30.0947C305.431 30.5149 306.976 30.9446 308.286 31.3477C305.414 31.4309 302.216 31.4169 298.974 31.3857C294.707 31.3447 290.362 31.2756 286.614 31.3691H286.613C267.598 31.8725 248.593 32.6816 229.604 33.7949L225.806 34.0215C217.058 34.5629 206.862 34.9652 198.192 35.9541L198.18 35.9561L198.168 35.958C194.295 36.5921 180.596 37.8631 176.543 37.8066L176.487 37.8057L176.433 37.8174C175.502 38.014 173.447 38.1966 171.3 38.3506C169.148 38.5049 167.019 38.623 165.855 38.7041H165.854L145.632 40.1406H145.63C126.235 41.6159 106.814 42.723 87.377 43.46H87.375C62.5452 44.4705 35.1215 45.1761 10.749 39.2275C6.38274 38.1619 2.02925 35.709 0.526367 31.3828C1.25136 28.981 2.85631 26.8359 5.04199 24.9082C7.27245 22.941 10.0818 21.2203 13.1035 19.7031C19.1582 16.6631 25.9552 14.4866 30.5264 12.7393C41.8581 8.40804 55.3764 5.94838 67.4443 4.20117Z" fill="white" stroke="black" />
</svg>`,
		x: window.innerWidth *0.35,
		y: window.innerHeight / 2,
		scale: 1,
		theta: 11,
		anchor: 0,
		density: 80

	}
);