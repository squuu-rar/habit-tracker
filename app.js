// Habit Tracker JavaScript

const MAX_LENGTH = 50;
const STORAGE_KEY = 'habitTrackerData';

// DOM Elements
const habitInput = document.getElementById('habitInput');
const addBtn = document.getElementById('addBtn');
const habitsList = document.getElementById('habitsList');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const progressBar = document.getElementById('progressBar');
const progressPercentage = document.getElementById('progressPercentage');
const completedCountEl = document.getElementById('completedCount');
const totalCountEl = document.getElementById('totalCount');
const streakValueEl = document.getElementById('streakValue');

let habits = [];
let streak = 0;
let lastStreakDate = null;

// Utility: save to localStorage
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ habits, streak, lastStreakDate }));
}

// Utility: load from localStorage
function loadState() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return;
  try {
    const obj = JSON.parse(data);
    habits = obj.habits || [];
    streak = obj.streak || 0;
    lastStreakDate = obj.lastStreakDate || null;
  } catch (e) {
    console.warn('Failed to parse habitTrackerData', e);
  }
}

function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function updateStreak() {
  const today = new Date();
  const todayStr = formatDate(today);

  if (lastStreakDate === todayStr) {
    return; // already updated today
  }

  if (lastStreakDate === null ||
      new Date(lastStreakDate) >= new Date(todayStr) - 86400000) {
    // consecutive day or first run
    streak++;
    lastStreakDate = todayStr;
  } else {
    // streak broken
    streak = 0;
    lastStreakDate = todayStr;
  }
  streakValueEl.textContent = streak;
}

function renderHabit(item) {
  const li = document.createElement('li');
  const chk = document.createElement('input');
  chk.type = 'checkbox';
  chk.className = 'habit-checkbox';
  chk.checked = item.completed;
  chk.addEventListener('change', () => {
    item.completed = chk.checked;
    li.querySelector('.habit-text').classList.toggle('completed', item.completed);
    saveState();
    updateProgress();
  });

  const span = document.createElement('span');
  span.className = 'habit-text';
  span.textContent = item.text;
  span.classList.toggle('completed', item.completed);

  const rm = document.createElement('button');
  rm.className = 'remove-btn';
  rm.textContent = '✕';
  rm.addEventListener('click', () => {
    habits = habits.filter(h => h !== item);
    li.remove();
    if (habitsList.children.length === 0) showEmptyState();
    saveState();
    updateProgress();
  });

  li.appendChild(chk);
  li.appendChild(span);
  li.appendChild(rm);
  habitsList.appendChild(li);
}

function showEmptyState() {
  const li = document.createElement('li');
  li.className = 'empty-state';
  li.innerHTML = '<div class="empty-icon">🎯</div><p>Добавьте первую привычку!</p>';
  habitsList.appendChild(li);
}

function addHabit() {
  const text = habitInput.value.trim();
  if (!text) return;
  if (habitInput.value.length > MAX_LENGTH) {
    alert(`Привычка не должна превышать ${MAX_LENGTH} символов.`);
    return;
  }
  const existing = habits.find(h => h.text.toLowerCase() === text.toLowerCase());
  if (existing) {
    alert('Такая привычка уже есть.');
    return;
  }
  const newHabit = { text, completed: false };
  habits.push(newHabit);
  if (habitsList.children.length === 1 && habitsList.children[0].classList.contains('empty-state'))
    habitsList.innerHTML = '';
  renderHabit(newHabit);
  habitInput.value = '';
  saveState();
  updateProgress();
}

function clearCompleted() {
  const completed = habits.filter(h => h.completed);
  if (completed.length === 0) return;
  if (!confirm('Очистить все выполненные привычки?')) return;
  habits = habits.filter(h => !h.completed);
  habitsList.innerHTML = '';
  if (habits.length === 0) showEmptyState();
  else habits.forEach(renderHabit);
  saveState();
  updateProgress();
}

function updateProgress() {
  const total = habits.length;
  const done = habits.filter(h => h.completed).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  progressBar.style.width = percent + '%';
  progressPercentage.textContent = `${percent}%`;
  completedCountEl.textContent = done;
  totalCountEl.textContent = total;
}

addBtn.addEventListener('click', addHabit);
habitInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addHabit();
});
clearCompletedBtn.addEventListener('click', clearCompleted);

// Initialization
loadState();
if (habits.length === 0) showEmptyState();
else habits.forEach(renderHabit);
updateProgress();
updateStreak();
// Update streak daily using setInterval
setInterval(updateStreak, 60 * 60 * 1000); // every hour, checks if date changed
