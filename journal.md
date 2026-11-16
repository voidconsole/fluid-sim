## Fluid Engine Issues

November 13 2026 4:51AM

Finally, I am optimising the fluid engine because this was long due and I finally use the quadtree hash mapping. Essentially, I divide the whole page into cells and perform modular arithmetic, converting the X and Y coordinates of each particle into a grid cell coordinates and only comparing against its neighboring cells, which heavily optimizes it even though making these array maps and deleting them in every layer is some extra overhead. One of the things we have to take care of is the cell size. I set up a buffer that checks against the largest particle and then multiplies it by a factor I call buffer. Based on that factor, it computes the cell size `particlesize * buffer= cellsize`. Based on the cell size, you assign the grid cells. All of this is handled by a new class called Grid. For every cell you get its neighboring cells and then only check collisions for all of the particles within them. That was about it. So it compares against every particle in the particle generator and picks the largest as the particle size. However this failed for emitter based simulations because they had no fixed particle set at start. So I added another condition that if it has a emitter then check against its particle generator function's particle size. Additionally, this approach breaks down the tunneling I spent so long trying to fix, because if a particle is too fast it skips right past a cell and it becomes meaningless.
This is an edge case I'll have to work on so until then I'm keeping this new code in legacy.



## tested a few images
_Fri, Nov 6, 01:22 AM_

**voidconsole · November 5, 2026**

