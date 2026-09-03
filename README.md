# [Fluid Engine](https://voidconsole.github.io/fluid-sim/)

this project is an experiment to explore the quite fundamental question in computational physics: can complex, global fluid behaviors emerge solely from simple, localized collision laws?

most fluid simulations rely on the navier-stokes equations, complex partial differential equations that describe fluid motion as a continuum. this engine takes the opposite approach. there are no pressure solvers, no viscosity constants, and no differential equations. instead, it uses high-fidelity, discrete particle-to-particle collision math written from scratch.

the result is a successful proof-of-concept: phenomena such as vorticity, pressure gradients, and thermal diffusion emerge naturally from the bottom-up.
[check it out!](https://voidconsole.github.io/fluid-sim/)


find videos, simulations, tests and failures [here](https://drive.google.com/drive/folders/1ESwztzcPn9aTRWIODQ-dJw75UBhIh-h9?usp=sharing). 
find complete development journal [here](https://github.com/voidconsole/fluid-sim/journal.md)

## hypothesis

the core goal was to determine if macro-scale fluid properties could be "simulated" without actually programming them. by defining only how two circles bounce off one another, we observe the emergence of:

* **velocity fields:** collective motion patterns.
* **pressure:** high-density areas naturally pushing back against entry.
* **vortices:** circular movements caused by momentum transfer in dense clusters.
* **energy distribution:** the visual representation of "temperature" via kinetic energy.

none of these properties were programmed. there is no pressure variable, no temperature field, no vorticity calculation. they are visible because they are real, they exist in the system as consequences of the collision law, and the color mapping simply makes them legible.

this project utilizes and extends my custom collision engine found at [voidconsole/collision](https://github.com/voidconsole/collision).



## experiments

each experiment is a specific physical scenario. the generator function is the only thing that changes between them; the collision engine underneath is identical.

### explosion (`explode`)

depicts the behavior of a highly pressurized gas released into a very low-pressure region. the sudden pressure differential drives an explosive radial expansion, fast particles scatter outward while the surrounding cold gas is pushed aside, creating a sharp, propagating pressure front.

### heat wave (`HeatTransmissionWave`)

demonstrates what happens when a high-pressure region is exposed to open space: a pressure and velocity gradient forms at the interface, and that gradient propagates outward like a wave. the wave reflects off the containing walls and oscillates back and forth as the system slowly approaches equilibrium, a clean emergent analogue of acoustic wave propagation in a compressible medium.

### energy line (`EnergyLine`)

a narrow horizontal band of high-velocity particles is sandwiched between two large regions of slow-moving gas, with open X boundaries (particles wrap) and closed Y boundaries (particles reflect off the top and bottom walls). this isolates a shear-layer scenario analogous to the kelvin-helmholtz instability, two fluids at different speeds sharing an interface. energy bleeds laterally from the fast band into the cold regions through collisions, and the interface progressively breaks down. it is worth watching how the system transitions from ordered to chaotic and eventually settles into thermal equilibrium.

### fluid crash (`fluidCrash`)

most particles are distributed across the right half of the screen with low random velocities, a slow, equilibrated fluid at rest. a smaller group is fired in from the left at high speed. the experiment tests momentum transfer through a fluid body: does the incoming fast fluid push the slow fluid, compress it, or pass through it? what emerges is a moving pressure front, a deceleration of the impacting particles, and a simultaneous acceleration of previously still ones, bulk momentum transfer, with no formula anywhere in the code describing it. at the edges of the collision zone, the faint beginnings of fluid curling are also visible.

### fluid crash HD (`fluidCrashHD`)

the same experiment as fluid crash, run at 7,000 particles with a smaller particle size of 5px. the higher resolution resolves the fine structure of the pressure front and makes the velocity field legible in far greater detail. most importantly, vortices become clearly visible, as the fast projectile group punches through the slow fluid, curls form in the wake behind the collision front. these are genuine fluid vortices, spontaneously self-organized from nothing but collision geometry. the emergent texture of the interface is, at this resolution, remarkably indistinguishable from a real turbulent fluid boundary.

### crystal lattice (`crystalLattice`)

an extreme overcrowding of large particles allowed to expand freely into a container. after a chaotic explosion, the particles seem to form lattice patterns or other crystal structures similar to atomic lattices in crystals and metals, trying to pack as efficiently as possible. it quite often forms regions of hexagonal lattices, separated by linear defects, which continuously change boundaries. sometimes, even vacancy defects appear. shockwaves can be seen travelling across the whole crystal.


### wall crash (`wallCrash`)

two concentrated streams are fired directly at each other from opposite sides of the screen. this is the cleanest test of momentum conservation in the system: two dense bodies of particles colliding head-on. what emerges is a wall of pressure at the impact point, with particles reflecting symmetrically outward. unlike most other experiments in this collection, the behavior here is closer to macroscopic solid-body collision than fluid dynamics, a useful contrast that shows the same collision rule can reproduce both regimes depending on initial conditions.

### blowover (`blowOver`)

a fast stream of particles occupies the top third of the screen; a slow, cold population sits below. the interface between them is a free shear layer, the particle equivalent of wind over water. over time, the fast layer drags the slow layer through collisions across the boundary, imparting downward momentum. drag, entirely emergent. what makes this experiment especially interesting to watch is the system's temporal progression: initially the two populations are stable and clearly separated, but the interface quickly destabilizes, becomes chaotic, and eventually reaches thermal equilibrium. it also demonstrates that fast-moving gas is at lower pressure, visibly pulling the colder gas upward into the fast stream, a direct emergent analogue of the bernoulli effect.

### ball chain (`ballChain`)

a more newtonian experiment, an extended newton's cradle. two chains of balls converge and meet at a single point of contact at the top. the interesting phenomenon to observe is how that initial touch propagates downward through each chain, opening them apart like a zipper being pulled from the top. momentum travels sequentially through the chain of contacts, particle by particle, with the wave of separation moving visibly from the point of first impact toward the tail ends.

---

## keys

* **custom world engine:** a `World` class that manages particle counts, boundary constraints (Contain X/Y), custom frame rates, and arbitrary wall geometry.
* **live code editor:** the UI includes a built-in sandbox where you can rewrite the generator logic in real-time and re-inject it into the running simulation using `eval()` safely within the scope.
* **zero dependencies:** built using raw javascript and the p5.js library for canvas rendering.

## arch

the codebase is split into four files with clean separation of concerns.

### `particleGenerators.js` - world definitions

this file defines the `World` class and all the named experiments. a `World` is a lightweight configuration object:

```js
class World {
    constructor(particleCount, particleGenerator, containX, containY, frameRate) { ... }
}

```

the `particleGenerator` is a function that takes a particle index and returns `[size, position, velocity]`. all of the physics setup - where particles start, how fast they move, which direction - lives entirely in the generator. this design means experiments are completely self-contained and composable.

boundary conditions are a property of the World, not the particle. `containX` and `containY` control whether a particle bounces off a wall or wraps to the other side of the canvas.

### `main.js` - the simulation core

this is the engine. it runs inside p5.js and handles three core tasks: rendering particles, stepping their movement, and resolving collisions.

**the Particle class** handles its own display, movement, and variable mass. color is mapped live each frame from speed against `maxParticleSpeed`:

```js
let red  = lerpBetween(s, 0, maxSpeed, 0, 255)[cite: 1];
let blue = lerpBetween(s, 0, maxSpeed, 255, 0)[cite: 1];

```

**the `triangulate` pass** runs wall boundary checks, position steps, particle-particle collisions, and secondary wall constraint checks each frame:

```js
function triangulate(colliders, contraints) {
	for (let i = 0; i < colliders.length; i++) {
		contraints.forEach((constraint) => {
			constraint.bounce(colliders[i])[cite: 1]
		})
	}

	for (let i = 0; i < colliders.length; i++) {
		if (colliders[i].rigid) continue[cite: 1]
		if (colliders[i].skipnext) { colliders[i].skipnext = false; continue }[cite: 1]
		colliders[i].move()[cite: 1]
	}
	for (let i = 0; i < colliders.length; i++) {
		for (let j = i + 1; j < colliders.length; j++) {
			colliders[i].collide(colliders[j]);[cite: 1]
		}
	}
	for (let i = 0; i < colliders.length; i++) {
		contraints.forEach((constraint) => {
			constraint.bounce(colliders[i])[cite: 1]
		})
	}

	for (let i = 0; i < colliders.length; i++) {
		colliders[i].display()[cite: 1]
	}
	contraints.forEach((constraint) => constraint.display());[cite: 1]
}

```

**particle collisions** use harmonic mean weighting to handle varying particle masses cleanly alongside infinite-mass rigid bodies without hitting division-by-zero or NaN errors:

```js
let harmonic = 2 / ((1 / this.mass) + (1 / other.mass))[cite: 1]
if (harmonic === Infinity) harmonic = Math.min(this.mass, other.mass)[cite: 1]
let backoff = ops.scale(normal, overlap)[cite: 1]
this.position.add(ops.scale(backoff, (harmonic / this.mass)))[cite: 1]
other.position.sub(ops.scale(backoff, (harmonic / other.mass)))[cite: 1]

```

### SVG path rendering and line segment walls

walls are line segments defined by a start and end vector. arbitrary boundary geometry can be sampled directly from an SVG path element by getting its total length, retrieving points along the path, and joining them into wall segments:

```js
function renderPath() {
	const path = document.querySelector("#myPath")[cite: 1]
	const length = path.getTotalLength()[cite: 1]
	const points = [][cite: 1]
	const resolution = pathdensity[cite: 1]
	for (let i = 0; i <= resolution; i++) {
		const p = path.getPointAtLength((i / resolution) * length)[cite: 1]
		if (isNaN(p.x) || isNaN(p.y)) continue[cite: 1]
			const ultimate = points[points.length - 1][cite: 1]
			if (ultimate) {
				const slopeu = (p.y - ultimate.y) / (p.x - ultimate.x)[cite: 1]
				const penultimate = points[points.length - 2][cite: 1]
				if (penultimate) {
					const slopep = (ultimate.y - penultimate.y) / (ultimate.x - penultimate.x)[cite: 1]
					if (slopeu === slopep){ points.pop()}[cite: 1]
				}
			}
			points.push(new Vector(p.x + pathoffset.x, p.y + pathoffset.y))[cite: 1]
		}
		for (let i = 0; i < points.length - 1; i++) {
			walls.push(
				new Wall(points[i], points[i + 1])[cite: 1]
			);
		}
		walls.push(new Wall(points[points.length - 1], points[0]))[cite: 1]
	}

```

points sharing identical slopes are popped to simplify linear runs without breaking geometry. to block tunneling at intersections and loose endpoints, stationary rigid anchor particles with infinite mass are instantiated automatically:

```js
function populateIntersections(newWall) {
	if (newWall) {
		for (const other of walls) {
			if (other === newWall) continue[cite: 1]
			const intersection = ops.intersect(newWall.start, newWall.end, other.start, other.end, true)[cite: 1]
			if (!intersection) continue[cite: 1]
			particles.push(new Particle(3, intersection, new Vector(0, 0), 1, true))[cite: 1]
			particles[particles.length - 1].display()[cite: 1]
		}
		return[cite: 1]
	}
	for (let i = 0; i < walls.length; i++) {
		for (let j = i + 1; j < walls.length; j++) {
			const intersection = ops.intersect(walls[i].start, walls[i].end, walls[j].start, walls[j].end, true)[cite: 1]
			if (!intersection) continue[cite: 1]
			particles.push(new Particle(anchor, intersection, new Vector(0, 0), 1, true))[cite: 1]
			particles[particles.length - 1].display()[cite: 1]
		}
	}
}

```

### `menu.js`

the panel handles experiment selection, a live code editor for each generator, and the custom generator workflow. the editor lets you modify any experiment's generator function and run it immediately via `Save & Play`, which evaluates the code, extracts the `World` instance by scanning for `new World(` declarations, and passes it to `startSimulation()`.

the custom generator template is the entry point for writing new experiments. it exposes the full API surface - `ParticleCount`, boundary flags, frame rate, and the generator function - with sensible defaults.

### `index.html`

the canvas fills the viewport. the control panel slides in from the left. a max-speed slider lets you recalibrate the color scale at runtime - useful when running low-particle experiments where terminal velocities are different from the defaults.

---

## technical notes

collision complexity is O(n²) per frame. for 500 particles at 30fps, that's roughly 3.75 million distance checks per second. for the 7,000-particle HD experiment, it reaches ~735 million. this is the primary constraint on particle count and frame rate.

no spatial partitioning is used. a quadtree or spatial hash would reduce complexity to roughly O(n log n) and is a natural next step for anyone extending this.

the collision model is perfectly elastic. kinetic energy is conserved in every collision. real fluids lose energy to heat through viscous dissipation; this system does not. the emergent behaviors are therefore closest to an ideal gas or superfluid, not a viscous liquid.
p5.js is used as the canvas rendering layer. the simulation logic is entirely plain javascript and has no dependency on p5 beyond the draw loop and canvas primitives.

---

## updates

* to implement adaptive sampling along SVG paths to place higher point density along curved regions
* to improve efficiency by checking collisions with only particles in a local group
* to account for custom shapes and masses
* to extend as a fluid simulator for fluid dynamic analysis

the experiment is considered **successful**. the simulation demonstrates that while navier-stokes provides a top-down mathematical shortcut for fluid flow, the behavior itself is a fundamental result of billions of local interactions. even with a few hundred particles, we see the "soul" of a fluid without writing a single line of traditional fluid physics.
