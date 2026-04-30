# [Fluid Engine](https://voidconsole.github.io/fluid-sim/)

This project is a technical experiment designed to explore a fundamental question in computational physics: Can complex, global fluid behaviors emerge solely from simple, localized collision laws?

Most fluid simulations rely on the Navier-Stokes equations, complex partial differential equations that describe fluid motion as a continuum. This engine takes the opposite approach. There are no pressure solvers, no viscosity constants, and no differential equations. Instead, it uses high-fidelity, discrete particle-to-particle collision math written from scratch.

The result is a successful proof-of-concept: phenomena such as vorticity, pressure gradients, and thermal diffusion emerge naturally from the bottom-up.
[Check it out!](https://voidconsole.github.io/fluid-sim/)

<img width="1858" height="913" alt="image" src="https://github.com/user-attachments/assets/21592fa8-f103-4172-8dfb-8c5c8ffe1751" />


## The Research Hypothesis
The core goal was to determine if macro-scale fluid properties could be "simulated" without actually programming them. By defining only how two circles bounce off one another, we observe the emergence of:
* **Velocity Fields:** Collective motion patterns.
* **Pressure:** High-density areas naturally pushing back against entry.
* **Vortices:** Circular movements caused by momentum transfer in dense clusters.
* **Energy Distribution:** The visual representation of "temperature" via kinetic energy.

None of these properties were programmed. There is no pressure variable, no temperature field, no vorticity calculation. They are visible because they are real, they exist in the system as consequences of the collision law, and the color mapping simply makes them legible.

This project utilizes and extends my custom collision engine found at [voidconsole/collision](https://github.com/voidconsole/collision).


---

## The Experiments

Each experiment is a specific physical scenario. The generator function is the only thing that changes between them; the collision engine underneath is identical.

### Explosion (`explode`)
Depicts the behavior of a highly pressurized gas released into a very low-pressure region. The sudden pressure differential drives an explosive radial expansion, fast particles scatter outward while the surrounding cold gas is pushed aside, creating a sharp, propagating pressure front.

### Heat Wave (`HeatTransmissionWave`)
Demonstrates what happens when a high-pressure region is exposed to open space: a pressure and velocity gradient forms at the interface, and that gradient propagates outward like a wave. The wave reflects off the containing walls and oscillates back and forth as the system slowly approaches equilibrium, a clean emergent analogue of acoustic wave propagation in a compressible medium.

### Energy Line (`EnergyLine`)
A narrow horizontal band of high-velocity particles is sandwiched between two large regions of slow-moving gas, with open X boundaries (particles wrap) and closed Y boundaries (particles reflect off the top and bottom walls). This isolates a shear-layer scenario analogous to the Kelvin-Helmholtz instability, two fluids at different speeds sharing an interface. Energy bleeds laterally from the fast band into the cold regions through collisions, and the interface progressively breaks down. It is worth watching how the system transitions from ordered to chaotic and eventually settles into thermal equilibrium.

### Fluid Crash (`fluidCrash`)
Most particles are distributed across the right half of the screen with low random velocities, a slow, equilibrated fluid at rest. A smaller group is fired in from the left at high speed. The experiment tests momentum transfer through a fluid body: does the incoming fast fluid push the slow fluid, compress it, or pass through it? What emerges is a moving pressure front, a deceleration of the impacting particles, and a simultaneous acceleration of previously still ones, bulk momentum transfer, with no formula anywhere in the code describing it. At the edges of the collision zone, the faint beginnings of fluid curling are also visible.

### Fluid Crash HD (`fluidCrashHD`)
The same experiment as Fluid Crash, run at 7,000 particles with a smaller particle size of 5px. The higher resolution resolves the fine structure of the pressure front and makes the velocity field legible in far greater detail. Most importantly, **vortices become clearly visible**, as the fast projectile group punches through the slow fluid, curls form in the wake behind the collision front. These are genuine fluid vortices, spontaneously self-organized from nothing but collision geometry. The emergent texture of the interface is, at this resolution, remarkably indistinguishable from a real turbulent fluid boundary.

### Wall Crash (`wallCrash`)
Two concentrated streams are fired directly at each other from opposite sides of the screen. This is the cleanest test of momentum conservation in the system: two dense bodies of particles colliding head-on. What emerges is a wall of pressure at the impact point, with particles reflecting symmetrically outward. Unlike most other experiments in this collection, the behavior here is closer to macroscopic solid-body collision than fluid dynamics, a useful contrast that shows the same collision rule can reproduce both regimes depending on initial conditions.

### Blowover (`blowOver`)
A fast stream of particles occupies the top third of the screen; a slow, cold population sits below. The interface between them is a free shear layer, the particle equivalent of wind over water. Over time, the fast layer drags the slow layer through collisions across the boundary, imparting downward momentum. Drag, entirely emergent. What makes this experiment especially interesting to watch is the system's temporal progression: initially the two populations are stable and clearly separated, but the interface quickly destabilizes, becomes chaotic, and eventually reaches thermal equilibrium. It also demonstrates that fast-moving gas is at lower pressure, visibly pulling the colder gas upward into the fast stream, a direct emergent analogue of the Bernoulli effect.

### Ball Chain (`ballChain`)
A more Newtonian experiment, an extended Newton's cradle. Two chains of balls converge and meet at a single point of contact at the top. The interesting phenomenon to observe is how that initial touch propagates downward through each chain, opening them apart like a zipper being pulled from the top. Momentum travels sequentially through the chain of contacts, particle by particle, with the wave of separation moving visibly from the point of first impact toward the tail ends.

---
## Key Aspects

* **Custom World Engine:** A `World` class that manages particle counts, boundary constraints (Contain X/Y), and custom frame rates.
* **Live Code Editor:** The UI includes a built-in sandbox where you can rewrite the generator logic in real-time and re-inject it into the running simulation using `eval()` safely within the scope.
* **Zero Dependencies:** Built using raw JavaScript and the p5.js library for canvas rendering.


## Architecture

The codebase is split into four files with clean separation of concerns.

### `particleGenerators.js` - World Definitions

This file defines the `World` class and all the named experiments. A `World` is a lightweight configuration object:

```js
class World {
    constructor(particleCount, particleGenerator, containX, containY, frameRate) { ... }
}
```

The `particleGenerator` is a function that takes a particle index and returns `[size, position, velocity]`. All of the physics setup - where particles start, how fast they move, which direction - lives entirely in the generator. This design means experiments are completely self-contained and composable.

Boundary conditions are a property of the World, not the particle. `containX` and `containY` control whether a particle bounces off a wall or wraps to the other side of the canvas.

### `main.js` - The Simulation Core

This is the engine. It runs inside p5.js and owns three responsibilities: rendering particles, moving them, and resolving collisions.

**The Particle class** handles its own display and movement. Color is computed live each frame from the particle's current speed, mapped against a configurable `maxParticleSpeed` ceiling:

```js
let red  = myMap(speed, 0, maxSpeed, 0, 255);
let blue = myMap(speed, 0, maxSpeed, 255, 0);
```

**The `triangulate` function** is the collision pass. It runs an O(n²) pairwise check across all particles every frame - every particle checked against every other particle. This is brute-force by design; the goal was correctness and clarity, not performance optimization.


**The collision resolution** in `Particle.collide()` is the heart of the project. When two particles overlap, three things happen:

1. **Separation** - The particles are pushed apart along the collision normal by half the overlap distance each, so they no longer intersect.
2. **Impulse transfer** - The component of relative velocity along the collision normal is computed as a scalar, then converted back to a vector and exchanged between the two particles.
3. **Collision count** - A global counter increments. This feeds the live collision counter in the UI.

```js
var overlap = (getDist(this, other) - (this.size / 2 + other.size / 2)) / 2;
var backoff = new Vector(normal.x * overlap, normal.y * overlap);
this.position.add(backoff);
other.position.sub(backoff);
var relative = new Vector(this.velocity.x - other.velocity.x, this.velocity.y - other.velocity.y);
var influence = relative.x * normal.x + relative.y * normal.y;
var delta = new Vector(influence * normal.x, influence * normal.y);
this.velocity.sub(delta);
other.velocity.add(delta);
other.velocity.add(delta);
```

This is elastic collision, resolved geometrically. No mass-weighted formulas, no coefficient of restitution, just the projection of relative momentum onto the contact normal. It conserves momentum by construction.

### `menu.js` - UI and Editor

The panel handles experiment selection, a live code editor for each generator, and the custom generator workflow. The editor lets you modify any experiment's generator function and run it immediately via `Save & Play`, which evaluates the code, extracts the `World` instance by scanning for `new World(` declarations, and passes it to `startSimulation()`.

The custom generator template is the entry point for writing new experiments. It exposes the full API surface - `ParticleCount`, boundary flags, frame rate, and the generator function - with sensible defaults.

### `index.html` - Canvas and Controls

The canvas fills the viewport. The control panel slides in from the left. A max-speed slider lets you recalibrate the color scale at runtime - useful when running low-particle experiments where terminal velocities are different from the defaults.


---

## Technical Notes

**Collision complexity** is O(n²) per frame. For 500 particles at 30fps, that's roughly 3.75 million distance checks per second. For the 7,000-particle HD experiment, it reaches ~735 million. This is the primary constraint on particle count and frame rate.

**No spatial partitioning** is used. A quadtree or spatial hash would reduce complexity to roughly O(n log n) and is a natural next step for anyone extending this.

**The collision model is perfectly elastic.** Kinetic energy is conserved in every collision. Real fluids lose energy to heat through viscous dissipation; this system does not. The emergent behaviors are therefore closest to an ideal gas or superfluid, not a viscous liquid.
**p5.js** is used as the canvas rendering layer. The simulation logic is entirely plain JavaScript and has no dependency on p5 beyond the draw loop and canvas primitives.
---
## Future Updates
- To improve efficiency by checking collisions with only particles in a local group
- To account for custom shapes and masses
- To extend as a fluid simulator for fluid dynamic analysis


## Conclusion
The experiment is considered **successful**. The simulation demonstrates that while Navier-Stokes provides a top-down mathematical shortcut for fluid flow, the behavior itself is a fundamental result of billions of local interactions. Even with a few hundred particles, we see the "soul" of a fluid without writing a single line of traditional fluid physics. 
