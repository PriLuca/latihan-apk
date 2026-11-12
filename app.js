const STORAGE_KEY = 'ruang-tka-results-v1';
const EXAM_SECONDS = 20 * 60;
const questions = [
  { id: 'q1', type: 'single', label: 'Pilihan ganda', text: 'Hasil dari 18 × 4 adalah ...', options: ['62', '72', '74', '82'], answer: '72', explanation: '18 × 4 = 72.' },
  { id: 'q2', type: 'multiple', label: 'Pilihan ganda kompleks', text: 'Pilih semua bilangan prima berikut.', hint: 'Jawaban benar bisa lebih dari satu.', options: ['2', '9', '11', '15'], answer: ['2', '11'], explanation: 'Bilangan prima hanya memiliki dua faktor. 2 dan 11 adalah bilangan prima.' },
  { id: 'q3', type: 'truefalse', label: 'Benar atau salah', text: 'Tentukan benar atau salah untuk setiap pernyataan.', statements: [{ text: 'Segitiga memiliki tiga sisi.', answer: 'Benar' }, { text: 'Bilangan 1 adalah bilangan prima.', answer: 'Salah' }, { text: '100 sentimeter sama dengan 1 meter.', answer: 'Benar' }], explanation: 'Segitiga mempunyai tiga sisi; 1 bukan bilangan prima; 100 cm sama dengan 1 m.' },
  { id: 'q4', type: 'single', label: 'Pilihan ganda', text: 'Sinonim kata “cermat” adalah ...', options: ['Teliti', 'Lalai', 'Ragu', 'Lambat'], answer: 'Teliti', explanation: 'Cermat memiliki arti teliti atau saksama.' },
  { id: 'q5', type: 'multiple', label: 'Pilihan ganda kompleks', text: 'Pilih pernyataan yang benar tentang sumber energi terbarukan.', hint: 'Pilih semua jawaban yang benar.', options: ['Matahari dapat dimanfaatkan sebagai sumber energi.', 'Batu bara termasuk energi terbarukan.', 'Angin dapat digunakan untuk menghasilkan listrik.', 'Energi air tidak dapat diperbarui.'], answer: ['Matahari dapat dimanfaatkan sebagai sumber energi.', 'Angin dapat digunakan untuk menghasilkan listrik.'], explanation: 'Matahari dan angin merupakan sumber energi terbarukan.' },
  { id: 'q6', type: 'truefalse', label: 'Benar atau salah', text: 'Tentukan benar atau salah untuk setiap pernyataan.', statements: [{ text: 'Air membeku pada suhu 0°C dalam kondisi normal.', answer: 'Benar' }, { text: 'Matahari mengelilingi Bumi.', answer: 'Salah' }, { text: 'Tumbuhan membutuhkan cahaya untuk fotosintesis.', answer: 'Benar' }], explanation: 'Dalam kondisi normal air membeku pada 0°C. Bumi mengelilingi Matahari, dan cahaya dibutuhkan dalam fotosintesis.' }
];

const $ = (id) => document.getElementById(id);
const state = { index: 0, answers: {}, student: null, startedAt: null, remaining: EXAM_SECONDS, timer: null, submitted: false };
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const getResults = () => { try { const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(data) ? data : []; } catch { return []; } };
const setResults = (results) => localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
const answerText = (question, answer) => {
  if (!answer || (Array.isArray(answer) && answer.length === 0)) return 'Belum dijawab';
  if (question.type === 'truefalse') return question.statements.map((item, index) => `${index + 1}. ${answer[index] || '—'}`).join(' · ');
  return Array.isArray(answer) ? answer.join(', ') : answer;
};

