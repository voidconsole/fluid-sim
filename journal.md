svg path rendering in fluid engine
Aug 30, 2026, 8:26 PM


so since the walls were done, what i sought to do is create use an svg path, get path length, get points on that path, and draw walls on each point of that path, separated by a specified pathdensity variable, offset to whatever position required.

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
			walls.push(
				new Wall(points[i], points[i + 1])
			);
		}
		walls.push(new Wall(points[points.length - 1], points[0]))
	}
this creates particles evenly, what would be ideal is having more particles at the curvatures. adaptive sampling would be the next step.

on simpler note though i tried to just reduce the walls if they have the same slope.

			const ultimate = points[points.length - 1]
			if (ultimate) {
				const slopeu = (p.y - ultimate.y) / (p.x - ultimate.x)
				const penultimate = points[points.length - 2]
				if (penultimate) {
					const slopep = (ultimate.y - penultimate.y) / (ultimate.x - penultimate.x)
					if (slopeu === slopep){ points.pop()}
				}
			}



<img width="590" height="482" alt="Image" src="https://github.com/user-attachments/assets/4f5c7510-be55-484d-9dda-890304dcd6aa" />


Thu, Aug 27, 03:56 PM

experimented with walls
Aug 30, 2026, 7:55 PM



as soon as i added the walls feature i tried out new experiments with walls, mainly with a slow moving collection of particles coming from the left, pushed into a funnel or a pipe or a airfoil (handdrawn for now), and i was extremely delighted to see atleast the qualitative effects of pressure, velocity, continuity and hints of bernoulli's principle causing particles to speed up in a nozzle whilst building up pressure inside. probably the most beautiful things ive seen all month.

https://github.com/user-attachments/assets/43278030-5137-4858-a434-29e8b721aebf https://github.com/user-attachments/assets/f6fe124c-3aba-484a-8307-24bc7ac09971 https://github.com/user-attachments/assets/418264e1-aee0-4cbc-b664-0b46717826c3 <img width="1251" height="782" alt="Image" src="https://github.com/user-attachments/assets/138e009c-07d8-4a34-b8dd-48193a85a7b2" /> <img width="1483" height="912" alt="Image" src="https://github.com/user-attachments/assets/33754312-bc4d-42ea-b113-94e2e83e45cd" /> <img width="1170" height="903" alt="Image" src="https://github.com/user-attachments/assets/c2f88aa8-71bd-4cd3-b4d0-34e519b7ebdf" /> <img width="1600" height="801" alt="Image" src="https://github.com/user-attachments/assets/78e40ea7-ce79-4830-a703-03e8a2c1312b" /> <img width="1395" height="785" alt="Image" src="https://github.com/user-attachments/assets/3c4749c5-ca07-4400-9b6c-8ec3fdf79509" /> <img width="1093" height="832" alt="Image" src="https://github.com/user-attachments/assets/af666b25-d7e1-404e-aba1-c68793dc8db7" /> <img width="1350" height="859" alt="Image" src="https://github.com/user-attachments/assets/0c2dca7f-c6fb-454d-bfb3-abb35f28be65" /> <img width="1480" height="892" alt="Image" src="https://github.com/user-attachments/assets/e2e28635-6517-4e66-a6b1-80798ab93f93" /> <img width="1373" height="864" alt="Image" src="https://github.com/user-attachments/assets/cb7db0a6-0a9b-4556-9305-0088bcd6d2ee" />

Thu, Aug 27, 03:50 PM

adding anchors to walls and reduced tunneling #141
Aug 30, 2026, 5:33 PM



the only things left to do with the walls is resolving the tunnels at intersections and endpoints. an easy fix, i thought was to add particles with infinite mass on each end and at each intersection, behaving like rigid anchors. for the endpoints, i pushed two new particles in the constructor of walls, with the rigidity flag i had defined earlier but unused to true. the particle-particle collision already took care of inf masses and finite mass collisions, because of harmonic mean calculations, without resulting in NaN, except when 2 rigid particles collide, it blows upto NaN, which is why the walls started dissapearing when i drew endpoints too close. so what i did was skip the collision code for when both particles are rigid (have their particle.rigid == true), skip wall collision when particle is rigid, and yet when i drew walls end close it blew up to NaN. i tried checking the code, and isolate any regions where Nan could slip, used try catch blocks, and modified operations to handle division by zero, but yet still, the energy and momentum blowed to nan as soon as the wall was drawn. it was 3 am, and i set up 4-5 ai agents at max compute to figure out why this is happening, and gloriously they performed tests, checked every line, and suggested very different architectures and new algorithms, most fixes adding over a 100 lines. i just branched the code and tried each of the agents' solutions, none of them worked. next morning i noticed, i had never declared the anchor particles' rigid = true, just used it to set mass to infinity, so all the rigidity tests i put in were never evaluated. i just added that one line and ofcourse, everything started playing out just fine, with the momentum and mass conserved without blowing up.
thats LLMs for you.

