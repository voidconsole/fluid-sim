class World{
	constructor(particleCount, particleGenerator, containX = true, containY = true) {
		this.particleCount = particleCount;
		this.particleGenerator = particleGenerator;
		this.containX = containX;
		this.containY = containY;
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
	}
	else {
		position = new Vector(position.x + 400, position.y);
		velocity = new Vector(rnd() * 10, rnd());
	}

	return [size, position, velocity];
}
var HeatTransmissionWave = new World(600, heatWaveGen, true, true);


// hot line between cold gases

function hotLineGenerator(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 20;
	let position = new Vector(rnd() * w, rnd() * h);
	let velocity;
	if (position.y < 450) {
		velocity = new Vector(2, rnd());
	}
	else if (position.y > 450 && position.y < 550) {
		// position = new Vector(position.x, position.y + 200);
		velocity = new Vector(20, rnd());
	}
	else {
		velocity = new Vector(2, rnd());
	}
	return [size, position, velocity];
}
var EnergyLine = new World(500, hotLineGenerator, false, true);

// high speed line above cold gas

function highSpeedLineGen(index) {
	let rnd = () => Math.random();
	let w = window.innerWidth;
	let h = window.innerHeight;
	let size = 20;
	let position = new Vector(rnd() * w, rnd() * h);
	let velocity;
	if (position.y < 300) {
		velocity = new Vector(20, rnd());
	}
	else if (position.y > 300 && position.y < 400) {
		position = new Vector(position.x, position.y + 200);
		velocity = new Vector(2, rnd());
	}
	else {
		velocity = new Vector(2, rnd());
	}
	return [size, position, velocity];
}
var blowOver = new World(500, highSpeedLineGen, false, true);


// fast fluid crashing into slow fluid