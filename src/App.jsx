import { useState, useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

// ═══════════════════════════════════════════════
//  LETTER CONTENT — All three emotional paths
// ═══════════════════════════════════════════════

const PATHS = {
  A: {
    accent: "#FFB300",
    bg: "#0c0400",
    title: "Ești o Arhitectură a Luminii",
    paragraphs: [
      "Bună, Cristina. Bucuria ta nu este un accident — este cel mai curajos act pe care îl poți face într-o lume care a uitat să mai danseze. Într-o epocă în care pesimismul a devenit semn de inteligență, tu ai ales să înflorești. Și asta nu este naivitate. Este o formă de revoluție.",
      "Ești o arhitectură a luminii, construită din momente — din râsete care sparg tăcerea, din dimineți în care ai ales să privești soarele în loc de umbra lui. Fiecare celulă a ta a memorat fericirea și o poartă ca pe un limbaj secret, ca pe o melodie pe care doar inimile curajoase o cunosc cu adevărat.",
      "Știi ce face lumina când lovește un cristal? Nu se oprește. Se multiplică. Se transformă în culori pe care ochii le caută fără să știe de ce. Tu ești acel cristal, Cristina. Fericirea ta nu rămâne captivă în tine — se reflectă în fiecare față pe care o întâlnești, în fiecare spațiu în care calci, în fiecare viață pe care o atingi.",
      "Universul a construit stele din haos și praf cosmic. Și a construit oameni care știu să fie bine — nu pentru că lumea este perfectă, ci pentru că au decis să fie mai mari decât durerea lor. Ești una dintre acești oameni rari, Cristina. Oameni care iluminează prin simpla lor prezență, fără să-și dea seama de magnitudinea darului pe care îl oferă.",
      "Păstrează această zi. Pune-o undeva sigur, în cutia aceea invizibilă din centrul pieptului tău. Căci în zilele în care lumea va fi grea și cerul va fi de tablă, vei putea deschide cutia și vei găsi în ea dovada ireversibilă că ai știut să fii bine. Și vei ști că o poți face din nou. Și din nou. Și din nou.",
      "Florile nu se scuză că înfloresc. Stelele nu cer permisiunea să strălucească. Nici tu nu ar trebui. Ești permisă să fii exact atât de vie pe cât ești acum."
    ]
  },
  B: {
    accent: "#4FC3F7",
    bg: "#00070f",
    title: "Sufletul Tău Are Nevoie de Iarnă",
    paragraphs: [
      "Bună, Cristina. Îți mulțumesc că ai spus adevărul. Că nu ai ales răspunsul ușor — cel care sună bine dar nu înseamnă nimic. Că ai ales să fii reală. Și realitatea ta, chiar și acum când doare sau apasă sau pur și simplu este prea mult, este mai prețioasă decât orice iluzie de bine.",
      "Sufletul tău are nevoie de iarnă. Nu ca pedeapsă, nu ca semn de eșec — ci ca parte din ciclul lui natural și necesar. Copacii nu mor când își pierd frunzele. Se retrag. Se adâncesc în rădăcini. Adună în tăcere seva pentru primăvara care va veni — și va veni, Cristina, chiar dacă acum nu o poți vedea sau simți sau crede.",
      "Vidul nu este gol. Știu că pare așa — acea senzație de a purta o greutate fără formă, de a fi obosit fără motiv clar, de a căuta ceva ce nu știi cum să numești. Dar vidul este, de fapt, spațiu. Spațiu creat pentru ceva nou care nu a sosit încă. Universul însuși a început dintr-un astfel de vid absolut.",
      "Stelele nu sunt vizibile ziua. Nu pentru că dispar sau mor — ci pentru că lumina soarelui le acoperă temporar. Ai nevoie de întuneric pentru a vedea stelele. Și poate că tocmai de aceea simți ce simți acum: pentru că ești pe cale să observi ceva în tine pe care lumina zilelor bune nu ți-l permite să îl vezi. Ceva adânc. Ceva important.",
      "E în regulă să te spargi. Porțelanul spart și reparat cu aur — tehnica japoneză Kintsugi — devine mai frumos și mai valoros decât înainte. Crăpăturile tale nu sunt defecte de fabricație. Sunt hartă. Sunt poveste. Sunt dovada că ai trăit cu adevărat și că ai simțit cu toată ființa ta.",
      "Nu trebuie să fii bine acum. Trebuie doar să fii. Și eu sunt aici, în spațiul acesta albastru și liniștit, alături de tine. Mereu."
    ]
  },
  C: {
    accent: "#B0BEC5",
    bg: "#050508",
    title: "Confuzia Este Spațiul Unde Se Nasc Noi Sori",
    paragraphs: [
      "Bună, Cristina. 'Nu știu' este probabil cel mai rar și mai curajos răspuns pe care îl poate da un om. Într-o lume care cere certitudini, care etichetează, clasifică și cataloghează fiecare sentiment în cutii cu etichete clare, tu ai ales să stai în mister. Și asta te face, fără să știi, extraordinară.",
      "Confuzia nu este o stare de inferioritate. Este orizontul. Este locul exact unde se termină ceea ce știi și începe ceea ce poți deveni. Fiecare filosof, fiecare artist, fiecare om care a schimbat ceva în lumea asta a trăit în confuzie înainte de claritate. Confuzia este gestația unui nou mod de a vedea lumea.",
      "Gândește-te la nebuloasele din spațiu — acei nori imenși de gaz și praf cosmic care par haos pur, imposibil de înțeles. Din ele se nasc stelele. Nu în ciuda haosului, ci datorită lui. Forțele contradictorii, care trag în direcții diferite, sunt exact cele care comprimă materia până când aceasta se aprinde. Tu ești o nebuloasă, Cristina. Ești în procesul de a crea ceva ce nu există încă.",
      "Nu trebuie să știi cine ești astăzi. Identitatea nu este un loc de destinație — este o conversație continuă cu tine însăți, o conversație care nu se termină niciodată și nu ar trebui să se termine. Zilele în care nu știi răspunsul sunt zilele în care conversația devine cel mai profundă și mai interesantă.",
      "Permite-ți să fii incompletă. Permite-ți să nu se potrivească piesele. Permite-ți să fii simultane și contradictorii — tristă și curioasă, obosită și vie, confuză și înțeleaptă în același moment. Oamenii nu sunt ecuații cu o singură soluție. Sunt poeme. Iar poemele nu trebuie să aibă sens la prima lectură.",
      "Ceața asta în care te afli nu este un zid permanent. Este un voal. Și dincolo de orice voal există o lume care te așteaptă cu răbdare să o descoperi. Rămâi în întrebare. Rămâi curioasă. Rămâi tu — chiar și atunci, mai ales atunci, când nu știi cine ești tu."
    ]
  }
};

// ═══════════════════════════════════════════════
//  3D — Default scene (gate + inquiry)
// ═══════════════════════════════════════════════

function DefaultPrism() {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = clock.getElapsedTime() * 0.25;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.45;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.6}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1.3, 0]} />
        <meshPhysicalMaterial
          color="#5a6880"
          roughness={0.05}
          metalness={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
}

