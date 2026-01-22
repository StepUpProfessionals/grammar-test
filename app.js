const STATE = {
  data: null,
  index: 0,
  answers: [], // guarda answerIndex elegido (o null)
};

const el = (id) => document.getElementById(id);

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

async function loadQuestions(){
  const res = await fetch("questions.es.json");
  if(!res.ok) throw new Error("No se pudo cargar questions.es.json");
  const data = await res.json();
  STATE.data = data;
  STATE.answers = Array(data.questions.length).fill(null);
}

function render(){
  const qList = STATE.data.questions;
  const total = qList.length;
  const i = clamp(STATE.index, 0, total - 1);
  const q = qList[i];

  el("progressText").textContent = `Pregunta ${i+1}/${total}`;
  el("progressBar").style.width = `${Math.round(((i+1)/total)*100)}%`;

  el("questionTitle").textContent = q.question;
  el("questionHint").textContent = q.hint ? q.hint : "";

  const optionsWrap = el("options");
  optionsWrap.innerHTML = "";

  q.options.forEach((opt, idx) => {
    const div = document.createElement("label");
    div.className = "option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "opt";
    input.checked = (STATE.answers[i] === idx);

    const span = document.createElement("span");
    span.textContent = opt;

    div.appendChild(input);
    div.appendChild(span);

    if (STATE.answers[i] === idx) div.classList.add("selected");

    div.addEventListener("click", () => {
      STATE.answers[i] = idx;
      render(); // re-render para marcar seleccionado
    });

    optionsWrap.appendChild(div);
  });

  // botones
  el("backBtn").disabled = (i === 0);
  const hasAnswer = STATE.answers[i] !== null;
  el("nextBtn").disabled = !hasAnswer;

  // si es última pregunta, cambia texto del botón
  el("nextBtn").textContent = (i === total - 1) ? "Ver resultado" : "Siguiente";
}

function score(){
  const qList = STATE.data.questions;
  let correct = 0;
  qList.forEach((q, i) => {
    if (STATE.answers[i] === q.answerIndex) correct++;
  });
  return { correct, total: qList.length, percent: Math.round((correct / qList.length) * 100) };
}

function routeFromPercent(p){
  // MVP: 3 rutas
  if (p >= 80) {
  return {
    title: "Ruta recomendada: Consolidación (Intermedio/Avanzado)",
    desc: "Su base gramatical es sólida. Enfóquese en precisión, estructuras avanzadas y producción oral/escrita con retroalimentación.",
    ctaText: "Ir a Recursos de Consolidación",
    ctaUrl: "https://stepuplanguages.com/centro-de-recursos"
  };
}
if (p >= 50) {
  return {
    title: "Ruta recomendada: Gramática funcional (Intermedio)",
    desc: "Usted tiene una base útil, pero hay vacíos frecuentes. Trabaje tiempos verbales, conectores y estructuras comunes de trabajo.",
    ctaText: "Ver ruta de Gramática Funcional",
    ctaUrl: "https://stepuplanguages.com/diagnostico"
  };
}
return {
  title: "Ruta recomendada: Fundamentos (Básico)",
  desc: "Usted necesita fortalecer estructuras base (to be, present simple, preguntas y negaciones). Con una ruta guiada, avanza más rápido.",
  ctaText: "Agendar una llamada breve",
ctaUrl: "https://wa.me/573167850234?text=Hola%2C%20realic%C3%A9%20el%20test%20de%20gram%C3%A1tica%20y%20quisiera%20una%20recomendaci%C3%B3n%20de%20ruta."
};

}

function showResult(){
  const s = score();
  el("scoreText").textContent = `Puntaje: ${s.correct}/${s.total} — ${s.percent}%`;

  const r = routeFromPercent(s.percent);
  el("routeTitle").textContent = r.title;
  el("routeDesc").textContent = r.desc;
  el("ctaBtn").textContent = r.ctaText;
  el("ctaBtn").href = r.ctaUrl;

  el("card").classList.add("hidden");
  el("result").classList.remove("hidden");
}

function restart(){
  STATE.index = 0;
  STATE.answers = Array(STATE.data.questions.length).fill(null);
  el("result").classList.add("hidden");
  el("card").classList.remove("hidden");
  render();
}

function bind(){
  el("backBtn").addEventListener("click", () => {
    STATE.index = clamp(STATE.index - 1, 0, STATE.data.questions.length - 1);
    render();
  });

  el("nextBtn").addEventListener("click", () => {
    const last = STATE.data.questions.length - 1;
    if (STATE.index === last) {
      showResult();
      return;
    }
    STATE.index = clamp(STATE.index + 1, 0, last);
    render();
  });

  el("restartBtn").addEventListener("click", restart);
}

(async function init(){
  try{
    await loadQuestions();
    bind();
    render();
  }catch(err){
    console.error(err);
    el("questionTitle").textContent = "Error cargando el test.";
    el("questionHint").textContent = "Verifica que questions.es.json exista en el repo.";
  }
})();

