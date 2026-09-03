const GENERATOR_CODES = {
	'wallCrash': `// Crash of two concentrated walls
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
var wallCrash = new World(400, wallCrashGen, "reflect", "reflect");`,

	'fluidCrash': `// Fast fluid crashing into slow fluid
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
var fluidCrash = new World(partCount, fastFluidCrash, "reflect", "reflect");`,

	'fluidCrashHD': `// High resolution collision
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
var fluidCrashHD = new World(partCount2, fastFluidCrashHD, "reflect", "reflect");`,

	'explode': `// Concentrated explosion in the middle of the screen
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
var explode = new World(500, explodeGen, "reflect", "reflect");`,

	'HeatTransmissionWave': `// Heat transmission wave
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
var HeatTransmissionWave = new World(600, heatWaveGen, "reflect", "reflect");`,

	'EnergyLine': `// Hot line between cold gases
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
var EnergyLine = new World(500, hotLineGenerator, "wrap", "reflect");`,

	'blowOver': `// High speed line above cold gas
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
var blowOver = new World(700, highSpeedLineGen, "wrap", "reflect");`,

	'ballChain': `// Chain of balls
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
var ballChain = new World(50, ballChainGen, "reflect", "reflect");`,

	'swarmWalk': `// Random walk caused by a swarm of massive particles
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
    var swarmWalk = new World(1000, swarmGen, "reflect", "reflect");`,

	'lattice': `// Particles fill form lattice domains like a solid crystal
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
var lattice = new World(1000, latticeGen, "reflect", "reflect");`,

	'phaseWave': `// staggered line of particles released at increasing speeds
function phaseWaveGen(index) {
    let rnd = () => Math.random();
    let w = window.innerWidth;
    let h = window.innerHeight;
    let size = 20;
    let mass = 1;
    let position = new Vector(50 + index * 25, 10);
    let velocity = new Vector(0, 1 + index / 20);
    return [size, position, velocity, mass];
}
var phaseWave = new World(60, phaseWaveGen, "reflect", "reflect", 6000);`,

	'airfoil': `var airfoil = new World(
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
		svgPath: '< svg width="311" height="45" viewBox="0 0 311 45" fill="none" xmlns="http://www.w3.org/2000/svg" >' +
	'<path d="M67.4443 4.20117C118.122 -3.13517 169.962 1.2647 220.196 10.1484C222.192 10.5014 224.168 10.9915 226.156 11.501C228.139 12.0091 230.139 12.5381 232.156 12.959L232.164 12.96C241.897 14.8285 251.373 17.0267 261.021 19.2676V19.2686C272.894 22.0651 284.724 25.0379 296.509 28.1865V28.1875C298.245 28.6538 301.132 29.3701 303.854 30.0947C305.431 30.5149 306.976 30.9446 308.286 31.3477C305.414 31.4309 302.216 31.4169 298.974 31.3857C294.707 31.3447 290.362 31.2756 286.614 31.3691H286.613C267.598 31.8725 248.593 32.6816 229.604 33.7949L225.806 34.0215C217.058 34.5629 206.862 34.9652 198.192 35.9541L198.18 35.9561L198.168 35.958C194.295 36.5921 180.596 37.8631 176.543 37.8066L176.487 37.8057L176.433 37.8174C175.502 38.014 173.447 38.1966 171.3 38.3506C169.148 38.5049 167.019 38.623 165.855 38.7041H165.854L145.632 40.1406H145.63C126.235 41.6159 106.814 42.723 87.377 43.46H87.375C62.5452 44.4705 35.1215 45.1761 10.749 39.2275C6.38274 38.1619 2.02925 35.709 0.526367 31.3828C1.25136 28.981 2.85631 26.8359 5.04199 24.9082C7.27245 22.941 10.0818 21.2203 13.1035 19.7031C19.1582 16.6631 25.9552 14.4866 30.5264 12.7393C41.8581 8.40804 55.3764 5.94838 67.4443 4.20117Z" fill="white" stroke="black" />' +
'</svg >',
		x: window.innerWidth *0.40,
		y: window.innerHeight / 2,
		scale: 1,
		theta: 11,
		anchor: 0,
		density: 80

	}
);`,

	'nozzle': `
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
);`,
};

const CUSTOM_TEMPLATE = `
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
		[new Vector(0, 0), new Vector(w, 0)], // top
		[new Vector(w, 0), new Vector(w, h)], 
		[new Vector(w, h), new Vector(0, h)],
		[new Vector(0, h), new Vector(0, 0)], 
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
);`;