so after the endpoints had been populated with anchors with side defined in the global scope, i removed the redundant conditionals for Nan, and i tried to see if there is a simple solution to get intersections from the orientation operations, and luckily there was, quite easily, by using the parameters and a weighted ratio of delta of a wall weighted with the orientations of the other wall. i used a parameter coordinate because the wall collision algo needed a boolean.

		const o1 = (A2.y - A1.y) * (B1.x - A2.x)
			- (A2.x - A1.x) * (B1.y - A2.y)

		const o2 = (A2.y - A1.y) * (B2.x - A2.x)
			- (A2.x - A1.x) * (B2.y - A2.y)

		const o3 = (B2.y - B1.y) * (A1.x - B2.x)
			- (B2.x - B1.x) * (A1.y - B2.y)

		const o4 = (B2.y - B1.y) * (A2.x - B2.x)
			- (B2.x - B1.x) * (A2.y - B2.y)

		const crosses = (o1 * o2 < 0) && (o3 * o4 < 0)
		if (!coordinate) return crosses
		const weight = o1 / (o1 - o2)
		return new Vector(
			B1.x + weight * (B2.x - B1.x),
			B1.y + weight * (B2.y - B1.y)
		)
	}
but i noticed this drew intersections of the infinite lines define by the segment endpoints and placed a point there, so i tried to clamp the parameters so they they stay within bounds, and realized the silly thing i did, all i have to do is just add if (!crosses) return null after returning crosses. which already checks if its within the segment or not. i placed the anchors at each intersection and calcated them at start, and each draw of a wall. i noticed that once i added this intersection code, the code became extremely slow as i added more walls, and it was because i added checking for intersection on each interaction of the canvas. so i removed it from that loop, and instead made it into a parametric function that takes in a new wall, and only computes the intersecton of that wall with the previous walls, instead of every wall against every other wall each time.

	if (newWall) {
		for (const other of walls) {
			if (other === newWall) continue
			const intersection = ops.intersect(newWall.start, newWall.end, other.start, other.end, true)
			if (!intersection) continue
			particles.push(new Particle(3, intersection, new Vector(0, 0), 1, true))
			particles[particles.length - 1].display()
		}
		return
	}
	// rebuild all intersections only on setup/restart
	for (let i = 0; i < walls.length; i++) {
		for (let j = i + 1; j < walls.length; j++) {
			const intersection = ops.intersect(walls[i].start, walls[i].end, walls[j].start, walls[j].end, true)
			if (!intersection) continue
			particles.push(new Particle(3, intersection, new Vector(0, 0), 1, true))
			particles[particles.length - 1].display()
		}
	}
}
in the later versions i removed the 3 to be a global anchor size, so i can adjust it at once. because a large size might alter the behavior of a smooth wall altogether, but a smaller size will let fast particles tunnel through.

for the rare tunneling of particles through the walls, i noticed that in wall collisions i already move the particle, but forgot to skip the turn to move() in triangulate(). so i tried a clean solution of using a condition to see if the particle's lastcontact is an instanceof Wall, which clearly failed because it wouldnt skip for just 1 turn. so i turned to the more messy way of having a skipstep flag and setting it true and false between walls and triangulate. certainly, this reduced a lot of tunneling. continuing on #135 and #140, i tried to implement using lastpos, but then i realized i again had to change the order, because lastpos would be the position on the previous try, not in the future, and that would mean correcting AFTER the particle has tunneled through. though i did notice all tunneling had stopped, the particles started teleporting to a place, which i think had to do with the placing of normal, and the order of operations in triangulate. i rolled back, for i should work on the svg wall segmentation, than spend time on an almost solved problem. i can optimize this later, and I don't think the little tunneling will cause problems in airfoil tests or other experiments.

Thu, Aug 27, 01:59 PM

