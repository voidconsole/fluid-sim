class World {
	constructor(particleCount, particleGenerator, containX = true, containY = true, frameRate = 30) {
		this.particleCount = particleCount;
		this.particleGenerator = particleGenerator;
		this.containX = containX;
		this.containY = containY;
		this.frameRate = frameRate;
	}
}

// Heat transmission wave
function heatWaveGen(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 50;
	let position = new Vector(rnd() * w, rnd() * h);
	let velocity;
	if (position.x > 500) {
		velocity = new Vector(rnd() * 10, rnd());
	} else {
		position = new Vector(position.x + 400, position.y);
		velocity = new Vector(rnd() * 10, rnd());
	}
	return [size, position, velocity];
}
var HeatTransmissionWave = new World(600, heatWaveGen, true, true);

// Hot line between cold gases
function hotLineGenerator(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 20;
	let position = new Vector(rnd() * w, rnd() * h);
	let velocity;
	if (position.y < 450) {
		velocity = new Vector(2, rnd());
	} else if (position.y > 450 && position.y < 550) {
		velocity = new Vector(20, rnd());
	} else {
		velocity = new Vector(2, rnd());
	}
	return [size, position, velocity];
}
var EnergyLine = new World(500, hotLineGenerator, false, true);

// High speed line above cold gas
function highSpeedLineGen(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 20;
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
	return [size, position, velocity];
}
var blowOver = new World(700, highSpeedLineGen, false, true);

// Fast fluid crashing into slow fluid
let partCount = 700;
function fastFluidCrash(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 15;
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
	return [size, position, velocity];
}
var fluidCrash = new World(partCount, fastFluidCrash, true, true);

// High resolution collision
let partCount2 = 7000;
function fastFluidCrashHD(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 5;
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
	return [size, position, velocity];
}
var fluidCrashHD = new World(partCount2, fastFluidCrashHD, true, true);

// Crash of two concentrated walls
function wallCrashGen(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 20;
	let position = new Vector(rnd() * w, rnd() * h);
	let velocity;
	if (index > 150) {
		position = new Vector(1100, h / 2 + rnd() * 100);
		velocity = new Vector(-2, 0);
	} else {
		position = new Vector(100, 100 + rnd() * 100);
		velocity = new Vector(15, 0);
	}
	return [size, position, velocity];
}
var wallCrash = new World(400, wallCrashGen, true, true);	

// Chain of balls
function ballChainGen(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 20;
	let position = new Vector(rnd() * w, rnd() * h);
	let velocity;
	if (position.x > 500) {
		position = new Vector(1100, h / 2 + index);
		velocity = new Vector(-2, 0);
	} else {
		position = new Vector(200, index);
		velocity = new Vector(15, 0);
	}
	return [size, position, velocity];
}
var ballChain = new World(50, ballChainGen, true, true);

// Concentrated explosion in the middle of the screen
function explodeGen(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 20;
	let position = new Vector(rnd() * w, rnd() * h);
	let velocity;
	if (index < 300) {
		position = new Vector(400, h / 2 + rnd() * 100);
		velocity = new Vector(rnd(), 0);
	} else {
		position = new Vector(400, h / 2 + rnd() * 100);
		velocity = new Vector(15, 0);
	}
	return [size, position, velocity];
}
var explode = new World(500, explodeGen, true, true);

// Custom Generator template
let ParticleCount = 400;
let ContainX = true;
let ContainY = true;
let CustomFrameRate = 30;
function myGenerator(ParticleIndex) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 20;
	let position = new Vector(rnd() * w, rnd() * h);
	let velocity = new Vector(rnd() * 10, rnd() * 10);
	return [size, position, velocity];
}
var myWorld = new World(ParticleCount, myGenerator, ContainX, ContainY, CustomFrameRate);