const GENERATOR_LIST = [
	{ id: 'airfoil', name: 'Airfoil', particles: '1000' },
	{ id: 'nozzle', name: 'Emitter Funnel', particles: '2500' },
	{ id: 'HeatTransmissionWave', name: 'Heat Wave', particles: '600' },
	{ id: 'fluidCrash', name: 'Fluid Crash', particles: '700' },
	{ id: 'lattice', name: 'Crystal Lattice', particles: '1000' },
	{ id: 'explode', name: 'Explosion', particles: '500' },
	{ id: 'EnergyLine', name: 'Energy Line', particles: '500' },
	{ id: 'swarmWalk', name: 'Swarm Walk', particles: '1000' },
	{ id: 'phaseWave', name: 'Phase Wave', particles: '60' },
	{ id: 'wallCrash', name: 'Wall Crash', particles: '100' },
	{ id: 'blowOver', name: 'Blowover', particles: '700' },
	{ id: 'ballChain', name: 'Ball Chain', particles: '50' },
	{ id: 'fluidCrashHD', name: 'Fluid Crash HD', particles: '7000' },
];

let panelOpen = false;
let selectedGenId = null;
let originalCode = '';
let isCustomMode = false;
let codeModified = false;
let importedSvgName = null;

function renderGenList() {
	const list = document.getElementById('gen-list');
	list.innerHTML = '';
	GENERATOR_LIST.forEach(gen => {
		const div = document.createElement('div');
		div.className = 'gen-item' + (gen.id === selectedGenId && !isCustomMode ? ' active' : '');
		div.onclick = () => selectGenerator(gen.id);
		div.innerHTML = `
            <div class="gen-dot"></div>
            <span class="gen-name">${gen.name}</span>
            <span class="gen-tag">${gen.particles}p</span>
        `;
		list.appendChild(div);
	});
}

function selectGenerator(id) {
	isCustomMode = false;
	selectedGenId = id;
	codeModified = false;

	const code = GENERATOR_CODES[id] || '';
	originalCode = code;
	openEditor(GENERATOR_LIST.find(g => g.id === id)?.name || id, code, false);
	renderGenList();

	const worldMap = {
		wallCrash, fluidCrash, fluidCrashHD, explode,
		HeatTransmissionWave, swarmWalk, lattice, EnergyLine, blowOver, ballChain,
		nozzle, phaseWave, airfoil,
	};
	const world = worldMap[id];
	if (world) startSimulation(world);
}

function createCustomGenerator() {
	isCustomMode = true;
	selectedGenId = null;
	codeModified = false;
	originalCode = CUSTOM_TEMPLATE;
	openEditor('Custom Generator', CUSTOM_TEMPLATE, false, true);
	renderGenList();
}

function triggerSvgImport() {
	const input = document.getElementById('svg-file-input');
	if (input) input.click();
}

function handleSvgImport(event) {
	const file = event.target.files && event.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = () => {
		const parser = new DOMParser();
		const doc = parser.parseFromString(reader.result, 'image/svg+xml');
		const svgEl = doc.querySelector('svg');

		if (!svgEl || doc.querySelector('parsererror')) {
			showError('could not read that svg file');
			event.target.value = '';
			return;
		}

		const container = document.getElementById('imported-svg-container');
		container.innerHTML = '';
		container.appendChild(svgEl);

		importedSvgName = file.name;
		document.getElementById('svg-import-label').textContent = importedSvgName;
		document.getElementById('svg-clear-btn').style.display = 'inline-flex';
		document.getElementById('shape-section').classList.add('visible');

		pathoffset.transform.x = window.innerWidth / 2;
		pathoffset.transform.y = window.innerHeight / 2;
		syncShapeSliders();

		if (typeof renderPath === 'function') renderPath();
		event.target.value = '';
	};
	reader.readAsText(file);
}

function clearSvgImport() {
	const container = document.getElementById('imported-svg-container');
	if (container) container.innerHTML = '';

	importedSvgName = null;
	document.getElementById('svg-import-label').textContent = 'Import SVG';
	document.getElementById('svg-clear-btn').style.display = 'none';
	document.getElementById('shape-section').classList.remove('visible');

	if (typeof renderPath === 'function') renderPath();
}