deciding to stick with sequential solver but with a modified algorithm
Aug 30, 2026, 5:32 PM



switching the wall algorithm to the simultaneous solver in #133 seems harder to implement than previously thought, perhaps might bring more problems than it solves. for particle-particle collisions, it creates a more jumpy jittery motion in crowded regions, which i think is because of accumulation of dp caused by backoffs and applying them all at once.

even for the wall-particle collisions, it performed worse than the updated sequential solver with the orientation implementation and clamps. more particles tunneled through, with more jittery motion. the way to fix it would be to introduce sub stepping and damping the back off over few iterations, but thats quite a lot of architecture change and is ought to bring more and chances are it'll perform worse than the sequential engine.

there can be a way to fix the little tunneling in the sequential solver, which only happens at very high density regions with fast particles, which thus i believe is because the solver uses position + velocity as the ghost, which does not account for the large backoff generated by the dense region. so instead, we store the last position of the particle, and thus compute the ghost, irrespective of velocity.

Thu, Aug 27, 12:53 PM

solved bug using intersections of lines for collision detection #136
Aug 30, 2026, 5:28 PM



Aug 22 2026

I finally fixed it, with the math in #136 and used

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
			const crosses = (o1 * o2 < 0) && (o3 * o4 < 0) // unlike signs -> collision
			return crosses // does not handle collinear cases and bounds overlap
		}
	}
and only clamp for the projection calculations for the physical contact, and no clamp for the ghost intersection. the intersection is also after the collision check, and even tough it only computes the center of the particle instead of the apex, to save compute and only minute edge cases, when particle grazing tip of wall. this can be solved by placing particles at ends and intersections.

there is still a little tunnelling at extremely crowded fast regions, which i think is cause of the order and cannot be solved with this algorithm, which i think is now pushed to its limits.

now any improvements can only made by switching to the simultaneous solver.

containment at last

https://github.com/user-attachments/assets/ef13a3d4-ac0e-49b9-b73a-30098aad78a2

intersections of lines for collision detection
Aug 30, 2026, 5:11 PM



i realized i had overlooked initially how I would handle line segment collisions, i just computed the projections and checked if they were outside bounds. but clearly, that does not work, because a particle and its ghosts' projection can be both beyond bounds, but still might have passed a wall. the only way to know for sure, is by checking if there is an intersection of the wall vector and the vector drawn from a particle to its ghost. I thought about how i could do it, and one of the ideas i got was shooting two rays from particle to end points of the wall, and checking if the ghost ends up in the region present within these two rays. I could have done it with taking projections of the ghost on these two rays, and they must be if different sign, else ghost would be outside the region. (assuming particle is moving towards wall.) however upon a little research I realized there way a much simpler approach, using the orientation of each triplet of the 4 points of the segments.

Two line segments $AB$ and $CD$ intersect if and only if the endpoints of each segment lie on opposite sides of the line containing the other segment.Reasoning:If points $C$ and $D$ lie on opposite sides of the infinite line $\overleftrightarrow{AB}$, the line $\overleftrightarrow{AB}$ must pass through the segment $CD$.To guarantee the intersection happens within the actual boundaries of both segments, the line $\overleftrightarrow{CD}$ must also pass through the segment $AB$.We track whether a point is on the "left" or "right" side of a directed line by calculating the orientation (turn direction) of the point triplets.

To find the orientation of three sequential points—$P_1(x_1, y_1)$, $P_2(x_2, y_2)$, and $P_3(x_3, y_3)$we compare the slope of the first segment ($P_{1}P_{2}$) to the slope of the second segment ($P_{2}P_{3}$)

