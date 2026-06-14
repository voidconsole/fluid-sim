const GENERATOR_CODES = {
	'wallCrash': `function wallCrashGen(index) {
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

	'fluidCrash': `let partCount = 700;
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

	'fluidCrashHD': `let partCount2 = 7000;
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

	'explode': `function explodeGen(index) {
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

	'HeatTransmissionWave': `function heatWaveGen(index) {
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

	'EnergyLine': `function hotLineGenerator(index) {
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

	'blowOver': `function highSpeedLineGen(index) {
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

	'ballChain': `function ballChainGen(index) {
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
};

const CUSTOM_TEMPLATE = `let ParticleCount = 400
let ContainX = true
let ContainY = true
let CustomFrameRate = 30
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
var myWorld = new World(ParticleCount, myGenerator, ContainX, ContainY, CustomFrameRate);`;

const GENERATOR_LIST = [
	{ id: 'explode', name: 'Explosion', particles: '500' },
	{ id: 'HeatTransmissionWave', name: 'Heat Wave', particles: '600' },
	{ id: 'EnergyLine', name: 'Energy Line', particles: '500' },
	{ id: 'fluidCrash', name: 'Fluid Crash', particles: '700' },
	{ id: 'fluidCrashHD', name: 'Fluid Crash HD', particles: '7000' },
	{ id: 'wallCrash', name: 'Wall Crash', particles: '100' },
	{ id: 'blowOver', name: 'Blowover', particles: '700' },
	{ id: 'ballChain', name: 'Ball Chain', particles: '50' },
];

let panelOpen = false;
let selectedGenId = null;
let originalCode = '';
let isCustomMode = false;
let codeModified = false;

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
		HeatTransmissionWave, EnergyLine, blowOver, ballChain
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

window.addEventListener('DOMContentLoaded', () => {
	// default max speed for coloring
	if (typeof window.maxParticleSpeed === 'undefined') window.maxParticleSpeed = 15;

	renderGenList();
	const starter = ['explode', 'HeatTransmissionWave', 'EnergyLine', 'blowOver', 'fluidCrash', 'wallCrash'];
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
});
