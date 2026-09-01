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
var wallCrash = new World(400, wallCrashGen, true, true);`,

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
var fluidCrash = new World(partCount, fastFluidCrash, true, true);`,

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
var fluidCrashHD = new World(partCount2, fastFluidCrashHD, true, true);`,

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
var explode = new World(500, explodeGen, true, true);`,

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
var HeatTransmissionWave = new World(600, heatWaveGen, true, true);`,

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
var EnergyLine = new World(500, hotLineGenerator, false, true);`,

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
var blowOver = new World(700, highSpeedLineGen, false, true);`,

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
var ballChain = new World(50, ballChainGen, true, true);`,

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
    var swarmWalk = new World(1000, swarmGen, true, true);`,

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
var lattice = new World(1000, latticeGen, true, true);`,
};

const CUSTOM_TEMPLATE = `// Custom Generator template
let ParticleCount = 400
let ContainX = true
let ContainY = true
let CustomFrameRate = 30
let Trail = 3;
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
var myWorld = new World(ParticleCount, myGenerator, ContainX, ContainY, Trail, CustomFrameRate);`;

const GENERATOR_LIST = [
	{ id: 'explode', name: 'Explosion', particles: '500' },
	{ id: 'HeatTransmissionWave', name: 'Heat Wave', particles: '600' },
	{ id: 'EnergyLine', name: 'Energy Line', particles: '500' },
	{ id: 'fluidCrash', name: 'Fluid Crash', particles: '700' },
	{ id: 'fluidCrashHD', name: 'Fluid Crash HD', particles: '7000' },
	{ id: 'lattice', name: 'Crystal Lattice', particles: '1000' },
	{ id: 'swarmWalk', name: 'Swarm Walk', particles: '1000' },
	{ id: 'wallCrash', name: 'Wall Crash', particles: '100' },
	{ id: 'blowOver', name: 'Blowover', particles: '700' },
	{ id: 'ballChain', name: 'Ball Chain', particles: '50' },
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
	const badge = document.getElementById('modified-badge');
	const resetBtn = document.getElementById('reset-btn');

	nameEl.textContent = title;
	textarea.value = code;
	badge.classList.toggle('visible', modified);
	resetBtn.style.display = modified ? 'inline-flex' : 'none';
	section.classList.add('visible');
	hideError();
	hideSuccess();
	codeModified = modified;
}

function handleCodeChange() {
	const textarea = document.getElementById('code-editor');
	const badge = document.getElementById('modified-badge');
	const resetBtn = document.getElementById('reset-btn');

	const currentCode = textarea.value;
	codeModified = currentCode !== originalCode;

	badge.classList.toggle('visible', codeModified);
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
			throw new Error('No World declaration found. Your code must include: var myWorld = new World(particleCount, generator, containX, containY);');
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
		document.getElementById('modified-badge').classList.remove('visible');
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
	const starter = ['explode', 'HeatTransmissionWave', 'EnergyLine', 'blowOver', 'fluidCrash', 'wallCrash', 'swarmWalk', 'lattice'];
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