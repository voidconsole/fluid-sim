class World {
	constructor(particleCount, particleGenerator, containX = true, containY = true, frameRate = 30) {
		this.particleCount = particleCount;
		this.particleGenerator = particleGenerator;
		this.containX = containX;
		this.containY = containY;
		this.frameRate = frameRate;
	}
}

// Heat transmission wave and pressure
function heatWaveGen(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 50;
	let mass = 1;
	let position = new Vector(rnd() * w, rnd() * h);
	let velocity;
	if (position.x > 500) {
		velocity = new Vector(rnd() * 10, rnd());
	} else {
		position = new Vector(position.x + 400, position.y);
		velocity = new Vector(rnd() * 10, rnd());
	}

	return [size, position, velocity, mass];
}
var HeatTransmissionWave = new World(600, heatWaveGen, true, true);

// Hot line between cold gases
function hotLineGenerator(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 20;
	let mass = 1;
	let position = new Vector(rnd() * w, rnd() * h);
	let velocity;
	if (position.y < 450) {
		velocity = new Vector(2, rnd());
	} else if (position.y > 450 && position.y < 550) {
		velocity = new Vector(20, rnd());
	} else {
		velocity = new Vector(2, rnd());
	}

	return [size, position, velocity, mass];
}
var EnergyLine = new World(500, hotLineGenerator, false, true);

// High speed line above cold gas
function highSpeedLineGen(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 20;
	let mass = 1;
	let position = new Vector(rnd() * w, rnd() * h);
	let velocity;
	if (position.y < 300) {
		velocity = new Vector(20, rnd());
	} else if (position.y > 300 && position.y < 400) {
		position = new Vector(position.x, position.y + 200);
		velocity = new Vector(2, rnd());
	} else {
		velocity = new Vector(2, rnd());
	}

	return [size, position, velocity, mass];
}
var blowOver = new World(700, highSpeedLineGen, false, true);

// Fast fluid crashing into slow fluid
let partCount = 700;
function fastFluidCrash(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 15;
	let mass = 1;
	let position = new Vector(rnd() * w, rnd() * h);
	let velocity;
	if (index < partCount - 50) {
		if (position.x > 500) {
			velocity = new Vector(rnd(), rnd());
		} else {
			position = new Vector(position.x + 500, position.y);
			velocity = new Vector(rnd(), rnd());
		}
	} else {
		position = new Vector(index / partCount, index / partCount + 400);
		velocity = new Vector(15, rnd());
	}
	return [size, position, velocity, mass];
}
var fluidCrash = new World(partCount, fastFluidCrash, true, true);

// High resolution collision of fast fluid crashing into slow fluid
let partCount2 = 7000;
function fastFluidCrashHD(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 5;
	let mass = 1;
	let position = new Vector(rnd() * w, rnd() * h);
	let velocity;
	if (index < partCount2 - 100) {
		if (position.x > 200) {
			velocity = new Vector(rnd(), rnd());
		} else {
			position = new Vector(position.x + 200, position.y);
			velocity = new Vector(rnd(), rnd());
		}
	} else {
		position = new Vector(index / partCount2, index / partCount2 + 400);
		velocity = new Vector(15, rnd());
	}
	return [size, position, velocity, mass];
}
var fluidCrashHD = new World(partCount2, fastFluidCrashHD, true, true);

// Crash of two concentrated walls made of particles
function wallCrashGen(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 20;
	let mass = 1;
	let position = new Vector(rnd() * w, rnd() * h);
	let velocity;
	if (index > 150) {
		position = new Vector(1100, h / 2 + rnd() * 100);
		velocity = new Vector(-2, 0);
	} else {
		position = new Vector(100, 100 + rnd() * 100);
		velocity = new Vector(15, 0);
	}
	return [size, position, velocity, mass];
}
var wallCrash = new World(400, wallCrashGen, true, true);

// Chain of balls barely colliding
function ballChainGen(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 20;
	let mass = 1;
	let position = new Vector(rnd() * w, rnd() * h);
	let velocity;
	if (position.x > 500) {
		position = new Vector(1100, h / 2 + index);
		velocity = new Vector(-2, 0);
	} else {
		position = new Vector(200, index);
		velocity = new Vector(15, 0);
	}
	return [size, position, velocity, mass];
}
var ballChain = new World(50, ballChainGen, true, true);

// Concentrated explosion in the middle of the screen
function explodeGen(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 20;
	let mass = 1;
	let position = new Vector(rnd() * w, rnd() * h);
	let velocity;
	if (index < 300) {
		position = new Vector(400, h / 2 + rnd() * 100);
		velocity = new Vector(rnd(), 0);
	} else {
		position = new Vector(400, h / 2 + rnd() * 100);
		velocity = new Vector(15, 0);
	}
	return [size, position, velocity, mass];
}
var explode = new World(500, explodeGen, true, true);


// Random walk caused by swarm of massive particles
function swarmGen(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	if (index === 0) {
		let size = 60;
		let mass = 2;
		let position = new Vector(w / 2 + (rnd() - 0.5) * 50, h / 2 + (rnd() - 0.5) * 120);
		let velocity = new Vector(rnd(), rnd());
		return [size, position, velocity, mass];
	} else {
		let size = 4 + rnd() * 6;
		let mass = size / 5;
		let position = new Vector(rnd() * w, rnd() * h);
		let velocity = new Vector((rnd() - 0.5) * 10.2, (rnd() - 0.5) * 10.2);
		return [size, position, velocity, mass];
	}
}
var swarmWalk = new World(600, swarmGen, true, true);

// Random walk caused by a swarm of massive particles
function swarmGen(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	if (index === 0) {
		let size = 60;
		let mass = 5;
		let position = new Vector(w / 2 + (rnd() - 0.5) * 50, h / 2 + (rnd() - 0.5) * 120);
		let velocity = new Vector(rnd(), rnd());
		return [size, position, velocity, mass];
	} else {
		let size = 4 + rnd() * 6;
		let mass = size / 5;
		let position = new Vector(rnd() * w, rnd() * h);
		let velocity = new Vector((rnd() - 0.5) * 10.2, (rnd() - 0.5) * 10.2);
		return [size, position, velocity, mass];
	}
}
var swarmWalk = new World(1000, swarmGen, true, true);

// Particles fill form lattice domains like a solid crystal
function latticeGen(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 60;
	let mass = 2;
	let position = index > 500 ? new Vector(w / 2 - 100, h / 2) : new Vector(w / 2 + 100, h / 2);
	let velocity = new Vector(rnd(), rnd());
	return [size, position, velocity, mass];
}
var lattice = new World(1000, latticeGen, true, true);


// Custom Generator template
let ParticleCount = 400;
let ContainX = true;
let ContainY = true;
let CustomFrameRate = 30;
function myGenerator(ParticleIndex) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = rnd() * 30 + 10;
	let mass = size / 10;
	let position = new Vector(rnd() * w, rnd() * h);
	let velocity = new Vector(rnd() * 10, rnd() * 10);
	return [size, position, velocity, mass];
}
var myWorld = new World(ParticleCount, myGenerator, ContainX, ContainY, CustomFrameRate);