function openEditor(title, code, modified = false, isCustom = false) {
	const section = document.getElementById('editor-section');
	const nameEl = document.getElementById('editor-gen-name');
	const textarea = document.getElementById('code-editor');
	const resetBtn = document.getElementById('reset-btn');

	nameEl.textContent = title;
	textarea.value = code;
	resetBtn.style.display = modified ? 'inline-flex' : 'none';
	section.classList.add('visible');
	hideError();
	hideSuccess();
	codeModified = modified;
}

function handleCodeChange() {
	const textarea = document.getElementById('code-editor');
	const resetBtn = document.getElementById('reset-btn');

	const currentCode = textarea.value;
	codeModified = currentCode !== originalCode;

	resetBtn.style.display = codeModified ? 'inline-flex' : 'none'

	hideError();
	hideSuccess();
}

function resetEditorCode() {
	const textarea = document.getElementById('code-editor');
	textarea.value = originalCode;
	handleCodeChange();
}

function saveAndPlay() {
	const code = document.getElementById('code-editor').value;
	hideError();
	hideSuccess();

	try {
		const matches = [...code.matchAll(/\bvar\s+(\w+)\s*=\s*new\s+World\s*\(/g)];
		if (matches.length === 0) {
			throw new Error('No World declaration found. Your code must include: var myWorld = new World(particleCount, generator, constrainX, constrainY);');
		}
		const varName = matches[matches.length - 1][1];

		(0, eval)(code);

		const world = window[varName];
		if (!world || !(world instanceof World)) {
			throw new Error(`"${varName}" is not a valid World instance.`);
		}

		if (codeModified && !isCustomMode) {
			selectedGenId = null;
			renderGenList();
		}

		startSimulation(world);
		showSuccess();

		originalCode = code;
		codeModified = false;
		document.getElementById('reset-btn').style.display = 'none';

	} catch (err) {
		showError(err.message || String(err));
	}
}

function showError(msg) {
	const box = document.getElementById('error-box');
	box.textContent = '⚠ ' + msg;
	box.classList.add('visible');
}
function hideError() { const b = document.getElementById('error-box'); if (b) b.classList.remove('visible'); }
function showSuccess() { const el = document.getElementById('success-flash'); if (!el) return; el.classList.add('visible'); setTimeout(() => el.classList.remove('visible'), 1200); }
function hideSuccess() { const el = document.getElementById('success-flash'); if (el) el.classList.remove('visible'); }

function togglePanel() {
	panelOpen = !panelOpen;
	document.getElementById('panel').classList.toggle('open', panelOpen);
	document.getElementById('toggle-btn').classList.toggle('active', panelOpen);
	document.getElementById('mycanvas').classList.toggle('panel-open', panelOpen);
}

let helpModalWasPlaying = false;
function openHelpModal() {
	const overlay = document.getElementById('help-modal-overlay');
	if (!overlay) return;
	helpModalWasPlaying = !isPaused;
	if (!isPaused && typeof handlePlayPause === 'function') handlePlayPause(); // pause everything underneath while the modal is open
	overlay.classList.add('visible');
}
function closeHelpModal() {
	const overlay = document.getElementById('help-modal-overlay');
	if (!overlay) return;
	overlay.classList.remove('visible');
	if (helpModalWasPlaying && isPaused && typeof handlePlayPause === 'function') handlePlayPause(); // only resume if it was running before we opened the modal
}
function handleHelpOverlayClick(event) {
	if (event.target && event.target.id === 'help-modal-overlay') closeHelpModal();
}
window.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		const overlay = document.getElementById('help-modal-overlay');
		if (overlay && overlay.classList.contains('visible')) closeHelpModal();
	}
});

function syncShapeSliders() {
	const density = document.getElementById('shape-density');
	const densityVal = document.getElementById('shape-density-value');
	const sizeSlider = document.getElementById('shape-size');
	const sizeVal = document.getElementById('shape-size-value');
	const anchorSlider = document.getElementById('shape-anchor');
	const anchorVal = document.getElementById('shape-anchor-value');
	const xSlider = document.getElementById('shape-x');
	const xVal = document.getElementById('shape-x-value');
	const ySlider = document.getElementById('shape-y');
	const yVal = document.getElementById('shape-y-value');
	const thetaSlider = document.getElementById('shape-theta');
	const thetaVal = document.getElementById('shape-theta-value');

	if (!density || !sizeSlider || !anchorSlider || !xSlider || !ySlider || !thetaSlider) return;

	xSlider.max = window.innerWidth;
	ySlider.max = window.innerHeight;

	density.value = pathdensity;
	densityVal.textContent = pathdensity;

	sizeSlider.value = Math.round(pathScale * 100);
	sizeVal.textContent = Math.round(pathScale * 100) + '%';

	anchorSlider.value = pathAnchor;
	anchorVal.textContent = pathAnchor;

	xSlider.value = pathoffset.transform.x;
	xVal.textContent = Math.round(pathoffset.transform.x);
	ySlider.value = pathoffset.transform.y;
	yVal.textContent = Math.round(pathoffset.transform.y);
	thetaSlider.value = pathoffset.theta;
	thetaVal.textContent = pathoffset.theta;
}