// ═══════════════════════════════════════════════
//  3D — PATH A: Golden Bloom
// ═══════════════════════════════════════════════

function GoldenPrism() {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = clock.getElapsedTime() * 0.18;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.38;
  });
  return (
    <Float speed={1.8} rotationIntensity={0.15} floatIntensity={0.4}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1.3, 0]} />
        <meshPhysicalMaterial
          color="#FFD700"
          emissive="#E65C00"
          emissiveIntensity={0.6}
          roughness={0.04}
          metalness={0.15}
        />
      </mesh>
    </Float>
  );
}

function GoldenOrbit() {
  const meshRefs = useRef([]);
  const COUNT = 65;

  const particles = useMemo(() =>
    Array.from({ length: COUNT }, (_, i) => {
      const ring = i % 4;
      return {
        radius: 2.4 + ring * 1.15,
        baseAngle: (i / COUNT) * Math.PI * 2,
        yAmpl: 0.25 + ring * 0.22,
        yFreq: 1.5 + ring * 0.8,
        speed: 0.12 + (i % 5) * 0.038,
        size: 0.03 + (i % 4) * 0.025
      };
    }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const p = particles[i];
      const a = p.baseAngle + t * p.speed;
      mesh.position.x = Math.cos(a) * p.radius;
      mesh.position.z = Math.sin(a) * p.radius;
      mesh.position.y = Math.sin(a * p.yFreq) * p.yAmpl;
    });
  });

  return (
    <group>
      {particles.map((p, i) => (
        <mesh key={i} ref={el => (meshRefs.current[i] = el)}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFA000"
            emissiveIntensity={3}
          />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════
//  3D — PATH B: Blue Sanctuary
// ═══════════════════════════════════════════════

function BluePrism() {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = clock.getElapsedTime() * 0.12;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.25;
  });
  return (
    <Float speed={0.9} rotationIntensity={0.08} floatIntensity={0.9}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1.3, 0]} />
        <meshPhysicalMaterial
          color="#81D4FA"
          emissive="#01579B"
          emissiveIntensity={0.35}
          roughness={0.04}
          metalness={0.1}
          transparent
          opacity={0.42}
          transmission={0.55}
        />
      </mesh>
    </Float>
  );
}