.Step 1: Set up the Slope ComparisonThe slope of the line segment from $P_{1}$ to $P_{2}$ is:$\text{Slope}{1}=\frac{y{2}-y_{1}}{x_{2}-x_{1}}$The slope of the line segment from $P_{2}$ to $P_{3}$ is:$\text{Slope}{2}=\frac{y{3}-y_{2}}{x_{3}-x_{2}}$If $\text{Slope}1 < \text{Slope}2$, the path turns left (Counter-Clockwise).If $\text{Slope}1 > \text{Slope}2$, the path turns right (Clockwise).If $\text{Slope}1 = \text{Slope}2$, the path is a straight line (Collinear).$ using cross-multiplication:$\frac{y{2}-y{1}}{x{2}-x{1}}>\frac{y{3}-y{2}}{x_{3}-x_{2}}$Cross-multiplying both sides by the denominators gives:$(y_{2}-y_{1})(x_{3}-x_{2})>(y_{3}-y_{2})(x_{2}-x_{1})$ Step 3: Define the Final Orientation ExpressionMove all terms to the left side of the inequality to create a single evaluation function, which we call $\text{Orientation}$:$\text{Orientation}(P_{1},P_{2},P_{3})=(y_{2}-y_{1})(x_{3}-x_{2})-(x_{2}-x_{1})(y_{3}-y_{2})$Step 4: Map the Mathematical Sign to GeometryThe value of this final expression dictates the exact geometric orientation:$\text{Orientation} > 0$: Clockwise turn (Point 3 is on the right side of line $P_{1}P_{2}$).$\text{Orientation} < 0$: Counter-clockwise turn (Point 3 is on the left side of line $P_{1}P_{2}$).$\text{Orientation} = 0$: Collinear (All three points lie on the exact same straight line).By calculating this function for triplets $(A,B,C)$ vs $(A,B,D)$ and $(C,D,A)$ vs $(C,D,B)$, we can show if the segments cross

this also makes sure there is a collision, eliminating the need for checking with the cross product, but we can't reduce code computation because we need those arguments for computing velocity and position

Fri, Aug 21, 04:02 AM

found the fault in the implementation
Aug 30, 2026, 5:09 PM



an issue with this was that it did not account for multiparticle systems, when it gets crowded, particles push against the wall, and when the backoff of the particles move the walls across the boundary, it does not trigger a collision, because of order of resolution. this could be solved by using the method in #133 but I solved it using the radius distance based collisions as with the old algorithm

let P = ops.difference(particle.position, this.start) // wall frame
		let normal = ops.difference(ops.project(P, this.wall), P)
		if (ops.magnitude(normal) < particle.radius) {
			const correction = ops.scale(
				ops.unit(normal),
				ops.magnitude(normal) - particle.radius
			)
			particle.position.add(correction)
			const delta = ops.dot(particle.velocity, ops.unit(normal))
			if (delta > 0) {
				particle.velocity.sub(ops.scale(ops.unit(normal), 2 * delta)
				)
			}
			particle.lastcontact = this
			return
		} 

another problem currently it does not work very well for intersections of walls, for fast moving particles, which again could be solved using #133. also I did not cap the collisions to line segments yet.

derived implementation works
Aug 30, 2026, 12:59 AM



Today I tested this algorithm, and physics never fails me

let P = ops.difference(particle.position, this.start) // wall frame
		let n = ops.difference(ops.project(P, this.wall), P)
		 let G = ops.sum(P, particle.velocity)
		let Pa = ops.sum(P, ops.scale(ops.unit(n), particle.radius)) // apex point
		let Ga = ops.sum(G, ops.scale(ops.unit(n), particle.radius))
		if (ops.cross(Ga, this.wall) * ops.cross(Pa, this.wall) <= 0){
			// console.log("collided", Ga, Pa, n, ops.cross(Ga, this.wall), ops.cross(Pa, this.wall))
			// let GaTFPs = ops.sum(Ga, ops.scale(n, -2))
			let gnA = ops.difference(
				ops.project(Ga, this.wall),
				Ga
			)
			let GTFPs = ops.sum(G, ops.scale(gnA, 2)) // wall frame
			let TrueGhostFuturePosition = ops.sum(this.start, GTFPs) // world frame
			let FutureVelocity = ops.sum(particle.velocity, ops.scale(ops.project(particle.velocity, n), -2)) //reflect v
			particle.position = TrueGhostFuturePosition // world frame
			particle.velocity = FutureVelocity //reflect v
			// console.log(" True ghost 	future position", TrueGhostFuturePosition, "future velocity", FutureVelocity)
			particle.lastcontact =this
		}
		
	}

it worked perfectly. i probably need to change the variable names.

<img width="1333" height="760" alt="Image" src="https://github.com/user-attachments/assets/aedf9357-e528-4768-b90b-bd630f408d6a" />

https://github.com/user-attachments/assets/a7d787a6-040c-496c-a9ab-b3ae7e78fb47

No problems reflecting a particle with 400 px/60s velocity.

however a few minor logical bugs were there, as in i calculated the normal for the position from the initial position, and not the ghost apex.

