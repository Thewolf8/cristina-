/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║            C R I S T I N A  —  Immersive Web Experience         ║
 * ║                                                                  ║
 * ║  State Machine:                                                  ║
 * ║    PASSWORD_GATE → LABYRINTH → PRISM → FRACTAL_TREE → FINAL_CORE ║
 * ║                                                                  ║
 * ║  Tech Stack:                                                     ║
 * ║    React + Vite + Three.js + @react-three/fiber                 ║
 * ║    @react-three/drei + @react-three/postprocessing              ║
 * ║    GSAP + Tailwind CSS                                           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Install dependencies:
 *   npm install three @react-three/fiber @react-three/drei
 *   npm install @react-three/postprocessing postprocessing
 *   npm install gsap
 *
 * Tailwind must be configured in your Vite project.
 */

 import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
 import { Canvas, useFrame, useThree } from '@react-three/fiber'
 import { Stars, MeshTransmissionMaterial, Environment } from '@react-three/drei'
 import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
 import { BlendFunction, KernelSize } from 'postprocessing'
 import * as THREE from 'three'
 import { gsap } from 'gsap'
 
 /* ═══════════════════════════════════════════════════════════════════
    CONSTANTS & STATE MACHINE DEFINITIONS
    ═══════════════════════════════════════════════════════════════════ */
 
 const STATES = {
   PASSWORD_GATE: 'PASSWORD_GATE',
   LABYRINTH:     'LABYRINTH',
   PRISM:         'PRISM',
   FRACTAL_TREE:  'FRACTAL_TREE',
   FINAL_CORE:    'FINAL_CORE',
 }
 
 /** The only key that unlocks this world */
 const PASSWORD = 'Cristina'
 
 /** Linear state machine transitions */
 const NEXT_SCENE = {
   LABYRINTH:    'PRISM',
   PRISM:        'FRACTAL_TREE',
   FRACTAL_TREE: 'FINAL_CORE',
   FINAL_CORE:   null, // terminal state
 }
 
 /** Romanian texts per scene */
 const SCENE_COPY = {
   LABYRINTH: {
     title:   'Cristina...',
     body:    'Existența este arta de a pune întrebările potrivite.',
   },
   PRISM: {
     title:   'Nu ai părăsit un drum;',
     body:    'ai părăsit o cușcă ce era prea mică pentru adevărul tău.',
   },
   FRACTAL_TREE: {
     title:   'A te simți pierdută',
     body:    'înseamnă pur și simplu că sufletul tău își extinde harta.',
   },
   FINAL_CORE: {
     title:   'Ai răbdare cu tine.',
     body:    'Lumea poate aștepta până când vei înflori.',
     signoff: 'De la Fateh... Un memento să continui.',
   },
 }
 
 /** Ordered scene list (for progress indicators) */
 const SCENE_ORDER = ['LABYRINTH', 'PRISM', 'FRACTAL_TREE', 'FINAL_CORE']
 
 /* ═══════════════════════════════════════════════════════════════════
    HOOK: useTypewriter
    Animates characters one-by-one at a given speed (ms/char).
    Returns the currently-displayed string and a `done` flag.
    ═══════════════════════════════════════════════════════════════════ */
 function useTypewriter(text, speed = 50) {
   const [displayed, setDisplayed] = useState('')
   const [done, setDone]           = useState(false)
 
   useEffect(() => {
     // Reset on text change
     setDisplayed('')
     setDone(false)
 
     if (!text) { setDone(true); return }
 
     let i = 0
     const id = setInterval(() => {
       i++
       setDisplayed(text.slice(0, i))
       if (i >= text.length) {
         setDone(true)
         clearInterval(id)
       }
     }, speed)
 
     return () => clearInterval(id)
   }, [text, speed])
 
   return { displayed, done }
 }
 
 /* ═══════════════════════════════════════════════════════════════════
    SCENE 1 ─ LABYRINTH (Plexus Particle Network)
    ───────────────────────────────────────────────────────────────────
    Algorithm:
      • N particles move freely in 3D space, bouncing off invisible walls.
      • Every frame, any two particles closer than `connectDist` are
        joined by a semi-transparent line (O(N²) neighbour check).
      • BufferGeometry is mutated in-place; needsUpdate triggers GPU upload.
    ═══════════════════════════════════════════════════════════════════ */
 function PlexusParticles({ count = 140, connectDist = 3.8 }) {
   const particles = useRef([])
 
   // ── Initialise particles once ──
   useMemo(() => {
     particles.current = Array.from({ length: count }, () => ({
       pos: new THREE.Vector3(
         (Math.random() - 0.5) * 14,
         (Math.random() - 0.5) * 10,
         (Math.random() - 0.5) * 4,
       ),
       vel: new THREE.Vector3(
         (Math.random() - 0.5) * 0.012,
         (Math.random() - 0.5) * 0.012,
         (Math.random() - 0.5) * 0.004,
       ),
     }))
   }, [count])
 
   // ── Shared geometry objects (mutated each frame) ──
   const pointsGeom = useMemo(() => {
     const g = new THREE.BufferGeometry()
     g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
     return g
   }, [count])
 
   const linesGeom = useMemo(() => {
     // Worst-case: every pair connected → N*(N-1)/2 segments × 2 endpoints × 3 floats
     const maxSegs = Math.ceil((count * (count - 1)) / 2)
     const g = new THREE.BufferGeometry()
     g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxSegs * 6), 3))
     return g
   }, [count])
 
   useFrame(() => {
     const pts  = particles.current
     const WALL = 7
 
     // 1. Integrate positions, bounce
     for (const p of pts) {
       p.pos.add(p.vel)
       if (Math.abs(p.pos.x) > WALL)  p.vel.x *= -1
       if (Math.abs(p.pos.y) > WALL)  p.vel.y *= -1
       if (Math.abs(p.pos.z) > 2.5)   p.vel.z *= -1
     }
 
     // 2. Write point positions
     const pArr = pointsGeom.attributes.position.array
     for (let i = 0; i < pts.length; i++) {
       pArr[i * 3]     = pts[i].pos.x
       pArr[i * 3 + 1] = pts[i].pos.y
       pArr[i * 3 + 2] = pts[i].pos.z
     }
     pointsGeom.attributes.position.needsUpdate = true
 
     // 3. Build line segments for close neighbours
     const lArr = linesGeom.attributes.position.array
     let seg = 0
     for (let i = 0; i < pts.length; i++) {
       for (let j = i + 1; j < pts.length; j++) {
         if (pts[i].pos.distanceTo(pts[j].pos) < connectDist) {
           lArr[seg * 6]     = pts[i].pos.x
           lArr[seg * 6 + 1] = pts[i].pos.y
           lArr[seg * 6 + 2] = pts[i].pos.z
           lArr[seg * 6 + 3] = pts[j].pos.x
           lArr[seg * 6 + 4] = pts[j].pos.y
           lArr[seg * 6 + 5] = pts[j].pos.z
           seg++
         }
       }
     }
     linesGeom.setDrawRange(0, seg * 2)
     linesGeom.attributes.position.needsUpdate = true
   })
 
   return (
     <group>
       {/* Particle nodes */}
       <points geometry={pointsGeom}>
         <pointsMaterial
           color="#a78bfa"
           size={0.07}
           sizeAttenuation
           transparent
           opacity={0.95}
         />
       </points>
 
       {/* Connection lines */}
       <lineSegments geometry={linesGeom}>
         <lineBasicMaterial
           color="#7c3aed"
           transparent
           opacity={0.3}
           linewidth={1}
         />
       </lineSegments>
     </group>
   )
 }
 
 /* ═══════════════════════════════════════════════════════════════════
    SCENE 2 ─ PRISM (Glass Tetrahedron with Chromatic Aberration)
    ───────────────────────────────────────────────────────────────────
    Uses drei's MeshTransmissionMaterial for physically-based glass.
    Mouse position drives a parent group tilt via lerp each frame.
    ═══════════════════════════════════════════════════════════════════ */
 function GlassPrism({ mouseRef }) {
   const meshRef  = useRef()
   const groupRef = useRef()
   const geom     = useMemo(() => new THREE.TetrahedronGeometry(2.2, 0), [])
 
   useFrame(({ clock }) => {
     const t = clock.elapsedTime
     if (!meshRef.current || !groupRef.current) return
 
     // Autonomous slow rotation
     meshRef.current.rotation.y = t * 0.22
     meshRef.current.rotation.x = t * 0.13
 
     // Parallax tilt from mouse – lerped for smooth following
     const mx = mouseRef.current?.x ?? 0
     const my = mouseRef.current?.y ?? 0
     groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, my * 0.55, 0.04)
     groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mx * 0.55, 0.04)
   })
 
   return (
     <group ref={groupRef}>
       {/* HDR environment for reflections */}
       <Environment preset="night" />
 
       {/* Glass body */}
       <mesh ref={meshRef} geometry={geom}>
         <MeshTransmissionMaterial
           backside
           samples={10}
           thickness={3.5}
           roughness={0.0}
           clearcoat={1}
           clearcoatRoughness={0.0}
           transmission={1}
           ior={1.9}
           chromaticAberration={0.08}
           color="#ddd6fe"
           distortionScale={0.4}
           temporalDistortion={0.25}
         />
       </mesh>
 
       {/* Subtle wireframe overlay */}
       <mesh geometry={geom}>
         <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.12} />
       </mesh>
     </group>
   )
 }
 
 /* ═══════════════════════════════════════════════════════════════════
    SCENE 3 ─ FRACTAL TREE (Recursive L-System)
    ───────────────────────────────────────────────────────────────────
    Algorithm:
      • Recursive binary tree: each branch spawns two children rotated
        ±angle around the Z axis, scaled by 0.72.
      • All segments are pre-computed into a flat Float32Array.
      • A GSAP-animated growRef drives `setDrawRange` to reveal the
        tree progressively from root to leaves.
    ═══════════════════════════════════════════════════════════════════ */
 
 /** Recursive generator — returns flat array of {start, end} Vector3 pairs */
 function buildTree(depth, length, angleDeg, pos, dir, segments = []) {
   if (depth === 0) return segments
 
   const end = pos.clone().add(dir.clone().multiplyScalar(length))
   segments.push(pos.clone(), end.clone())
 
   const rad  = (angleDeg * Math.PI) / 180
   const axis = new THREE.Vector3(0, 0, 1)
 
   buildTree(depth - 1, length * 0.72, angleDeg * 0.93, end.clone(), dir.clone().applyAxisAngle(axis,  rad), segments)
   buildTree(depth - 1, length * 0.72, angleDeg * 0.93, end.clone(), dir.clone().applyAxisAngle(axis, -rad), segments)
 
   return segments
 }
 
 function FractalTree() {
   const groupRef  = useRef()
   const growRef   = useRef(0) // animated 0 → 1 by GSAP
 
   // Pre-compute all segment endpoints once
   const { geom, totalPoints } = useMemo(() => {
     const segs = buildTree(
       9,                              // recursion depth
       1.55,                           // trunk length
       27,                             // branch angle (degrees)
       new THREE.Vector3(0, -4.2, 0),  // root position
       new THREE.Vector3(0, 1, 0),     // initial direction (up)
     )
     const positions = new Float32Array(segs.length * 3)
     segs.forEach((v, i) => { positions[i * 3] = v.x; positions[i * 3 + 1] = v.y; positions[i * 3 + 2] = v.z })
 
     const g = new THREE.BufferGeometry()
     g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
     return { geom: g, totalPoints: segs.length }
   }, [])
 
   // Trigger grow animation whenever this scene mounts
   useEffect(() => {
     growRef.current = 0
     geom.setDrawRange(0, 0)
 
     const tween = gsap.to(growRef, {
       current: 1,
       duration: 4.5,
       ease: 'power1.inOut',
     })
     return () => tween.kill()
   }, [geom])
 
   useFrame(({ clock }) => {
     // Reveal tree proportionally to growRef
     geom.setDrawRange(0, Math.floor(totalPoints * growRef.current))
 
     // Gentle sway
     if (groupRef.current) {
       groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.12
     }
   })
 
   return (
     <group ref={groupRef}>
       <lineSegments geometry={geom}>
         <lineBasicMaterial color="#34d399" transparent opacity={0.88} linewidth={1} />
       </lineSegments>
     </group>
   )
 }
 
 /* ═══════════════════════════════════════════════════════════════════
    SCENE 4 ─ FINAL CORE (Icosahedron Wireframe + Pulsing Core)
    ───────────────────────────────────────────────────────────────────
    Three concentric shapes:
      1. Outer icosahedron wireframe (slow Y rotation)
      2. Inner icosahedron wireframe (counter-rotation)
      3. Central sphere that pulses via sine wave scale
    A PointLight at the centre gives the glow effect.
    Bloom is applied globally; text lives in the 2D overlay (z-index 50).
    ═══════════════════════════════════════════════════════════════════ */
 function FinalCore() {
   const outerRef = useRef()
   const innerRef = useRef()
   const coreRef  = useRef()
 
   useFrame(({ clock }) => {
     const t = clock.elapsedTime
     if (outerRef.current) { outerRef.current.rotation.y = t * 0.18; outerRef.current.rotation.x = t * 0.09 }
     if (innerRef.current) { innerRef.current.rotation.y = -t * 0.28; innerRef.current.rotation.z = t * 0.14 }
     if (coreRef.current)  { coreRef.current.scale.setScalar(1 + Math.sin(t * 2.2) * 0.1) }
   })
 
   return (
     <group>
       {/* Layer 1: Outer icosahedron */}
       <mesh ref={outerRef}>
         <icosahedronGeometry args={[2.8, 1]} />
         <meshBasicMaterial color="#e879f9" wireframe transparent opacity={0.45} />
       </mesh>
 
       {/* Layer 2: Inner icosahedron */}
       <mesh ref={innerRef}>
         <icosahedronGeometry args={[1.7, 0]} />
         <meshBasicMaterial color="#c084fc" wireframe transparent opacity={0.4} />
       </mesh>
 
       {/* Layer 3: Glowing centre sphere */}
       <mesh ref={coreRef}>
         <sphereGeometry args={[0.55, 20, 20]} />
         <meshBasicMaterial color="#fde68a" />
       </mesh>
 
       {/* Dynamic point light for the bloom source */}
       <pointLight color="#e879f9" intensity={4} distance={10} decay={2} />
     </group>
   )
 }
 
 /* ═══════════════════════════════════════════════════════════════════
    CAMERA ANIMATOR
    Smoothly transitions the Three.js camera Z position between scenes
    using GSAP, so the "pull-back / zoom-in" feels cinematic.
    ═══════════════════════════════════════════════════════════════════ */
 const CAMERA_Z = {
   LABYRINTH:    14,
   PRISM:         7,
   FRACTAL_TREE: 13,
   FINAL_CORE:    8.5,
 }
 
 function CameraAnimator({ scene }) {
   const { camera } = useThree()
 
   useEffect(() => {
     gsap.to(camera.position, {
       z:        CAMERA_Z[scene] ?? 12,
       x:        0,
       y:        0,
       duration: 2,
       ease:     'power3.inOut',
     })
   }, [scene, camera])
 
   return null
 }
 
 /* ═══════════════════════════════════════════════════════════════════
    POST-PROCESSING WRAPPER
    Bloom is always active (intensity 0.4 keeps text readable).
    Chromatic aberration is added only in the PRISM scene.
    ═══════════════════════════════════════════════════════════════════ */
 function PostFX({ scene }) {
   return (
     <EffectComposer>
       {/* Subtle bloom — max 0.4 so text overlay stays sharp */}
       <Bloom
         intensity={0.4}
         kernelSize={KernelSize.MEDIUM}
         luminanceThreshold={0.18}
         luminanceSmoothing={0.85}
         blendFunction={BlendFunction.ADD}
       />
 
       {/* Chromatic aberration only for the glass prism */}
       {scene === 'PRISM' && (
         <ChromaticAberration
           blendFunction={BlendFunction.NORMAL}
           offset={new THREE.Vector2(0.0022, 0.0022)}
         />
       )}
     </EffectComposer>
   )
 }
 
 /* ═══════════════════════════════════════════════════════════════════
    SCENE CONTENT (3D Canvas interior — switches on scene state)
    ═══════════════════════════════════════════════════════════════════ */
 function SceneContent({ scene, mouseRef }) {
   return (
     <>
       <CameraAnimator scene={scene} />
 
       {/* Global ambient — kept very low so emissive/bloom dominates */}
       <ambientLight intensity={0.08} />
 
       {/* Starfield present in all scenes */}
       <Stars radius={120} depth={60} count={2800} factor={3} saturation={0} fade speed={0.4} />
 
       {/* ── Scene-specific geometry ── */}
       {scene === 'LABYRINTH'    && <PlexusParticles />}
       {scene === 'PRISM'        && <GlassPrism mouseRef={mouseRef} />}
       {scene === 'FRACTAL_TREE' && <FractalTree key="fractal" />}
       {scene === 'FINAL_CORE'   && <FinalCore />}
 
       {/* ── Post-processing effects ── */}
       <PostFX scene={scene} />
     </>
   )
 }
 
 /* ═══════════════════════════════════════════════════════════════════
    TEXT OVERLAY (2D HTML — always on top of the canvas)
    ───────────────────────────────────────────────────────────────────
    • Title types character-by-character (typewriter effect).
    • Body begins typing only after the title is complete.
    • GSAP handles the fade/slide-up entrance on scene change.
    • The overlay div never intercepts canvas events (pointer-events: none)
      except for the navigation button.
    ═══════════════════════════════════════════════════════════════════ */
 function TextOverlay({ scene, onNext }) {
   const wrapRef    = useRef()
   const copy       = SCENE_COPY[scene]
   const isLastScene = scene === 'FINAL_CORE'
 
   // Typewriter cascade: title first, then body
   const { displayed: titleText, done: titleDone } = useTypewriter(copy?.title  ?? '', 60)
   const { displayed: bodyText,  done: bodyDone  } = useTypewriter(titleDone ? (copy?.body ?? '') : '', 38)
   const showSignoff = isLastScene && bodyDone && copy?.signoff
 
   // Fade in on each scene transition
   useEffect(() => {
     if (!wrapRef.current) return
     gsap.fromTo(
       wrapRef.current,
       { opacity: 0, y: 24 },
       { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out', delay: 0.25 }
     )
   }, [scene])
 
   return (
     <div
       ref={wrapRef}
       style={{ opacity: 0 }}
       className="fixed bottom-0 left-0 right-0 z-50 pb-12 px-6 pointer-events-none select-none"
     >
       <div className="max-w-xl mx-auto text-center space-y-3">
 
         {/* ── Title (typewriter) ── */}
         <h2
           className="font-serif text-2xl md:text-3xl text-white tracking-wide leading-snug"
           style={{ textShadow: '0 0 35px rgba(167,139,250,0.75), 0 2px 8px rgba(0,0,0,0.9)' }}
         >
           {titleText}
           {/* Blinking cursor: visible only while typing */}
           {!titleDone && <span className="opacity-70 animate-pulse">|</span>}
         </h2>
 
         {/* ── Body (starts after title finishes) ── */}
         {titleDone && (
           <p
             className="text-purple-200/90 text-base md:text-lg font-light leading-relaxed"
             style={{ textShadow: '0 1px 6px rgba(0,0,0,0.95)' }}
           >
             {bodyText}
             {!bodyDone && <span className="opacity-60 animate-pulse">|</span>}
           </p>
         )}
 
         {/* ── Sign-off (Final Core only) ── */}
         {showSignoff && (
           <p
             className="text-amber-300/90 text-sm italic tracking-[0.18em] pt-2"
             style={{ textShadow: '0 0 20px rgba(253,230,138,0.6)' }}
           >
             {copy.signoff}
           </p>
         )}
 
         {/* ── Navigation button ── */}
         {!isLastScene && (
           <div className="pointer-events-auto pt-4">
             <button
               onClick={onNext}
               aria-label="Continuă la scena următoare"
               className="
                 text-purple-300 text-[11px] tracking-[0.35em] uppercase
                 border border-purple-800/70 px-7 py-2 rounded-full
                 hover:border-purple-500 hover:text-white hover:bg-purple-900/30
                 active:scale-95
                 transition-all duration-500
               "
             >
               Continuă →
             </button>
           </div>
         )}
       </div>
     </div>
   )
 }
 
 /* ═══════════════════════════════════════════════════════════════════
    SCENE PROGRESS INDICATOR (top-right dots)
    ═══════════════════════════════════════════════════════════════════ */
 function SceneDots({ currentScene }) {
   return (
     <div className="fixed top-6 right-6 z-50 flex items-center gap-2" aria-hidden="true">
       {SCENE_ORDER.map((s) => {
         const isActive = s === currentScene
         const isPast   = SCENE_ORDER.indexOf(s) < SCENE_ORDER.indexOf(currentScene)
         return (
           <div
             key={s}
             className={`rounded-full transition-all duration-700 ${
               isActive
                 ? 'w-2.5 h-2.5 bg-purple-400 shadow-[0_0_8px_rgba(167,139,250,0.9)]'
                 : isPast
                   ? 'w-1.5 h-1.5 bg-purple-700'
                   : 'w-1.5 h-1.5 bg-purple-900/60'
             }`}
           />
         )
       })}
     </div>
   )
 }
 
 /* ═══════════════════════════════════════════════════════════════════
    PASSWORD GATE
    ───────────────────────────────────────────────────────────────────
    Renders a pure black screen with a glowing password input.
    The 3D Canvas is NOT mounted until authentication succeeds,
    preserving performance and building suspense.
    ═══════════════════════════════════════════════════════════════════ */
 function PasswordGate({ onSuccess }) {
   const [value,    setValue]    = useState('')
   const [error,    setError]    = useState(false)
   const [shaking,  setShaking]  = useState(false)
   const containerRef = useRef()
   const inputRef     = useRef()
 
   // Entrance fade-in
   useEffect(() => {
     gsap.fromTo(
       containerRef.current,
       { opacity: 0, scale: 0.94 },
       { opacity: 1, scale: 1, duration: 2, ease: 'power3.out' }
     )
     setTimeout(() => inputRef.current?.focus(), 600)
   }, [])
 
   const attemptEntry = useCallback(() => {
     if (value === PASSWORD) {
       // Success: fade out and hand control to parent
       gsap.to(containerRef.current, {
         opacity: 0, scale: 1.04, duration: 0.9, ease: 'power2.in',
         onComplete: onSuccess,
       })
     } else {
       // Failure: shake + error message
       setError(true)
       setShaking(true)
       setValue('')
       setTimeout(() => setShaking(false), 550)
       setTimeout(() => setError(false), 2500)
     }
   }, [value, onSuccess])
 
   const onKeyDown = useCallback((e) => {
     if (e.key === 'Enter') attemptEntry()
   }, [attemptEntry])
 
   return (
     <>
       {/* Inline keyframe for the shake animation */}
       <style>{`
         @keyframes shakeX {
           0%,100% { transform: translateX(0); }
           20%,60% { transform: translateX(-10px); }
           40%,80% { transform: translateX(10px); }
         }
         .shake { animation: shakeX 0.5s ease-in-out; }
       `}</style>
 
       <div className="fixed inset-0 bg-black flex items-center justify-center z-[100]">
         <div
           ref={containerRef}
           style={{ opacity: 0 }}
           className={`text-center px-10 ${shaking ? 'shake' : ''}`}
         >
           {/* ── Decorative crest ── */}
           <div className="mb-10 flex justify-center">
             <div
               className="w-14 h-14 border border-purple-700/70 rotate-45 flex items-center justify-center"
               style={{ boxShadow: '0 0 50px rgba(124,58,237,0.35)' }}
             >
               <div
                 className="w-6 h-6 border border-purple-500/80 rotate-[22.5deg]"
                 style={{ boxShadow: '0 0 20px rgba(167,139,250,0.5)' }}
               />
             </div>
           </div>
 
           {/* ── Prompt label ── */}
           <p className="text-purple-500/80 text-[10px] tracking-[0.55em] uppercase mb-8">
             Introdu cheia
           </p>
 
           {/* ── Password input ── */}
           <div className="relative">
             <input
               ref={inputRef}
               type="password"
               value={value}
               onChange={(e) => setValue(e.target.value)}
               onKeyDown={onKeyDown}
               placeholder="••••••••"
               className={`
                 bg-transparent w-52 py-2 text-center tracking-[0.45em] text-lg text-white
                 border-b outline-none placeholder-purple-900/60
                 transition-colors duration-400
                 ${error ? 'border-red-600/70' : 'border-purple-800 focus:border-purple-400'}
               `}
               style={{ fontFamily: "'Georgia', serif" }}
               autoComplete="off"
             />
             {/* Animated underline glow */}
             <div
               className={`absolute bottom-0 left-0 right-0 h-px transition-all duration-500 ${
                 error
                   ? 'bg-red-500'
                   : 'bg-purple-700'
               }`}
               style={{
                 boxShadow: error
                   ? '0 0 12px rgba(239,68,68,0.7)'
                   : '0 0 18px rgba(124,58,237,0.55)',
               }}
             />
           </div>
 
           {/* ── Submit button ── */}
           <button
             onClick={attemptEntry}
             className="mt-8 text-purple-500 text-[11px] tracking-[0.3em] uppercase hover:text-white transition-colors duration-400"
           >
             Intră →
           </button>
 
           {/* ── Error feedback ── */}
           {error && (
             <p className="mt-5 text-red-400/90 text-[11px] tracking-widest animate-pulse">
               Cheia nu se potrivește
             </p>
           )}
         </div>
       </div>
     </>
   )
 }
 
 /* ═══════════════════════════════════════════════════════════════════
    ROOT APPLICATION
    ───────────────────────────────────────────────────────────────────
    Orchestrates the full state machine:
      1. Shows PasswordGate (no Canvas).
      2. On success, mounts Canvas with the first 3D scene.
      3. Click / Space / ArrowRight advance through scenes.
    ═══════════════════════════════════════════════════════════════════ */
 export default function App() {
   const [authenticated, setAuthenticated] = useState(false)
   const [scene, setScene]                 = useState(STATES.PASSWORD_GATE)
   const mouseRef = useRef({ x: 0, y: 0 }) // raw NDC mouse coords, not reactive
 
   // Update mouse ref on every move (no re-render cost)
   const onMouseMove = useCallback((e) => {
     mouseRef.current = {
       x:  (e.clientX / window.innerWidth)  * 2 - 1,
       y: -(e.clientY / window.innerHeight) * 2 + 1,
     }
   }, [])
 
   // Advance to next scene
   const nextScene = useCallback(() => {
     setScene((s) => NEXT_SCENE[s] ?? s)
   }, [])
 
   // Called by PasswordGate on correct password
   const handleAuth = useCallback(() => {
     setAuthenticated(true)
     setScene(STATES.LABYRINTH)
   }, [])
 
   // Keyboard: Space or → advances the scene
   useEffect(() => {
     if (!authenticated) return
     const onKey = (e) => {
       if (e.code === 'Space' || e.code === 'ArrowRight') {
         e.preventDefault()
         nextScene()
       }
     }
     window.addEventListener('keydown', onKey)
     return () => window.removeEventListener('keydown', onKey)
   }, [authenticated, nextScene])
 
   return (
     <div
       className="w-screen h-screen bg-black overflow-hidden relative"
       onMouseMove={authenticated ? onMouseMove : undefined}
     >
 
       {/* ── Layer 1: Password Gate (removed from DOM after auth) ── */}
       {!authenticated && <PasswordGate onSuccess={handleAuth} />}
 
       {/* ── Layer 2: Three.js Canvas (mounted only after auth) ── */}
       {authenticated && (
         <Canvas
           className="absolute inset-0"
           camera={{ position: [0, 0, 14], fov: 58, near: 0.1, far: 1000 }}
           gl={{
             antialias:    true,
             toneMapping:  THREE.ACESFilmicToneMapping,
             toneMappingExposure: 1.1,
           }}
           dpr={[1, 2]} // Retina-aware, capped for performance
         >
           <SceneContent scene={scene} mouseRef={mouseRef} />
         </Canvas>
       )}
 
       {/* ── Layer 3: 2D Text Overlay (z-50) ── */}
       {authenticated && (
         <TextOverlay scene={scene} onNext={nextScene} />
       )}
 
       {/* ── Layer 4: Scene dot indicator ── */}
       {authenticated && <SceneDots currentScene={scene} />}
 
       {/* ── Layer 5: Keyboard hint ── */}
       {authenticated && (
         <div
           className="fixed top-6 left-6 z-50 text-purple-900/70 text-[10px] tracking-[0.4em] uppercase select-none"
           aria-hidden="true"
         >
           Spațiu / →
         </div>
       )}
 
     </div>
   )
 } 