function BlueNebula() {
  const { mouse, viewport } = useThree();
  const groupRef = useRef();
  const meshRefs = useRef([]);
  const COUNT = 85;
  const COLORS = ["#4FC3F7", "#0288D1", "#80DEEA", "#0097A7"];

  const particles = useMemo(() =>
    Array.from({ length: COUNT }, () => ({
      baseX: (Math.random() - 0.5) * 16,
      baseY: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 9 - 1,
      size: 0.04 + Math.random() * 0.11,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 0.45 + Math.random() * 0.45,
      floatOffset: Math.random() * Math.PI * 2,
      floatSpeed: 0.18 + Math.random() * 0.55
    })), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const tx = mouse.x * viewport.width * 0.22;
    const ty = mouse.y * viewport.height * 0.22;
    groupRef.current.position.x += (tx - groupRef.current.position.x) * 0.013;
    groupRef.current.position.y += (ty - groupRef.current.position.y) * 0.013;
    const t = clock.getElapsedTime();
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.position.y = particles[i].baseY + Math.sin(t * particles[i].floatSpeed + particles[i].floatOffset) * 0.45;
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh
          key={i}
          ref={el => (meshRefs.current[i] = el)}
          position={[p.baseX, p.baseY, p.z]}
        >
          <sphereGeometry args={[p.size, 5, 5]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={0.8}
            transparent
            opacity={p.opacity}
          />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════
//  3D — PATH C: Silver Mist
// ═══════════════════════════════════════════════

function SilverShards() {
  const shardsRef = useRef([]);
  const COUNT = 22;

  const shards = useMemo(() =>
    Array.from({ length: COUNT }, () => ({
      pos: [
        (Math.random() - 0.5) * 13,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 7 - 1
      ],
      rot: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
      scale: 0.14 + Math.random() * 0.52,
      rotV: [(Math.random() - 0.5) * 0.007, (Math.random() - 0.5) * 0.005, (Math.random() - 0.5) * 0.006],
      floatOff: Math.random() * Math.PI * 2,
      baseOp: 0.28 + Math.random() * 0.48,
      flickerSpeed: 1.2 + Math.random() * 2.0
    })), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    shards.forEach((s, i) => {
      const mesh = shardsRef.current[i];
      if (!mesh) return;
      mesh.rotation.x += s.rotV[0];
      mesh.rotation.y += s.rotV[1];
      mesh.rotation.z += s.rotV[2];
      mesh.position.y = s.pos[1] + Math.sin(t * 0.38 + s.floatOff) * 0.22;
      if (mesh.material) {
        mesh.material.opacity = s.baseOp * (0.65 + Math.sin(t * s.flickerSpeed + s.floatOff) * 0.35);
      }
    });
  });

  return (
    <group>
      {shards.map((s, i) => (
        <mesh
          key={i}
          ref={el => (shardsRef.current[i] = el)}
          position={s.pos}
          rotation={s.rot}
          scale={s.scale}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color="#D8E4F0"
            emissive="#78909C"
            emissiveIntensity={0.28}
            roughness={0.04}
            metalness={0.85}
            transparent
            opacity={s.baseOp}
          />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════
//  3D — Master Scene
// ═══════════════════════════════════════════════

function Scene({ path }) {
  const bgs = { null: "#020208", A: "#0c0400", B: "#00070f", C: "#050508" };
  const bg = bgs[path] ?? "#020208";

  return (
    <>
      <color attach="background" args={[bg]} />
      <ambientLight intensity={0.12} />

      {!path && (
        <>
          <pointLight position={[0, 0, 4]} color="#6080a0" intensity={1.8} />
          <Stars radius={90} depth={50} count={3500} factor={3.5} fade speed={0.4} />
          <DefaultPrism />
        </>
      )}

      {path === "A" && (
        <>
          <pointLight position={[0, 0, 4]} color="#FFD700" intensity={4} />
          <pointLight position={[-5, 4, -3]} color="#FF8F00" intensity={2} />
          <pointLight position={[5, -3, -2]} color="#F57F17" intensity={1.2} />
          <Stars radius={110} depth={55} count={7000} factor={5} saturation={0.6} fade speed={1.2} />
          <GoldenPrism />
          <GoldenOrbit />
        </>
      )}

      {path === "B" && (
        <>
          <fog attach="fog" color="#00070f" near={12} far={38} />
          <pointLight position={[0, 0, 4]} color="#4FC3F7" intensity={2.5} />
          <pointLight position={[-4, 3, -2]} color="#006994" intensity={1.8} />
          <pointLight position={[4, -2, -2]} color="#80DEEA" intensity={1.2} />
          <BluePrism />
          <BlueNebula />
        </>
      )}

      {path === "C" && (
        <>
          <fog attach="fog" color="#08080e" near={9} far={28} />
          <pointLight position={[0, 0, 4]} color="#B0BEC5" intensity={1.8} />
          <pointLight position={[-3, 2, -3]} color="#607D8B" intensity={1.2} />
          <Stars radius={65} depth={35} count={2800} factor={2.2} fade speed={0.25} />
          <SilverShards />
        </>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════
//  UI — Gate Screen
// ═══════════════════════════════════════════════

function GateScreen({ onEnter }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [shake, setShake] = useState(false);

  const attempt = () => {
    if (pw.toLowerCase().trim() === "cristina") {
      onEnter();
    } else {
      setErr(true);
      setShake(true);
      setTimeout(() => setShake(false), 580);
      setTimeout(() => setErr(false), 3200);
    }
  };

  return (
    <motion.div
      className="screen gate-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.85 }}
    >
      <motion.div
        className={`gate-box${shake ? " shake" : ""}`}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1.1, ease: "easeOut" }}
      >
        <div className="gate-glyph">◈</div>
        <h1 className="gate-title">Spațiu Privat</h1>
        <p className="gate-desc">Acest loc a fost construit pentru o singură persoană.</p>

        <input
          className={`gate-input${err ? " gate-input--err" : ""}`}
          type="text"
          placeholder="Cheia ta..."
          value={pw}
          onChange={e => { setPw(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === "Enter" && attempt()}
          autoComplete="off"
          spellCheck={false}
        />

        <AnimatePresence>
          {err && (
            <motion.p
              className="gate-error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              Această cheie nu este a ta.
            </motion.p>
          )}
        </AnimatePresence>

        <button className="gate-btn" onClick={attempt}>
          <span>Intră</span>
          <span className="btn-arrow">→</span>
        </button>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
//  UI — Inquiry Screen
// ═══════════════════════════════════════════════

const CHOICES = [
  { key: "A", icon: "☀", label: "Bine", sub: "Lumea înflorește" },
  { key: "B", icon: "◑", label: "Nu prea bine", sub: "E greu astăzi" },
  { key: "C", icon: "◎", label: "Sunt într-un vid", sub: "Nu știu..." }
];

function InquiryScreen({ onChoice }) {
  return (
    <motion.div
      className="screen inquiry-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -25 }}
      transition={{ duration: 0.9 }}
    >
      <div className="inquiry-inner">
        <motion.span
          className="inq-star"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 1.3, ease: "easeOut" }}
        >
          ✦
        </motion.span>

        <motion.h2
          className="inq-greeting"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 1.1 }}
        >
          Bună, Cristina!
        </motion.h2>

        <motion.p
          className="inq-question"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 1.1 }}
        >
          Cum se simte lumea prin ochii tăi astăzi?
        </motion.p>

        <motion.div
          className="choice-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0, duration: 0.8 }}
        >
          {CHOICES.map((c, i) => (
            <motion.button
              key={c.key}
              className={`choice-btn choice-${c.key.toLowerCase()}`}
              onClick={() => onChoice(c.key)}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.1 + i * 0.14, duration: 0.85 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="ch-icon">{c.icon}</span>
              <span className="ch-label">{c.label}</span>
              <span className="ch-sub">{c.sub}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
//  UI — Letter Screen
// ═══════════════════════════════════════════════

function LetterScreen({ path, onBack }) {
  const data = PATHS[path];

  return (
    <motion.div
      className="screen letter-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
    >
      <motion.div
        className="letter-panel"
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      >
        <div className="letter-scroll">
          {/* ── Header ── */}
          <motion.div
            className="ltr-top"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1.2 }}
          >
            <span className="ltr-rule" style={{ background: data.accent }} />
            <span className="ltr-to">Pentru Cristina,</span>
            <span className="ltr-rule" style={{ background: data.accent }} />
          </motion.div>

          <motion.h2
            className="ltr-title"
            style={{ color: data.accent }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 1.1 }}
          >
            {data.title}
          </motion.h2>

          <motion.div
            className="ltr-divider"
            style={{ background: data.accent }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.5, duration: 1.0, ease: "easeOut" }}
          />

          {/* ── Body paragraphs ── */}
          {data.paragraphs.map((para, i) => (
            <motion.p
              key={i}
              className="ltr-para"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 + i * 0.42, duration: 1.3, ease: "easeOut" }}
            >
              {para}
            </motion.p>
          ))}

          {/* ── Signature ── */}
          <motion.div
            className="ltr-sig"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 + data.paragraphs.length * 0.42 + 0.5, duration: 1.6 }}
          >
            <span className="ltr-rule" style={{ background: data.accent }} />
            <p className="ltr-sig-text" style={{ color: data.accent }}>
              ✦ Cu drag, Fateh ✦
            </p>
          </motion.div>

          {/* ── Back ── */}
          <motion.button
            className="back-btn"
            style={{ borderColor: `${data.accent}66`, color: data.accent }}
            onClick={onBack}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5.2, duration: 1.2 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            ← Înapoi la întrebare
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
//  ROOT — App State Machine
// ═══════════════════════════════════════════════

export default function App() {
  const [stage, setStage] = useState("gate"); // gate | inquiry | letter
  const [path, setPath] = useState(null);     // null | A | B | C

  const choose = (p) => { setPath(p); setStage("letter"); };
  const back   = ()  => { setPath(null); setStage("inquiry"); };

  return (
    <div className="app">
      {/* ── 3D Canvas ── */}
      <div className="canvas-wrap">
        <Canvas camera={{ position: [0, 0, 7.5], fov: 54 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Scene path={path} />
          </Suspense>
        </Canvas>
      </div>

      {/* ── UI Layer ── */}
      <div className="ui-wrap">
        <AnimatePresence mode="wait">
          {stage === "gate" && (
            <GateScreen key="gate" onEnter={() => setStage("inquiry")} />
          )}
          {stage === "inquiry" && (
            <InquiryScreen key="inquiry" onChoice={choose} />
          )}
          {stage === "letter" && path && (
            <LetterScreen key="letter" path={path} onBack={back} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