https://github.com/user-attachments/assets/f10fa7b6-06bc-4dbf-8b57-066f03218332

another problem that arose was that the particle kept oscillating a wall like in #87 which should not happen at all, because the particle must never cross the wall. It was a silly bug, i found it before i thought i using the last contact way to explicitly prevent it. the positon.add(N) and position = sum(position, N) are not the same and thus the bug

the particle and its apex and their ghost counterparts: <img width="937" height="644" alt="Image" src="https://github.com/user-attachments/assets/fb199db9-61b4-464c-9e65-bb163f136199" />

<img width="877" height="521" alt="Image" src="https://github.com/user-attachments/assets/c76a30e6-2098-4e32-b553-92971695eb11" />

to change collision architecture to non destructive accumulation #133
Aug 30, 2026, 12:24 AM



20-Aug-2026

while i was implementing my derivation for wall collisions, and had a little trouble implementing the timing of when to resolve collisions, because the particle collider handles position first and then the constraint collider which predicts a future collision, so i thought of a new approach: instead of updating velocities and positions directly in colliders, i store a dv and dp of each particle and in each iteration add that to the velocity and position directly in the move()

        this.velocity.add(this.dv)
        this.dp = new Vector(0, 0)
        this.dv = new Vector(0, 0)
        this.position.add(this.velocity)
and replace all instances of v and p modifications with dv and dp. however there were many modifications to be done and to account for and caused it to become messy. i spent a few hours trying to solve energy explosion due to walls, and integral step correction in particle handler. then it started behaving weirdly. i thought i would deal with this second problem later, it is drawing too much time for an architecture change, and can be done with it later. although i do like this simultaneous solver, instead of a sequential solver, but it keeps reporting bugs. it also reminded me once again how extremely important the order of operations are.

tried to fix tunneling again
Aug 12, 2026, 7:20 PM



Date:27-07-2026

so one of the issues with the earlier model was that the normal was drawn from the particle's center, and thus there was a discrepancy in collision handling. this issue wasn't there in the cross product algorithm because it already accounted for the radius.

to solve this issue,i scaled the normal's length to the radius, added it to the particle's position, and this new vector i call the 'apex' point, which is the first particle that touches the wall.

so i run the same collision algorithm on this apex point, and it should've worked but it hardly made a difference.

theres almost certainly a bug.

I sat down and derived the whole thing in physics and code on paper, now whats left to do implement it,image

image

accidentally added cohesion
Aug 11, 2026, 4:56 PM



found a very weird behaviour, i just inverted the sign for

if (projection <= 0) return; // only bounce if moving toward each other

to ≥ which caused the particles to stick togeather, almost like exhibiting cohesivity.

https://drive.google.com/file/d/1qA4NFThcy6BmDLW9uo4Fip0ZdCQ7dFVE/view?usp=sharing

Trying to fix the tunneling problem
Aug 11, 2026, 2:18 PM



Date: 24-07-2026

After switching to cross products, I added backoff to the walls like I did with particles, hoping it would solve the tunneling issue. Certainly, it solved the trespassing of slow moving particles, and incredibly use for Crystal lattice as now one could draw walls and constrain the particles within that structure, and watch them rearrange to best fill the space. bounce(particle) { let proximity = ops.difference(particle.position, this.start); let wallLength = ops.magnitude(this.direction); if (wallLength === 0) return; let shadow = ops.dot(this.direction, proximity) / wallLength; if (shadow > wallLength || shadow < 0) return; // check if particle is within the line segment bounds let perpendicular = ops.cross(this.direction, proximity) / wallLength; // distance to particle

	if (Math.abs(perpendicular) <= particle.radius) {
		let sign = perpendicular >= 0 ? 1 : -1;
		let normal = ops.unit(new Vector(-this.direction.y * sign, this.direction.x * sign));
		let overlap = particle.radius - Math.abs(perpendicular);
		let backoff = ops.scale(normal, overlap);
		particle.position.add(backoff);
		let projection = ops.dot(particle.velocity, normal);
		if (projection < 0) { // Only bounce if moving towards the wall
			let delta = ops.scale(normal, 2 * projection);
			particle.velocity.sub(delta);
		}
	}
}
However, it did not fix the tunneling for fast moving particles, even though it reduced it.

The problem was the time step, if a particle crosses a wall in a single frame, there is no way it can know.

