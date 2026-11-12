const STORAGE_KEY = 'latihan-tka-results';

const questions = [
  {
    id: 1,
    question: 'Manakah yang termasuk kata baku?',
    options: ['Aktifitas', 'Aktivitas', 'Aktifitas', 'Aktifiitas'],
    answer: 'Aktivitas',
    explanation: 'Kata baku yang benar adalah “aktivitas”.'
  },
  {
    id: 2,
    question: 'Sebuah teks yang bertujuan menjelaskan suatu proses disebut...',
    options: ['Narasi', 'Deskripsi', 'Eksplanasi', 'Argumentasi'],
    answer: 'Eksplanasi',
    explanation: 'Teks eksplanasi menjelaskan proses atau sebab-akibat suatu fenomena.'
  },
  {
    id: 3,
    question: 'Berikut ini yang merupakan antonim dari “rajin” adalah...',
    options: ['Tekun', 'Gigih', 'Malas', 'Cermat'],
    answer: 'Malas',
    explanation: 'Antonim dari “rajin” adalah “malas”.'
  },
  {
    id: 4,
    question: 'Kalimat yang tepat untuk menutup surat resmi adalah...',
    options: [
      'Terima kasih banyak.',
      'Semoga sehat selalu.',
      'Demikian surat ini saya sampaikan, atas perhatian Bapak/Ibu saya ucapkan terima kasih.',
      'Sampai jumpa.'
    ],
    answer: 'Demikian surat ini saya sampaikan, atas perhatian Bapak/Ibu saya ucapkan terima kasih.',
    explanation: 'Kalimat penutup surat resmi yang tepat dan formal adalah pilihan tersebut.'
  },
  {
    id: 5,
    question: 'Sumber daya alam yang dapat diperbarui adalah...',
    options: ['Minyak bumi', 'Gas alam', 'Hutan', 'Batubara'],
    answer: 'Hutan',
    explanation: 'Hutan merupakan sumber daya alam yang dapat diperbarui jika dikelola dengan bijak.'
  }
];

const state = {
  currentIndex: 0,
  answers: {},
  startTime: null,
  timerInterval: null,
  currentStudent: null,
  resultData: null
};