function bindShapeControls() {
	const density = document.getElementById('shape-density');
	const densityVal = document.getElementById('shape-density-value');
	const sizeSlider = document.getElementById('shape-size');
	const sizeVal = document.getElementById('shape-size-value');
	const anchorSlider = document.getElementById('shape-anchor');
	const anchorVal = document.getElementById('shape-anchor-value');
	const xSlider = document.getElementById('shape-x');
	const xVal = document.getElementById('shape-x-value');
	const ySlider = document.getElementById('shape-y');
	const yVal = document.getElementById('shape-y-value');
	const thetaSlider = document.getElementById('shape-theta');
	const thetaVal = document.getElementById('shape-theta-value');

	if (!density || !sizeSlider || !anchorSlider || !xSlider || !ySlider || !thetaSlider) return;

	syncShapeSliders();
	window.addEventListener('resize', syncShapeSliders);

	density.addEventListener('input', (e) => {
		const v = Number(e.target.value) || 2;
		pathdensity = v;
		densityVal.textContent = v;
		if (typeof renderPath === 'function') renderPath();
	});
	sizeSlider.addEventListener('input', (e) => {
		const v = Number(e.target.value) || 100;
		pathScale = v / 100;
		sizeVal.textContent = v + '%';
		if (typeof renderPath === 'function') renderPath();
	});
	anchorSlider.addEventListener('input', (e) => {
		const v = Number(e.target.value) || 0;
		pathAnchor = v;
		anchorVal.textContent = v;
		if (typeof renderPath === 'function') renderPath();
	});
	xSlider.addEventListener('input', (e) => {
		const v = Number(e.target.value) || 0;
		pathoffset.transform.x = v;
		xVal.textContent = v;
		if (typeof renderPath === 'function') renderPath();
	});
	ySlider.addEventListener('input', (e) => {
		const v = Number(e.target.value) || 0;
		pathoffset.transform.y = v;
		yVal.textContent = v;
		if (typeof renderPath === 'function') renderPath();
	});
	thetaSlider.addEventListener('input', (e) => {
		const v = Number(e.target.value) || 0;
		pathoffset.theta = v;
		thetaVal.textContent = v;
		if (typeof renderPath === 'function') renderPath();
	});
}

window.addEventListener('DOMContentLoaded', () => {
	// default max speed for coloring
	if (typeof window.maxParticleSpeed === 'undefined') window.maxParticleSpeed = 15;

	renderGenList();
	const starter = ['airfoil', 'nozzle', 'phaseWave', 'explode', 'HeatTransmissionWave', 'EnergyLine', 'blowOver', 'fluidCrash', 'wallCrash', 'swarmWalk', 'lattice'];
	const pick = starter[Math.floor(Math.random() * starter.length)];
	selectGenerator(pick);
	openEditor(GENERATOR_LIST.find(g => g.id === selectedGenId)?.name || 'Generator', GENERATOR_CODES[selectedGenId] || '', false);

	// keep panel open on load
	panelOpen = true;
	const panelEl = document.getElementById('panel');
	const toggleBtn = document.getElementById('toggle-btn');
	const canvas = document.getElementById('mycanvas');
	if (panelEl) panelEl.classList.add('open');
	if (toggleBtn) toggleBtn.classList.add('active');
	if (canvas) canvas.classList.add('panel-open');

	// slider binding
	const slider = document.getElementById('max-speed');
	const valEl = document.getElementById('max-speed-value');
	if (slider && valEl) {
		slider.value = window.maxParticleSpeed;
		valEl.textContent = slider.value;
		slider.addEventListener('input', (e) => {
			const v = Number(e.target.value) || 1;
			window.maxParticleSpeed = v;
			valEl.textContent = v;
		});
	}

	bindShapeControls();
});