So I thought of a new approach, inspired from geometric optics, to have a "ghost" particle that's located at current position + velocity, and compute the normal to that particle and real particle, and if they are opposite in sign, it means the ghost has trespassed the wall. from there, we use reflection principles and move the particle to the ghost's position, and subtracting twice the normal to the particle to make it reflected across the wall, and modifying the velocity same as before, by subtracting twice the velocity in direction of normal.

This should've worked, and though it make fast moving particles to bounce, and thus reduced collision, some still tunneled, especially if its a crowded region and it seems the particle particle collisions seem to interfere with my wall collision algorithm. and now the crystal lattice particles just fall through the wall like nothing.

for the second problem, I just tried to put up a hardcoded cut-off velocity above which it uses the new algorithm and and below uses the old algorithm with the back off, but sadly it did not solve tunneling and hard-coding velocity is just terrible code.

for the particle-particle problem i think the problem was cause of the order, the P-P collisions were resolved before the walls in my triangulate function and and also displayed, and so i moved the display to its own nested loop worsening performance. but this did not solve the issue and I moved the wall collision before the particles one and sure it didnt work, because I did not change the ghost to a "future particle" instead of a "past particle" so resolve. ideally it shouldn't have mattered, but in this hot loop it matters. so i set that up.

another problem arose: when hit at a low angle, it seems to oscillate back and forth of the wall, because the after a bounce, subtracting velocity from current meant the ghost was behind a wall it just bounced against, and thus thought it has trespassed. i resolved this with a patchy fix that i track the object that last collided with any given ball, be it wall or a particle, and checks if its the same wall colliding again it doesn't let it.

clearly i need a much better algorithm.

i tried seeking help from the best ai models free and they had interesting approaches mainly, time proportioning, which is something i didnt want to do because sub-stepping is very messy. however i branched the code and let the agents do what they felt best, and as expected none of them solved tunneling and in some cases made it worse, which I had expected.

so the resolution lies in my hands, and i shall derive this soon enough from pure physics.

added a trail parameter to particle generator to show velocity vectors
Aug 11, 2026, 12:51 PM



Date: 2026-07-16

now trails can be added and customized in the world generator class. essentially this came to me when I was testing walls and i set endpoints to particles and i thought why not make them show velocity vectors.

then i added a trail length property in particle class which computes a line by subtracting velocity twice from current position to get a backward trail.

now this trail length property is an adjustable parameter in the world generator, exposed to the user.image

also, while experimenting accidentally created mesmerizing 'modern art'.imageimageimage

Commit #39b05fbde00d5441f5113a73988026f4c77c0253 and 06cf699

made walls drawable and other UI controls
Aug 11, 2026, 12:30 PM



Date: 2026-07-04

now adding walls is as easy as dragging on the screen. you can hit space to play/pause, r to reset. the walls can also be added programmatically in the code editor box, and now the default custom code template shows how to implement walls.

let interactionsInit = false;
function handleInteractions() {
	if (interactionsInit) return;
	interactionsInit = true;
	let dragged = false
	let start = null
	window.addEventListener("mousedown", (e) => {
		start = new Vector(e.clientX, e.clientY)
		dragged = false
	})
	document.addEventListener("mousemove", () => {
		dragged = true
	})
	window.addEventListener("mouseup", (e) => {
		if (!dragged) return
		const end = new Vector(e.clientX, e.clientY)
		walls.push(new Wall(start, end))
		walls[walls.length - 1].display()
	})
	window.addEventListener("keydown", (e) => {
		if (e.key === " ") {
			e.preventDefault()
			handlePlayPause()
		} else if (e.key === "r") {
			handleRestart()
		}
	});
}
Commit #9b6fb7e

however the tunneling problem is still unsolved.

realized cross products work better
Aug 4, 2026, 11:23 PM



Date: 2026-07-01