![Image](https://github.com/user-attachments/assets/93fc1f41-86ea-4c97-9992-e83cc41576d4)

![Image](https://github.com/user-attachments/assets/e41af88f-204b-4cdc-a77b-2cc94afe8656)

![Image](https://github.com/user-attachments/assets/3117e41e-f771-4b85-817e-3d5858dcd7a9)

![Image](https://github.com/user-attachments/assets/a5873967-a9af-4de9-b481-9e03fb91fe42)

---

## svg path rendering in fluid engine

so since the walls were done, what i sought to do is create use an svg path, get path length, get points on that path, and draw walls on each point of that path, separated by a specified pathdensity variable, offset to whatever position required.

```js
function renderPath() {
    const path = document.querySelector("#myPath")
    const length = path.getTotalLength()
    const points = []
    const resolution = pathdensity
    for (let i = 0; i <= resolution; i++) {
        const p = path.getPointAtLength((i / resolution) * length)
        if (isNaN(p.x) || isNaN(p.y)) continue
        points.push(new Vector(p.x + pathoffset.x, p.y + pathoffset.y))
    }
    for (let i = 0; i < points.length - 1; i++) {
        walls.push(new Wall(points[i], points[i + 1]))
    }
    walls.push(new Wall(points[points.length - 1], points[0]))
}
```

this creates particles evenly, what would be ideal is having more particles at the curvatures.
adaptive sampling would be the next step.

on simpler note though i tried to just reduce the walls if they have the same slope.

```js
// if same slope, dont create new wall, instead just extend the last one
const ultimate = points[points.length - 1]
if (ultimate) {
    const slopeu = (p.y - ultimate.y) / (p.x - ultimate.x)
    const penultimate = points[points.length - 2]
    if (penultimate) {
        const slopep =
            (ultimate.y - penultimate.y) / (ultimate.x - penultimate.x)
        if (slopeu === slopep) points.pop()
    }
}
```

![Image](https://github.com/user-attachments/assets/4f5c7510-be55-484d-9dda-890304dcd6aa)

---


**voidconsole · September 22, 2026**

i made the walls fine and added anchors to each segment of the path and made the settings controllable through code and the UI, to change the path offsets, rotation and size, and added them to the UI in b52111c.

```js
function getActiveShapeElement() {
    const imported = document.getElementById("imported-svg-container")
    if (!imported || imported.childElementCount === 0) return null
    return imported.querySelector(
        "path, rect, circle, ellipse, line, polyline, polygon",
    )
}

function clearShapeWalls() {
    shapeWalls.forEach(w => {
        const wi = walls.indexOf(w)
        if (wi !== -1) walls.splice(wi, 1)
    })
    shapeCornerParticles.forEach(p => {
        const pi = particles.indexOf(p)
        if (pi !== -1) particles.splice(pi, 1)
    })
    shapeWalls = []
    shapeCornerParticles = []
}

function renderPath() {
    clearShapeWalls()
    const path = getActiveShapeElement()
    if (!path || typeof path.getTotalLength !== "function") return

    const thetaRad = ((pathoffset.theta % 360) * Math.PI) / 180
    const length = path.getTotalLength()
    const resolution = pathdensity
    const scale = pathScale

    const rawPoints = []
    let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity
    for (let i = 0; i <= resolution; i++) {
        const p = path.getPointAtLength((i / resolution) * length)
        if (isNaN(p.x) || isNaN(p.y)) continue
        rawPoints.push(p)
        if (p.x < minX) minX = p.x
        if (p.x > maxX) maxX = p.x
        if (p.y < minY) minY = p.y
        if (p.y > maxY) maxY = p.y
    }
    if (rawPoints.length === 0) return
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    const points = []
    let lineStart = null
    let lastPoint = null

    for (const p of rawPoints) {
        const current = new Vector(
            (p.x - centerX) * scale,
            (p.y - centerY) * scale,
        )
        current.rotate(thetaRad)
        current.add(pathoffset.transform)

        if (!lineStart) {
            lineStart = current
            points.push(current)
            lastPoint = current
            continue
        }
        if (points.length === 1) {
            points.push(current)
            lastPoint = current
            continue
        }

        const v1 = ops.difference(lastPoint, lineStart)
        const v2 = ops.difference(current, lastPoint)
        const angle1 = Math.atan2(v1.y, v1.x)
        const angle2 = Math.atan2(v2.y, v2.x)

        if (Math.abs(angle1 - angle2) < 0.01) {
            points[points.length - 1] = current
        } else {
            lineStart = lastPoint
            points.push(current)
        }
        lastPoint = current
    }

    function addShapeWall(a, b) {
        const w = new Wall(a, b, pathAnchor)
        walls.push(w)
        shapeWalls.push(w)
        shapeCornerParticles.push(...particles.slice(-2))
    }

    for (let i = 0; i < points.length - 1; i++) {
        addShapeWall(points[i], points[i + 1])
    }
    if (points.length > 2) {
        addShapeWall(points[points.length - 1], points[0])
    }
}

function isInlineSvgMarkup(str) {
    return typeof str === "string" && /^\s*<\s*(\?xml|svg)/i.test(str)
}

function applySvgMarkup(svgText) {
    const container = document.getElementById("imported-svg-container")
    if (!container) return false
    const parser = new DOMParser()
    const sanitized = String(svgText).replace(
        /<(\s+)(\/?)(\s*)([a-zA-Z])/g,
        "<$2$4",
    )
    const doc = parser.parseFromString(sanitized, "image/svg+xml")
    const svgEl = doc.querySelector("svg")
    if (!svgEl || doc.querySelector("parsererror")) return false
    container.innerHTML = ""
    container.appendChild(svgEl)
    return true
}

function loadWorldSvgShape(world) {
    const config = (shape => {
        if (!shape) return null
        if (typeof shape === "string") return { svgPath: shape }
        if (typeof shape === "object" && shape.svgPath) return shape
        return null
    })(world && world.svgPath)
    if (!config) return Promise.resolve()

    const reveal = () => {
        if (config.x !== undefined) pathoffset.transform.x = config.x
        if (config.y !== undefined) pathoffset.transform.y = config.y
        if (config.theta !== undefined) pathoffset.theta = config.theta
        if (config.scale !== undefined) pathScale = config.scale
        if (config.density !== undefined) pathdensity = config.density
        if (config.anchor !== undefined) pathAnchor = config.anchor

        importedSvgName = (path => {
            if (isInlineSvgMarkup(path)) return "Generator SVG"
            const parts = String(path).split("/")
            return parts[parts.length - 1] || String(path)
        })(config.svgPath)

        const label = document.getElementById("svg-import-label")
        if (label) label.textContent = importedSvgName
        const clearBtn = document.getElementById("svg-clear-btn")
        if (clearBtn) clearBtn.style.display = "inline-flex"
        const section = document.getElementById("shape-section")
        if (section) section.classList.add("visible")
        if (typeof syncShapeSliders === "function") syncShapeSliders()
    }

    const fail = reason => {
        if (typeof showError === "function")
            showError("Couldn't load this world's SVG shape: " + reason)
        else console.warn("Couldn't load world SVG shape:", reason)
    }

    try {
        if (isInlineSvgMarkup(config.svgPath)) {
            if (applySvgMarkup(config.svgPath)) reveal()
            else fail("the SVG markup couldn't be parsed")
            return Promise.resolve()
        }

        return fetch(config.svgPath)
            .then(res => res.text())
            .then(text => {
                if (applySvgMarkup(text)) reveal()
                else fail("the fetched file wasn't valid SVG")
            })
            .catch(err =>
                fail(
                    err && err.message
                        ? err.message
                        : "the file couldn't be fetched",
                ),
            )
    } catch (err) {
        fail(err && err.message ? err.message : String(err))
        return Promise.resolve()
    }
}
```

---

## experimented with walls

as soon as i added the walls feature i tried out new experiments with walls, mainly with a slow moving collection of particles coming from the left, pushed into a funnel or a pipe or a airfoil (handdrawn for now), and i was extremely delighted to see atleast the qualitative effects of pressure, velocity, continuity and hints of bernoulli's principle causing particles to speed up in a nozzle whilst building up pressure inside.
probably the most beautiful things ive seen all month.

[Video](https://github.com/user-attachments/assets/43278030-5137-4858-a434-29e8b721aebf)  
[Video](https://github.com/user-attachments/assets/f6fe124c-3aba-484a-8307-24bc7ac09971)  
[Video](https://github.com/user-attachments/assets/418264e1-aee0-4cbc-b664-0b46717826c3)  
![Image](https://github.com/user-attachments/assets/138e009c-07d8-4a34-b8dd-48193a85a7b2)  
![Image](https://github.com/user-attachments/assets/33754312-bd4d-42ea-b113-94e2e83e45cd)  
![Image](https://github.com/user-attachments/assets/c2f88aa8-71bd-4cd3-b4d0-34e519b7ebdf)  
![Image](https://github.com/user-attachments/assets/78e40ea7-ce79-4830-a703-03e8a2c1312b)  
![Image](https://github.com/user-attachments/assets/3c4749c5-ca07-4400-9b6c-8ec3fdf79509)  
![Image](https://github.com/user-attachments/assets/af666b25-d7e1-404e-aba1-c68793dc8db7)  
![Image](https://github.com/user-attachments/assets/0c2dca7f-c6fb-454d-bfb3-abb35f28be65)  
![Image](https://github.com/user-attachments/assets/e2e28635-6517-4e66-a6b1-80798ab93f93)  
![Image](https://github.com/user-attachments/assets/cb7db0a6-0a9b-4556-9305-0088bcd6d2ee)

---

## adding anchors to walls and reduced tunneling

the only things left to do with the walls is resolving the tunnels at intersections and endpoints.
an easy fix, i thought was to add particles with infinite mass on each end and at each intersection, behaving like rigid anchors.
for the endpoints, i pushed two new particles in the constructor of walls, with the rigidity flag i had defined earlier but unused to true.
the particle-particle collision already took care of inf masses and finite mass collisions, because of harmonic mean calculations, without resulting in NaN, except when 2 rigid particles collide, it blows upto NaN, which is why the walls started dissapearing when i drew endpoints too close. so what i did was skip the collision code for when both particles are rigid (have their particle.rigid == true), skip wall collision when particle is rigid, and yet when i drew walls end close it blew up to NaN.
i tried checking the code, and isolate any regions where Nan could slip, used try catch blocks, and modified operations to handle division by zero, but yet still, the energy and momentum blowed to nan as soon as the wall was drawn. it was 3 am, and i set up 4-5 ai agents at max compute to figure out why this is happening, and gloriously they performed tests, checked every line, and suggested very different architectures and new algorithms, most fixes adding over a 100 lines. i just branched the code and tried each of the agents' solutions, none of them worked. next morning i noticed, i had never declared the anchor particles' rigid = true, just used it to set mass to infinity, so all the rigidity tests i put in were never evaluated.
i just added that one line and ofcourse, everything started playing out just fine, with the momentum and mass conserved without blowing up.
thats LLMs for you.

so after the endpoints had been populated with anchors with side defined in the global scope, i removed the redundant conditionals for Nan, and i tried to see if there is a simple solution to get intersections from the orientation operations, and luckily there was, quite easily, by using the parameters and a weighted ratio of delta of a wall weighted with the orientations of the other wall. i used a parameter coordinate because the wall collision algo needed a boolean.

```js
intersect: (A1, A2, B1, B2, coordinate = false) => {
    const o1 = (A2.y - A1.y) * (B1.x - A2.x) - (A2.x - A1.x) * (B1.y - A2.y)
    const o2 = (A2.y - A1.y) * (B2.x - A2.x) - (A2.x - A1.x) * (B2.y - A2.y)
    const o3 = (B2.y - B1.y) * (A1.x - B2.x) - (B2.x - B1.x) * (A1.y - B2.y)
    const o4 = (B2.y - B1.y) * (A2.x - B2.x) - (B2.x - B1.x) * (A2.y - B2.y)

    const crosses = o1 * o2 < 0 && o3 * o4 < 0
    if (!coordinate) return crosses
    const weight = o1 / (o1 - o2)
    return new Vector(
        B1.x + weight * (B2.x - B1.x),
        B1.y + weight * (B2.y - B1.y),
    )
}
```

but i noticed this drew intersections of the infinite lines define by the segment endpoints and placed a point there, so i tried to clamp the parameters so they they stay within bounds, and realized the silly thing i did, all i have to do is just add `if (!crosses) return null` after returning crosses. which already checks if its within the segment or not.
i placed the anchors at each intersection and calcated them at start, and each draw of a wall.
i noticed that once i added this intersection code, the code became extremely slow as i added more walls, and it was because i added checking for intersection on each interaction of the canvas. so i removed it from that loop, and instead made it into a parametric function that takes in a new wall, and only computes the intersecton of that wall with the previous walls, instead of every wall against every other wall each time.

```js
function populateIntersections(newWall) {
    if (newWall) {
        for (const other of walls) {
            if (other === newWall) continue
            const intersection = ops.intersect(
                newWall.start,
                newWall.end,
                other.start,
                other.end,
                true,
            )
            if (!intersection) continue
            particles.push(
                new Particle(3, intersection, new Vector(0, 0), 1, true),
            )
            particles[particles.length - 1].display()
        }
        return
    }

    // rebuild all intersections only on setup/restart
    for (let i = 0; i < walls.length; i++) {
        for (let j = i + 1; j < walls.length; j++) {
            const intersection = ops.intersect(
                walls[i].start,
                walls[i].end,
                walls[j].start,
                walls[j].end,
                true,
            )
            if (!intersection) continue
            particles.push(
                new Particle(3, intersection, new Vector(0, 0), 1, true),
            )
            particles[particles.length - 1].display()
        }
    }
}
```

in the later versions i removed the 3 to be a global anchor size, so i can adjust it at once. because a large size might alter the behavior of a smooth wall altogether, but a smaller size will let fast particles tunnel through.

for the rare tunneling of particles through the walls, i noticed that in wall collisions i already move the particle, but forgot to skip the turn to move() in triangulate(). so i tried a clean solution of using a condition to see if the particle's lastcontact is an instanceof Wall, which clearly failed because it wouldnt skip for just 1 turn. so i turned to the more messy way of having a skipstep flag and setting it true and false between walls and triangulate. certainly, this reduced a lot of tunneling.
continuing on #135 and #140, i tried to implement using lastpos, but then i realized i again had to change the order, because lastpos would be the position on the previous try, not in the future, and that would mean correcting AFTER the particle has tunneled through. though i did notice all tunneling had stopped, the particles started teleporting to a place, which i think had to do with the placing of normal, and the order of operations in triangulate.
i rolled back, for i should work on the svg wall segmentation, than spend time on an almost solved problem. i can optimize this later, and I don't think the little tunneling will cause problems in airfoil tests or other experiments.

---

## deciding to stick with sequential solver but with a modified algorithm

switching the wall algorithm to the simultaneous solver in #133 seems harder to implement than previously thought, perhaps might bring more problems than it solves.
for particle-particle collisions, it creates a more jumpy jittery motion in crowded regions, which i think is because of accumulation of dp caused by backoffs and applying them all at once.

even for the wall-particle collisions, it performed worse than the updated sequential solver with the orientation implementation and clamps. more particles tunneled through, with more jittery motion.

the way to fix it would be to introduce sub stepping and damping the back off over few iterations, but thats quite a lot of architecture change and is ought to bring more and chances are it'll perform worse than the sequential engine.

there can be a way to fix the little tunneling in the sequential solver, which only happens at very high density regions with fast particles, which thus i believe is because the solver uses position + velocity as the ghost, which does not account for the large backoff generated by the dense region. so instead, we store the last position of the particle, and thus compute the ghost, irrespective of velocity.

---

## intersection of lines for collision detection

i realized i had overlooked initially how I would handle line segment collisions, i just computed the projections and checked if they were outside bounds. but clearly, that does not work, because a particle and its ghosts' projection can be both beyond bounds, but still might have passed a wall. the only way to know for sure, is by checking if there is an intersection of the wall vector and the vector drawn from a particle to its ghost.

I thought about how i could do it, and one of the ideas i got was shooting two rays from particle to end points of the wall, and checking if the ghost ends up in the region present within these two rays. I could have done it with taking projections of the ghost on these two rays, and they must be if different sign, else ghost would be outside the region. (assuming particle is moving towards wall.)

however upon a little research I realized there way a much simpler approach, using the orientation of each triplet of the 4 points of the segments.

Two line segments AB and CD intersect if and only if the endpoints of each segment lie on opposite sides of the line containing the other segment.

Reasoning: If points C and D lie on opposite sides of the infinite line AB, the line AB must pass through the segment CD. To guarantee the intersection happens within the actual boundaries of both segments, the line CD must also pass through the segment AB. We track whether a point is on the "left" or "right" side of a directed line by calculating the orientation (turn direction) of the point triplets.

To find the orientation of three sequential points—P1, P2, and P3—we compare the slope of the first segment (P1P2) to the slope of the second segment (P2P3).

Step 1: Set up the slope comparison.

The slope of the line segment from P1 to P2 is:

`Slope1 = (y2 - y1) / (x2 - x1)`

The slope of the line segment from P2 to P3 is:

`Slope2 = (y3 - y2) / (x3 - x2)`

If Slope1 < Slope2, the path turns left (counter-clockwise).
If Slope1 > Slope2, the path turns right (clockwise).
If Slope1 = Slope2, the path is a straight line (collinear).

Using cross-multiplication:

`(y2 - y1)(x3 - x2) > (y3 - y2)(x2 - x1)`

Step 3: Define the final orientation expression. Move all terms to the left side of the inequality to create a single evaluation function:

`Orientation(P1, P2, P3) = (y2 - y1)(x3 - x2) - (x2 - x1)(y3 - y2)`

Step 4: Map the mathematical sign to geometry.

- `Orientation > 0`: Clockwise turn (Point 3 is on the right side of line P1P2).
- `Orientation < 0`: Counter-clockwise turn (Point 3 is on the left side of line P1P2).
- `Orientation = 0`: Collinear.

By calculating this function for triplets (A,B,C), (A,B,D), (C,D,A), and (C,D,B), we can show if the segments cross.

this also makes sure there is a collision, eliminating the need for checking with the cross product, but we can't reduce code computation because we need those arguments for computing velocity and position

---

## fixed tunnelling of walls in fluid engine

so one of the issues with the earlier model (#87) was that the normal was drawn from the particle's center, and thus there was a discrepancy in collision handling. this issue wasn't there in the cross product algorithm because it already accounted for the radius.

to solve this issue,i scaled the normal's length to the radius, added it to the particle's position, and this new vector i call the 'apex' point, which is the first particle that touches the wall.

so i run the same collision algorithm on this apex point, and it should've worked but it hardly made a difference.

theres almost certainly a bug.

I sat down and derived the whole thing in physics and code on paper, now whats left to do implement it,

![Handwritten derivation](https://github.com/user-attachments/assets/2bbb73e8-96ff-468d-9971-4245d2d8f85f)

![image.png](https://cdn.jsdelivr.net/gh/voidconsole/assets/2026/08/21/1351787256923334.png)

---




**voidconsole · August 20, 2026**

Today I tested this algorithm, and physics never fails me

```js
let P = ops.difference(particle.position, this.start) // wall frame
let n = ops.difference(ops.project(P, this.wall), P)
let G = ops.sum(P, particle.velocity)
let Pa = ops.sum(P, ops.scale(ops.unit(n), particle.radius)) // apex point
let Ga = ops.sum(G, ops.scale(ops.unit(n), particle.radius))
if (ops.cross(Ga, this.wall) * ops.cross(Pa, this.wall) <= 0) {
    let gnA = ops.difference(ops.project(Ga, this.wall), Ga)
    let GTFPs = ops.sum(G, ops.scale(gnA, 2)) // wall frame
    let TrueGhostFuturePosition = ops.sum(this.start, GTFPs) // world frame
    let FutureVelocity = ops.sum(
        particle.velocity,
        ops.scale(ops.project(particle.velocity, n), -2),
    ) // reflect v
    particle.position = TrueGhostFuturePosition // world frame
    particle.velocity = FutureVelocity // reflect v
    particle.lastcontact = this
}
```

it worked perfectly.
i probably need to change the variable names.

![Image](https://github.com/user-attachments/assets/aedf9357-e528-4768-b90b-bd630f408d6a)

https://github.com/user-attachments/assets/a7d787a6-040c-496c-a9ab-b3ae7e78fb47

No problems reflecting a particle with 400 px/60s velocity.

however a few minor logical bugs were there,
as in i calculated the normal for the position from the initial position, and not the ghost apex.

https://github.com/user-attachments/assets/f10fa7b6-06bc-4dbf-8b57-066f03218332

another problem that arose was that the particle kept oscillating a wall like in #87 which should not happen at all, because the particle must never cross the wall. It was a silly bug, i found it before i thought i using the last contact way to explicitly prevent it. the positon.add(N) and position = sum(position, N) are not the same and thus the bug

the particle and its apex and their ghost counterparts:

![Image](https://github.com/user-attachments/assets/fb199db9-61b4-464c-9e65-bb163f136199)

![Image](https://github.com/user-attachments/assets/c76a30e6-2098-4e32-b553-92971695eb11)

**voidconsole · August 20, 2026**

an issue with this was that it did not account for multiparticle systems, when it gets crowded, particles push against the wall, and when the backoff of the particles move the walls across the boundary, it does not trigger a collision, because of order of resolution. this could be solved by using the method in #133 but I solved it using the radius distance based collisions as with the old algorithm

```js
let P = ops.difference(particle.position, this.start)
let normal = ops.difference(ops.project(P, this.wall), P)
if (ops.magnitude(normal) < particle.radius) {
    const correction = ops.scale(
        ops.unit(normal),
        ops.magnitude(normal) - particle.radius,
    )
    particle.position.add(correction)
    const delta = ops.dot(particle.velocity, ops.unit(normal))
    if (delta > 0) {
        particle.velocity.sub(ops.scale(ops.unit(normal), 2 * delta))
    }
    particle.lastcontact = this
    return
}
```

another problem currently it does not work very well for intersections of walls, for fast moving particles, which again could be solved using #133.
also I did not cap the collisions to line segments yet.

**voidconsole · August 25, 2026**

I finally fixed it, with the math in #136 and used

```js
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
    const crosses = (o1 * o2 < 0) && (o3 * o4 < 0)
    return crosses // does not handle collinear cases and bounds overlap
}
```

and only clamp for the projection calculations for the physical contact, and no clamp for the ghost intersection.
the intersection is also after the collision check, and even tough it only computes the center of the particle instead of the apex, to save compute and only minute edge cases, when particle grazing tip of wall. this can be solved by placing particles at ends and intersections.

there is still a little tunnelling at extremely crowded fast regions, which i think is cause of the order and cannot be solved with this algorithm, which i think is now pushed to its limits.

now any improvements can only made by switching to the simultaneous solver.

**voidconsole · August 25, 2026**

containment at last

https://github.com/user-attachments/assets/ef13a3d4-ac0e-49b9-b73a-30098aad78a2

**voidconsole · August 27, 2026**

there was still the problem of tunneling through intersections and endpoints, so i solved it in #141

---

## to change collision architecture into non destructive accumulation

while i was implementing my derivation for wall collisions, and had a little trouble implementing the timing of when to resolve collisions, because the particle collider handles position first and then the constraint collider which predicts a future collision, so i thought of a new approach: instead of updating velocities and positions directly in colliders, i store a dv and dp of each particle and in each iteration add that to the velocity and position directly in the move()

```js
this.position.add(this.dp)
this.velocity.add(this.dv)
this.dp = new Vector(0, 0)
this.dv = new Vector(0, 0)
this.position.add(this.velocity)
```

and replace all instances of v and p modifications with dv and dp.
however there were many modifications to be done and to account for and caused it to become messy. i spent a few hours trying to solve energy explosion due to walls, and integral step correction in particle handler. then it started behaving weirdly.
i thought i would deal with this second problem later, it is drawing too much time for an architecture change, and can be done with it later.
although i do like this simultaneous solver, instead of a sequential solver, but it keeps reporting bugs. it also reminded me once again how extremely important the order of operations are.

---

## Inverted Projection Check Causes Particle Cohesivity in Fluid Sim

Date: 2026-05-04

found a very weird behaviour in my fluid sim, i just inverted the sign for

```jsx
if (projection <= 0) return // only bounce if moving toward each other
```

to ≥ which caused the particles to stick togeather, almost like exhibiting cohesivity.

[Drive attachment](https://drive.google.com/file/d/1qA4NFThcy6BmDLW9uo4Fip0ZdCQ7dFVE/view?usp=sharing)

---

## Tried to fix tunnelling in fluid engine with prediction computation

Date: 24-07-2026

After switching to cross products, I added backoff to the walls like I did with particles, hoping it would solve the tunneling issue.
Certainly, it solved the trespassing of slow moving particles, and incredibly use for Crystal lattice as now one could draw walls and constrain the particles within that structure, and watch them rearrange to best fill the space.

```js
bounce(particle) {
    let proximity = ops.difference(particle.position, this.start);
    let wallLength = ops.magnitude(this.direction);
    if (wallLength === 0) return;
    let shadow = ops.dot(this.direction, proximity) / wallLength;
    if (shadow > wallLength || shadow < 0) return;
    let perpendicular = ops.cross(this.direction, proximity) / wallLength;

    if (Math.abs(perpendicular) <= particle.radius) {
        let sign = perpendicular >= 0 ? 1 : -1;
        let normal = ops.unit(new Vector(-this.direction.y * sign, this.direction.x * sign));
        let overlap = particle.radius - Math.abs(perpendicular);
        let backoff = ops.scale(normal, overlap);
        particle.position.add(backoff);
        let projection = ops.dot(particle.velocity, normal);
        if (projection < 0) {
            let delta = ops.scale(normal, 2 * projection);
            particle.velocity.sub(delta);
        }
    }
}
```

However, it did not fix the tunneling for fast moving particles, even though it reduced it.
The problem was the time step, if a particle crosses a wall in a single frame, there is no way it can know.
when the frame rate is low and the particle speed is high, the collision never detects it. this is not much of a problem between particle-particle collisions, but between a wall its much more intense and many particles phase through.

So I thought of a new approach, inspired from geometric optics, to have a "ghost" particle that's located at current position + velocity, and compute the normal to that particle and real particle, and if they are opposite in sign, it means the ghost has trespassed the wall. from there, we use reflection principles and move the particle to the ghost's position, and subtracting twice the normal to the particle to make it reflected across the wall, and modifying the velocity same as before, by subtracting twice the velocity in direction of normal.

This should've worked, and though it make fast moving particles to bounce, and thus reduced collision, some still tunneled, especially if its a crowded region and it seems the particle particle collisions seem to interfere with my wall collision algorithm. and now the crystal lattice particles just fall through the wall like nothing.

for the second problem, I just tried to put up a hardcoded cut-off velocity above which it uses the new algorithm and and below uses the old algorithm with the back off, but sadly it did not solve tunneling and hard-coding velocity is just terrible code.

for the particle-particle problem i think the problem was cause of the order, the P-P collisions were resolved before the walls in my triangulate function and and also displayed, and so i moved the display to its own nested loop worsening performance. but this did not solve the issue and I moved the wall collision before the particles one and sure it didnt work, because I did not change the ghost to a "future particle" instead of a "past particle" so resolve. ideally it shouldn't have mattered, but in this hot loop it matters. so i set that up by having a 'phantom' particle which stores the position of the particle in the previous frame.

At one point, I even tried calculating both the past and future particle to avoid the order mess altogether, and only then i came back to my senses about my variable names, which perhaps were enough now to make a ghostbusters novel.

```js
if (particle.lastcontact == this) return
let phantom = ops.difference(particle.position, particle.velocity)
let ghost = ops.sum(particle.position, particle.velocity)
let proximity = ops.difference(particle.position, this.start)
let phantomProximity = ops.difference(phantom, this.start)
let ghostProximity = ops.difference(ghost, this.start)
if (this.length === 0) return
let shadow = ops.dot(this.direction, proximity)
let phantomShadow = ops.dot(this.direction, phantomProximity)
let ghostShadow = ops.dot(this.direction, ghostProximity)
```

unfortunately the ghostbusters could not kill the bug. Tunnelling just doesn't seem to care. Although I should mention, this approach did reduce the tunnelling, atleast visually, but nonetheless nowhere close to perfect.

another problem arose: when hit at a low angle, it seems to oscillate back and forth of the wall, because the after a bounce, subtracting velocity from current meant the ghost was behind a wall it just bounced against, and thus thought it has trespassed.
i resolved this with a patchy fix that i track the object that last collided with any given ball, be it wall or a particle, and checks if its the same wall colliding again it doesn't let it.

clearly i need a much better algorithm.

i tried seeking help from the best ai models free and they had interesting approaches mainly, time proportioning, which is something i didnt want to do because sub-stepping is very messy, and prone to more errors. however i branched the code and let the agents do what they felt best, and none of them solved tunneling and in some cases made it worse. unsurprising, I had expected the same.

so the resolution lies in my hands, and i shall derive this soon enough from pure physics and thus finally touch paper.

---

## Wall Collisions via 2D Cross Product Instead of Projection

Date: 2026-07-01

fluid engine: just realized that there is a “2D” cross product which is essentially the magnitude of the cross of two vectors, and instead of using the projection and triangle inequality for a wall collision, i simply see if the magnitude of this cross is less than or equal to the radius of the particle i.e if the thing is touching it or not. this also simplifies the problem of determining which side of the wall a normal is drawn to.

```js
dot: (A, B) => {
    return A.x * B.x + A.y * B.y
},
cross: (A, B) => {
    return A.x * B.y - A.y * B.x
},
magnitude: (A) => {
    return (A.x ** 2 + A.y ** 2) ** (1 / 2)
},
```

```js
if (wallLength === 0) return;
let shadow = ops.dot(this.direction, proximity) / wallLength;
if (shadow > wallLength || shadow < 0) return; // check if particle is within the line segment bounds
let perpendicular = ops.cross(this.direction, proximity) / wallLength; // distance to particle

if (Math.abs(perpendicular) <= particle.radius) {
    let sign = perpendicular >= 0 ? 1 : -1;
```

![image.png](https://cdn.jsdelivr.net/gh/voidconsole/assets/2026/legacy/image.png)

11:32 AM 1 July 2026

---

## Implementing Rigid Wall Collisions in Fluid Sim via Projections

Date: 2026-06-29

fluid engine: was trying to implement walls in my fluid sim, so my first thought was to create a wall (line) defined by a start and end vector, and compute the relative position of the end and a particle from the start.

then, find the projection of the particles position on the line, and the collision condition would be if its positive, and less than length of the line [so that its on the line] and the projection is equal to the length of the relative position of the particle. since particle’s size is non zero, we account for its radius and change the last condition to being true when the projection is equal to the length of the leg X, of the right triangle formed by X, the radius r and the distance to the particle. since the engine isnt continuous in time stamps, we change the equality to the projection being equal or greater than X, since the collision checks is run at a finite fps, quite small in this case, 30fps.

![Wall collision diagram](https://github.com/user-attachments/assets/2cffab6e-fe83-483d-83c3-be9e1b4da39d)

for the collision, i compute the normal to the particle, and subtract twice the velocity of the particle in this normal direction from the particle, causing a bounce, since this a wall is rigid.

![image.png](https://cdn.jsdelivr.net/gh/voidconsole/assets/2026/legacy/image%201.png)

surprisingly, this idea works perfectly, on the first try itself.

```jsx
bounce(particle){
    let proximity = ops.difference(particle.position, this.start)
    let projection = ops.dot(this.direction, proximity) / ops.magnitude(this.direction)
    if (projection > 0 && projection < ops.magnitude(this.direction) &&
        projection >= (ops.magnitude(proximity) ** 2 - (particle.size / 2) ** 2) ** (1 / 2)) {
        let normal = projection > 0
            ? ops.unit(new Vector(-this.direction.y, this.direction.x))
            : ops.unit(new Vector(this.direction.y, -this.direction.x))
        let overlap = (ops.magnitude(proximity) ** 2 - (particle.size / 2) ** 2) ** (1 / 2) - projection
        let backoff = ops.scale(normal, overlap)
        particle.position.sub(backoff)
        let delta = ops.scale(normal, 2 * ops.dot(particle.velocity, normal)) // 2x cause rigid body
        particle.velocity.sub(delta)
    }
}
```

for the fps reason though, i need to add backoffs, to avoid overlapping and cant help particles moving too fast as they will trespass the wall this way.

_🌌 Systems/Fluid Engine · Mon, Jun 29, 11:20 PM_

---

## Rendering Particle Velocity Vectors in Fluid Sim

Date: 2026-06-16

added a trail parameter to particle generator to show velocity vectors

now trails can be added and customized in the world generator class. essentially this came to me when I was testing walls and i set endpoints to particles and i thought why not make them show velocity vectors.

then i added a trail length property in particle class which computes a line by subtracting velocity twice from current position to get a backward trail.

now this trail length property is an adjustable parameter in the world generator, exposed to the user.

![image.png](https://cdn.jsdelivr.net/gh/voidconsole/assets/2026/legacy/image%208.png)

also, while experimenting accidentally created mesmerizing 'modern art'.

![image.png](https://cdn.jsdelivr.net/gh/voidconsole/assets/2026/legacy/image%205.png)

![image.png](https://cdn.jsdelivr.net/gh/voidconsole/assets/2026/legacy/image%206.png)

![image.png](https://cdn.jsdelivr.net/gh/voidconsole/assets/2026/legacy/image%207.png)


**voidconsole · August 11, 2026**

https://github.com/user-attachments/assets/a251674b-4b69-4b40-b668-907295a77a23

---

## Hexagonal Lattice Formation and Vacancy Defects in Fluid Sim

Date: 2026-06-15

i just realized i could also simulate microscopic crystalline structures using my fluid sim.

i just generate a 1000 particles at the same place and i can see how the particles fill the screen and slowly rearrange to form lattices to maximize space. and like regular matter, i can also see how they form lattice regions which have discontinuities in them. I can also the rapid wiggling of the particles while staying roughly in place. I can see they almost always pack to form hexagons.

i even saw a “hole” as in there exists a hole which the particles didnt fill but the rest of the particles surround that hole completely like they would surround if a particle was there, like a vacancy defect.

i could also see shockwaves travelling through the entire screen.

![image.png](https://cdn.jsdelivr.net/gh/voidconsole/assets/2026/legacy/image%209.png)

![image.png](https://cdn.jsdelivr.net/gh/voidconsole/assets/2026/legacy/image%2010.png)

sometimes if kept long enough, most would eventually form the same large lattice. but in some cases separate domains would remain.

![image.png](https://cdn.jsdelivr.net/gh/voidconsole/assets/2026/legacy/image%2011.png)

heres an example of it stabilizing over time

![image.png](https://cdn.jsdelivr.net/gh/voidconsole/assets/2026/legacy/image%2012.png)

![image.png](https://cdn.jsdelivr.net/gh/voidconsole/assets/2026/legacy/image%2013.png)

---

## Deriving Mass-Weighted Particle Collisions via Harmonic Mean

Date: 2026-06-14

---

i was trying to add mass constraints to my particle fluid simulator, which had initially assumed equal masses for all particles were identical. that was very fun to play with. but now i felt it needed more capabilities. i wanted to add custom SVGs to the site and let the particles collide with that svg’s contours.
the first step to that was defining a rigid body. which is essentially a particle(s) with infinite mass.

so next i had to account for masses in my sim.

should be easy, but im gonna follow my classic creed for physics sims, to not use google or any textbooks or any formulas to compute the solution, but derive it from the code and raw physics laws through emergence and intuition.

so i started with defining a particle property called mass, and i first thought to define momentum and replace all instances of velocity with momentum. but yeah obviously then momentum wont be conserved.

clearly all change was to be done in these lines of code

```jsx
let relative = new Vector(
    this.velocity.x - other.velocity.x,
    this.velocity.y - other.velocity.y,
)
let influence = relative.x * normal.x + relative.y * normal.y
let delta = new Vector(influence * normal.x, influence * normal.y)
this.velocity.sub(delta)
other.velocity.add(delta)
```

actually just delta, here im distributing velocities equally. so for mass, delta just has to be weighted by the mass (no pun intended). its easy to think that velocity is inversely proportional to mass.
so i use my previously built scale property

```jsx
let delta = new Vector(projection * normal.x, projection * normal.y)
this.velocity.sub(delta.scale(k / this.mass))
other.velocity.add(delta.scale(k / other.mass))
```

now all i have to do is find k. its obviously not 1, because that will not conserve momentum.

clearly, delta has dimensions of velocity and to add to velocity the scaled delta must also be of velocity dimension, by homogeneity. thus k/m must be dimensionless and thus k must have the dimension of mass.

ofc, k must not change for either of the particles, so it has to depend symmetrically on both the masses. perhaps k could be the sum of both masses?

let the first mass be A and second B.

we know the boundary condition if A = B = m then k/A = k/B must be 1.

so K = m so K cannot be sum of both.

but this tells us K must be one of the means.

so now AM, GM or HM?

we know another boundary condition, if one of the mass is infinite (very large for approx), then it should act like a wall and the other mass must bounce back with the same velocity.

so if A = m, B = inf,

then k/A must be 2 and k/B must be 0

so k = 2m from the former.

testing limiting cases of each of the means,

AM = (m + inf)/2, def not 2m, and diverges to inf

GM = sqrt(m \* inf) again shoots to inf

HM = 2/(1/inf + 1/m) yesss this is 2m.

so we found k to be the hm of the 2 masses.

I tried all three means as values of k, and for AM and GM in a sim with many light particles and a single massive particle. a few moments after the start all particles starting rapidly shooting everywhere. except for GM, where it remained stable.

```jsx
let harmonic = 2 / (1 / this.mass + 1 / other.mass) // Not using reduced form because inf mass results in NaN
this.velocity.sub(delta.scale(harmonic / this.mass))
other.velocity.add(delta.scale(harmonic / other.mass))
```

for a quick sanity check, i wrote a quick total energy and momentum counter, yessss it remained conserved. although, initally momentum wasnt conserved and before i could panic i realized this was because of the walls. so i disabled walls and it works.

![image.png](https://cdn.jsdelivr.net/gh/voidconsole/assets/2026/legacy/image%2014.png)

I also changed the code to now allow changing mass as a property in the editable code section of the menu.

![image.png](https://cdn.jsdelivr.net/gh/voidconsole/assets/2026/legacy/image%2015.png)

Future Updates:-

- Allow creation of custom walls
- Plotting points on an Imported SVGs path and making them rigid to make a true fluid sim
- Adding tunable properties like cohesiveness and following bernoulli's principles, to mimic SPH (Smoothened particle hydrodynamics)

5:56PM, 14 June 2026




**voidconsole · November 10, 2026**

colliding 2 particles with infinite mass produces NaN