const studentForm = document.getElementById('studentForm');
const quizSection = document.getElementById('quizSection');
const resultSection = document.getElementById('resultSection');
const questionBox = document.getElementById('questionBox');
const answersList = document.getElementById('answersList');
const questionCounter = document.getElementById('questionCounter');
const timerLabel = document.getElementById('timerLabel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const startQuizBtn = document.getElementById('startQuizBtn');
const resultName = document.getElementById('resultName');
const resultClass = document.getElementById('resultClass');
const resultScore = document.getElementById('resultScore');
const resultCorrect = document.getElementById('resultCorrect');
const newQuizBtn = document.getElementById('newQuizBtn');
const classFilter = document.getElementById('classFilter');
const totalStudents = document.getElementById('totalStudents');
const avgScore = document.getElementById('avgScore');
const resultTableBody = document.getElementById('resultTableBody');
const resetDataBtn = document.getElementById('resetDataBtn');

function getSavedResults() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveResults(results) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function startTimer() {
  state.startTime = Date.now();
  state.timerInterval = setInterval(() => {
    const elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
    timerLabel.textContent = `Waktu: ${formatTime(elapsedSeconds)}`;
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function renderQuestion() {
  const q = questions[state.currentIndex];
  questionCounter.textContent = `Soal ${state.currentIndex + 1}/${questions.length}`;

  questionBox.innerHTML = `
    <h3>${q.question}</h3>
  `;

  answersList.innerHTML = q.options
    .map(
      (option, index) => `
        <label class="answer-option ${state.answers[q.id] === option ? 'selected' : ''}">
          <input type="radio" name="answer-${q.id}" value="${option}" ${state.answers[q.id] === option ? 'checked' : ''} />
          <span>${String.fromCharCode(65 + index)}. ${option}</span>
        </label>
      `
    )
    .join('');

  answersList.querySelectorAll('input').forEach((input) => {
    input.addEventListener('change', (event) => {
      state.answers[q.id] = event.target.value;
      renderQuestion();
    });
  });

  prevBtn.disabled = state.currentIndex === 0;
  prevBtn.style.opacity = state.currentIndex === 0 ? '0.5' : '1';

  const isLast = state.currentIndex === questions.length - 1;
  nextBtn.classList.toggle('hidden', isLast);
  submitBtn.classList.toggle('hidden', !isLast);
}

function submitQuiz() {
  const totalQuestions = questions.length;
  let correct = 0;

  questions.forEach((q) => {
    if (state.answers[q.id] === q.answer) {
      correct += 1;
    }
  });

  const score = Math.round((correct / totalQuestions) * 100);
  const elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);

  const result = {
    id: Date.now(),
    name: state.currentStudent.name,
    kelas: state.currentStudent.kelas,
    score,
    correct,
    total: totalQuestions,
    duration: formatTime(elapsedSeconds),
    date: new Date().toLocaleDateString('id-ID'),
    answers: questions.map((q) => ({
      question: q.question,
      jawabanSiswa: state.answers[q.id] || '-',
      jawabanBenar: q.answer,
      benar: state.answers[q.id] === q.answer,
      explanation: q.explanation
    }))
  };

  const results = getSavedResults();
  results.push(result);
  saveResults(results);

  state.resultData = result;

  resultName.textContent = result.name;
  resultClass.textContent = result.kelas;
  resultScore.textContent = `${result.score}/100`;
  resultCorrect.textContent = `${result.correct}/${result.total}`;

  quizSection.classList.add('hidden');
  resultSection.classList.remove('hidden');
  stopTimer();
  renderTeacherData();
}

function resetStudentState() {
  state.currentIndex = 0;
  state.answers = {};
  state.currentStudent = null;
  state.resultData = null;
  stopTimer();
  questionCounter.textContent = 'Soal 1/5';
  timerLabel.textContent = 'Waktu: 00:00';
}

function startQuiz() {
  const name = document.getElementById('studentName').value.trim();
  const kelas = document.getElementById('studentClass').value;

  if (!name) {
    alert('Nama siswa harus diisi.');
    return;
  }

  state.currentStudent = { name, kelas };
  studentForm.classList.add('hidden');
  quizSection.classList.remove('hidden');
  resultSection.classList.add('hidden');
  state.currentIndex = 0;
  state.answers = {};
  renderQuestion();
  startTimer();
}

function openDetail(result) {
  const template = document.getElementById('detailTemplate');
  const clone = template.content.cloneNode(true);
  const content = clone.querySelector('.detail-content');

  const detailList = result.answers
    .map(
      (item) => `
        <div class="detail-item">
          <strong>${item.question}</strong>
          <div>Jawaban siswa: ${item.jawabanSiswa}</div>
          <div>Jawaban benar: ${item.jawabanBenar}</div>
          <div class="detail-status">${item.benar ? '✅ Benar' : '❌ Salah'}</div>
          <div>${item.explanation}</div>
        </div>
      `
    )
    .join('');

  content.innerHTML = `
    <p><strong>Nama:</strong> ${result.name}</p>
    <p><strong>Kelas:</strong> ${result.kelas}</p>
    <p><strong>Skor:</strong> ${result.score}/100</p>
    <p><strong>Benar:</strong> ${result.correct}/${result.total}</p>
    <p><strong>Durasi:</strong> ${result.duration}</p>
    ${detailList}
  `;

  const closeBtn = clone.querySelector('.close-modal');
  closeBtn.addEventListener('click', () => {
    clone.querySelector('.detail-modal').remove();
  });

  clone.querySelector('.detail-modal').addEventListener('click', (event) => {
    if (event.target.classList.contains('detail-modal')) {
      event.target.remove();
    }
  });

  document.body.appendChild(clone);
}

function renderTeacherData() {
  const results = getSavedResults();
  const selectedClass = classFilter.value;
  const filtered = selectedClass === 'all' ? results : results.filter((item) => item.kelas === selectedClass);

  totalStudents.textContent = String(filtered.length);
  const avg = filtered.length
    ? Math.round(filtered.reduce((sum, item) => sum + item.score, 0) / filtered.length)
    : 0;
  avgScore.textContent = `${avg}`;

  if (!filtered.length) {
    resultTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:#6b7280; padding:20px;">Belum ada data siswa.</td>
      </tr>
    `;
    return;
  }

  resultTableBody.innerHTML = filtered
    .slice()
    .sort((a, b) => b.score - a.score)
    .map(
      (result) => `
        <tr>
          <td>${result.name}</td>
          <td>${result.kelas}</td>
          <td>${result.score}</td>
          <td>${result.correct}/${result.total}</td>
          <td><button class="detail-btn" data-id="${result.id}">Lihat</button></td>
        </tr>
      `
    )
    .join('');

  resultTableBody.querySelectorAll('.detail-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = results.find((item) => String(item.id) === btn.dataset.id);
      if (target) openDetail(target);
    });
  });
}

startQuizBtn.addEventListener('click', startQuiz);
prevBtn.addEventListener('click', () => {
  if (state.currentIndex > 0) {
    state.currentIndex -= 1;
    renderQuestion();
  }
});

nextBtn.addEventListener('click', () => {
  if (state.currentIndex < questions.length - 1) {
    state.currentIndex += 1;
    renderQuestion();
  }
});

submitBtn.addEventListener('click', submitQuiz);
newQuizBtn.addEventListener('click', () => {
  resetStudentState();
  studentForm.classList.remove('hidden');
  document.getElementById('studentName').value = '';
  resultSection.classList.add('hidden');
});

classFilter.addEventListener('change', renderTeacherData);

resetDataBtn.addEventListener('click', () => {
  if (confirm('Yakin ingin menghapus semua data hasil siswa?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderTeacherData();
  }
});

renderTeacherData();