fluid engine: just realized that there is a “2D” cross product which is essentially the magnitude of the cross of two vectors, and instead of using the projection and triangle inequality for a wall collision, i simply see if the magnitude of this cross is less than or equal to the radius of the particle i.e if the thing is touching it or not. this also simplifies the problem of determining which side of the wall a normal is drawn to.

 dot: (A, B) => {
		return A.x * B.x + A.y * B.y
	},
	cross: (A, B) => {
		return A.x * B.y - A.y * B.x
	},
	magnitude: (A) => {
		return (A.x ** 2 + A.y ** 2) ** (1 / 2)
	}, 
		let shadow = ops.dot(this.direction, proximity) / wallLength;
		if (shadow > wallLength || shadow < 0) return; // check if particle is within the line segment bounds
		let perpendicular = ops.cross(this.direction, proximity) / wallLength; // distance to particle

		if (Math.abs(perpendicular) <= particle.radius) {
			let sign = perpendicular >= 0 ? 1 : -1;
image

11:32 AM 1 July 2026

added walls and their collisions via projections
Aug 4, 2026, 11:14 PM



was trying to implement walls in my fluid sim, so my first thought was to create a wall (line) defined by a start and end vector, and compute the relative position of the end and a particle from the start.

then, find the projection of the particles position on the line, and the collision condition would be if its positive, and less than length of the line [so that its on the line] and the projection is equal to the length of the relative position of the particle. since particle’s size is non zero, we account for its radius and change the last condition to being true when the projection is equal to the length of the leg X, of the right triangle formed by X, the radius r and the distance to the particle. since the engine isnt continuous in time stamps, we change the equality to the projection being equal or greater than X, since the collision checks is run at a finite fps, quite small in this case, 30fps.

image

for the collision, i compute the normal to the particle, and subtract twice the velocity of the particle in this normal direction from the particle, causing a bounce, since this a wall is rigid.image

surprisingly, this idea works perfectly, on the first try itself.

bounce(particle){
			let proximity = ops.difference(particle.position, this.start)
			let projection = ops.dot(this.direction, proximity)/ops.magnitude(this.direction)
			if (projection > 0 && projection < ops.magnitude(this.direction) && projection >= (ops.magnitude(proximity)**2 - (particle.size/2)**2)**(1/2)){ // projection is equal to leg of triangle
				let normal = projection>0? ops.unit(new Vector(-this.direction.y, this.direction.x)) : ops.unit(new Vector(this.direction.y,- this.direction.x))
				let overlap = (ops.magnitude(proximity) ** 2 - (particle.size / 2) ** 2) ** (1 / 2) - projection
				let backoff = ops.scale(normal, overlap)
				particle.position.sub(backoff)
				let delta = ops.scale(normal, 2* ops.dot(particle.velocity, normal)) // 2x cause rigid body
				particle.velocity.sub(delta)
			}
for the fps reason though, i need to add backoffs, to avoid overlapping and cant help particles moving too fast as they will trespass the wall this way.

added mass to my particles!
Jun 14, 2026, 6:59 PM

2h


i was trying to add mass constraints to my particle fluid simulator, which had initially assumed equal masses for all particles were identical. that was very fun to play with. but now i felt it needed more capabilities. i wanted to add custom SVGs to the site and let the particles collide with that svg’s contours. the first step to that was defining a rigid body. which is essentially a particle(s) with infinite mass.

so next i had to account for masses in my sim.

should be easy, but im gonna follow my classic creed for physics sims, to not use google or any textbooks or any formulas to compute the solution, but derive it from the code and raw physics laws through emergence and intuition.

so i started with defining a particle property called mass, and i first thought to define momentum and replace all instances of velocity with momentum. but yeah obviously then momentum wont be conserved.

clearly all change was to be done in these lines of code

image

actually just delta, here im distributing velocities equally. so for mass, delta just has to be weighted by the mass (no pun intended). its easy to think that velocity is inversely proportional to mass. so i use my previously built scale property

image

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

AM = (m + inf)/2 , def not 2m, and diverges to inf

GM = sqrt(m * inf) again shoots to inf

HM = 2/(1/inf + 1/m) yesss this is 2m.

so we found k to be the hm of the 2 masses.

I tried all three means as values of k, and for AM and GM in a sim with many light particles and a single massive particle. a few moments after the start all particles starting rapidly shooting everywhere. except for GM, where it remained stable.

image

for a quick sanity check, i wrote a quick total energy and momentum counter, yessss it remained conserved. although, initally momentum wasnt conserved and before i could panic i realized this was because of the walls. so i disabled walls and it works.

I also changed the code to now allow changing mass as a property in the editable code section of the menu.

(the 2 hours of this journal is for figuring out the math in my book and trying out test cases in the browser)

image

image

Future Updates:-

Allow creation of custom walls
Plotting points on an Imported SVGs path and making them rigid to make a true fluid sim
Adding tunable properties like cohesiveness and following bernoulli's principles, to mimic SPH (Smoothened particle hydrodynamics)