function switchMode(mode) {
  document.querySelectorAll('.mode-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.mode === mode));
  $('studentView').classList.toggle('hidden', mode !== 'student');
  $('teacherView').classList.toggle('hidden', mode !== 'teacher');
  if (mode === 'teacher') renderTeacherData();
}

document.querySelectorAll('.mode-tab').forEach((tab) => tab.addEventListener('click', () => switchMode(tab.dataset.mode)));

function renderQuestion() {
  const question = questions[state.index];
  $('questionCounter').textContent = `Soal ${state.index + 1} dari ${questions.length}`;
  $('progressBar').style.width = `${((state.index + 1) / questions.length) * 100}%`;
  $('questionBox').innerHTML = `<p class="question-type">${escapeHTML(question.label)}</p><h3>${escapeHTML(question.text)}</h3>${question.hint ? `<p>${escapeHTML(question.hint)}</p>` : ''}`;

  if (question.type === 'truefalse') {
    const selected = state.answers[question.id] || [];
    $('answersList').innerHTML = question.statements.map((item, index) => `<div class="tf-option"><strong>${index + 1}. ${escapeHTML(item.text)}</strong>${['Benar', 'Salah'].map((value) => `<label class="tf-choice ${selected[index] === value ? 'selected' : ''}"><input type="radio" name="${question.id}-${index}" value="${value}" ${selected[index] === value ? 'checked' : ''}>${value}</label>`).join('')}</div>`).join('');
    question.statements.forEach((_, index) => $('answersList').querySelectorAll(`input[name="${question.id}-${index}"]`).forEach((input) => input.addEventListener('change', (event) => {
      const answers = [...(state.answers[question.id] || Array(question.statements.length).fill(null))];
      answers[index] = event.target.value;
      state.answers[question.id] = answers;
      renderQuestion();
    })));
  } else {
    const isMultiple = question.type === 'multiple';
    const selected = state.answers[question.id] || (isMultiple ? [] : '');
    $('answersList').innerHTML = question.options.map((option, index) => {
      const checked = isMultiple ? selected.includes(option) : selected === option;
      return `<label class="answer-option ${checked ? 'selected' : ''}"><input type="${isMultiple ? 'checkbox' : 'radio'}" name="${question.id}" value="${escapeHTML(option)}" ${checked ? 'checked' : ''}><span><span class="option-letter">${String.fromCharCode(65 + index)}</span>${escapeHTML(option)}</span></label>`;
    }).join('');
    $('answersList').querySelectorAll('input').forEach((input) => input.addEventListener('change', (event) => {
      if (isMultiple) {
        const current = state.answers[question.id] || [];
        state.answers[question.id] = event.target.checked ? [...current, event.target.value] : current.filter((value) => value !== event.target.value);
      } else state.answers[question.id] = event.target.value;
      renderQuestion();
    }));
  }
  $('prevBtn').disabled = state.index === 0;
  $('nextBtn').classList.toggle('hidden', state.index === questions.length - 1);
  $('submitBtn').classList.toggle('hidden', state.index !== questions.length - 1);
}

function isCorrect(question) {
  const given = state.answers[question.id];
  if (question.type === 'multiple') return Array.isArray(given) && given.length === question.answer.length && question.answer.every((answer) => given.includes(answer));
  if (question.type === 'truefalse') return Array.isArray(given) && question.statements.every((statement, index) => given[index] === statement.answer);
  return given === question.answer;
}

function getAnswerDetails() {
  return questions.map((question) => ({
    question: question.text,
    type: question.label,
    studentAnswer: answerText(question, state.answers[question.id]),
    correctAnswer: question.type === 'truefalse' ? question.statements.map((item, index) => `${index + 1}. ${item.answer}`).join(' · ') : answerText(question, question.answer),
    correct: isCorrect(question),
    explanation: question.explanation
  }));
}

function submitQuiz() {
  if (state.submitted) return;
  state.submitted = true;
  clearInterval(state.timer);
  const details = getAnswerDetails();
  const correct = details.filter((item) => item.correct).length;
  const completedAt = new Date();
  const durationSeconds = Math.max(0, EXAM_SECONDS - state.remaining);
  const result = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: state.student.name,
    kelas: state.student.kelas,
    score: Math.round(correct / questions.length * 100),
    correct,
    total: questions.length,
    duration: formatTime(durationSeconds),
    completedAt: completedAt.toISOString(),
    date: completedAt.toLocaleDateString('id-ID'),
    answers: details
  };
  const results = getResults();
  results.push(result);
  setResults(results);
  $('resultName').textContent = result.name;
  $('resultClass').textContent = result.kelas;
  $('resultScore').textContent = String(result.score);
  $('resultCorrect').textContent = `${result.correct} dari ${result.total}`;
  $('resultDuration').textContent = result.duration;
  $('quizSection').classList.add('hidden');
  $('resultSection').classList.remove('hidden');
  renderTeacherData();
}

function startQuiz() {
  const name = $('studentName').value.trim();
  if (!name) { $('studentName').focus(); alert('Nama lengkap perlu diisi terlebih dahulu.'); return; }
  state.index = 0;
  state.answers = {};
  state.student = { name, kelas: $('studentClass').value };
  state.startedAt = Date.now();
  state.remaining = EXAM_SECONDS;
  state.submitted = false;
  $('studentForm').classList.add('hidden');
  $('resultSection').classList.add('hidden');
  $('quizSection').classList.remove('hidden');
  $('timerLabel').textContent = `◷ ${formatTime(state.remaining)}`;
  $('timerLabel').classList.remove('warning');
  renderQuestion();
  state.timer = setInterval(() => {
    state.remaining = Math.max(0, EXAM_SECONDS - Math.floor((Date.now() - state.startedAt) / 1000));
    $('timerLabel').textContent = `◷ ${formatTime(state.remaining)}`;
    $('timerLabel').classList.toggle('warning', state.remaining <= 120);
    if (state.remaining <= 0) { alert('Waktu latihan habis. Jawaban akan dikumpulkan.'); submitQuiz(); }
  }, 250);
}

function renderTeacherData() {
  const results = getResults();
  const selectedClass = $('classFilter').value;
  const filtered = results.filter((item) => selectedClass === 'all' || item.kelas === selectedClass).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  $('totalStudents').textContent = String(filtered.length);
  $('avgScore').textContent = filtered.length ? String(Math.round(filtered.reduce((sum, item) => sum + item.score, 0) / filtered.length)) : '0';
  $('topScore').textContent = filtered.length ? String(Math.max(...filtered.map((item) => item.score))) : '0';
  $('lastUpdated').textContent = filtered.length ? `Pembaruan terakhir: ${new Date(filtered[0].completedAt).toLocaleString('id-ID')}` : '';
  if (!filtered.length) {
    $('resultTableBody').innerHTML = '<tr><td class="empty-row" colspan="7">Belum ada hasil. Minta siswa menyelesaikan latihan terlebih dahulu.</td></tr>';
    return;
  }
  $('resultTableBody').innerHTML = filtered.map((result) => `<tr><td class="student-name">${escapeHTML(result.name)}</td><td>${escapeHTML(result.kelas)}</td><td>${escapeHTML(result.date)}</td><td><span class="score-pill">${Number(result.score)}/100</span></td><td>${Number(result.correct)}/${Number(result.total)}</td><td>${escapeHTML(result.duration)}</td><td><button class="detail-btn" data-result-id="${escapeHTML(result.id)}">Detail</button></td></tr>`).join('');
  $('resultTableBody').querySelectorAll('.detail-btn').forEach((button) => button.addEventListener('click', () => {
    const result = getResults().find((item) => item.id === button.dataset.resultId);
    if (result) openDetail(result);
  }));
}

function openDetail(result) {
  const answerRows = result.answers.map((item, index) => `<article class="detail-answer"><h4>${index + 1}. ${escapeHTML(item.question)} <span class="muted">· ${escapeHTML(item.type)}</span></h4><p>Jawaban siswa: ${escapeHTML(item.studentAnswer)}</p><p>Jawaban benar: ${escapeHTML(item.correctAnswer)}</p><p class="${item.correct ? 'correct' : 'incorrect'}"><strong>${item.correct ? '✓ Benar' : '✕ Salah'}</strong></p><p class="explanation">Pembahasan: ${escapeHTML(item.explanation)}</p></article>`).join('');
  $('modalRoot').innerHTML = `<div class="modal-backdrop" role="presentation"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="detailTitle"><div class="modal-head"><h2 id="detailTitle">Detail pengerjaan</h2><button class="close-btn" aria-label="Tutup">×</button></div><p class="detail-summary"><strong>${escapeHTML(result.name)}</strong> · Kelas ${escapeHTML(result.kelas)} · Nilai ${Number(result.score)}/100 · ${escapeHTML(result.duration)}</p>${answerRows}</section></div>`;
  $('modalRoot').querySelector('.close-btn').addEventListener('click', () => { $('modalRoot').innerHTML = ''; });
  $('modalRoot').querySelector('.modal-backdrop').addEventListener('click', (event) => { if (event.target.classList.contains('modal-backdrop')) $('modalRoot').innerHTML = ''; });
  document.addEventListener('keydown', function closeOnEscape(event) { if (event.key === 'Escape') { $('modalRoot').innerHTML = ''; document.removeEventListener('keydown', closeOnEscape); } });
}

function exportCSV() {
  const selectedClass = $('classFilter').value;
  const filtered = getResults().filter((item) => selectedClass === 'all' || item.kelas === selectedClass);
  if (!filtered.length) { alert('Belum ada data untuk diunduh.'); return; }
  const rows = [['Nama siswa', 'Kelas', 'Tanggal', 'Nilai', 'Benar', 'Jumlah soal', 'Durasi'], ...filtered.map((item) => [item.name, item.kelas, item.date, item.score, item.correct, item.total, item.duration])];
  const csv = '\ufeff' + rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  link.download = `rekap-nilai-tka-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

$('startQuizBtn').addEventListener('click', startQuiz);
$('prevBtn').addEventListener('click', () => { if (state.index > 0) { state.index--; renderQuestion(); } });
$('nextBtn').addEventListener('click', () => { if (state.index < questions.length - 1) { state.index++; renderQuestion(); } });
$('submitBtn').addEventListener('click', () => { const unanswered = questions.filter((question) => {
  const answer = state.answers[question.id];
  return !answer || (Array.isArray(answer) && (answer.length === 0 || answer.some((item) => !item)));
});
  if (unanswered.length && !confirm(`Masih ada ${unanswered.length} soal yang belum lengkap. Kumpulkan sekarang?`)) return;
  submitQuiz();
});
$('newQuizBtn').addEventListener('click', () => { $('studentForm').classList.remove('hidden'); $('resultSection').classList.add('hidden'); $('studentName').value = ''; $('studentName').focus(); });
$('classFilter').addEventListener('change', renderTeacherData);
$('exportBtn').addEventListener('click', exportCSV);
window.addEventListener('storage', (event) => { if (event.key === STORAGE_KEY) renderTeacherData(); });
renderTeacherData();
