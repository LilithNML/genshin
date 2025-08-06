let pity4 = 0;
let pity5 = 0;
let history = [];
let editIndex = null;
const editDialog = document.getElementById('editDialog');

function updateDisplay() {
  document.getElementById('pity4').textContent = pity4;
  document.getElementById('pity5').textContent = pity5;

  const warnings = [];
  if (pity4 >= 9) warnings.push(`Estás a ${10 - pity4} de un 4★ asegurado`);
  if (pity5 >= 89) warnings.push(`Estás a ${90 - pity5} de un 5★ asegurado`);
  
  const warningsBox = document.getElementById('warnings');
  if (warnings.length > 0) {
    warningsBox.innerHTML = warnings.join('<br>');
    warningsBox.style.display = 'block';
  } else {
    warningsBox.style.display = 'none';
  }

  const historyList = document.getElementById('history');
  historyList.innerHTML = history.map((e, i) => `
    <li class="history-entry">
      <span>${e.time} - ${e.type}${e.name ? `: ${e.name}` : ''}</span>
      <i class="material-icons edit-icon" data-index="${i}">edit</i>
    </li>
  `).join('');

  localStorage.setItem('pity4', pity4);
  localStorage.setItem('pity5', pity5);
  localStorage.setItem('history', JSON.stringify(history));
}

function addPull(type = '') {
  const name = document.getElementById('characterName').value.trim();
  pity4 = type === '4' ? 0 : pity4 + 1;
  pity5 = type === '5' ? 0 : pity5 + 1;
  
  history.unshift({
    time: new Date().toISOString().slice(0, 10),
    type: type ? `${type}★` : 'Tirada',
    name
  });
  document.getElementById('characterName').value = '';
  updateDisplay();
}

function openEdit(index) {
  editIndex = index;
  const entry = history[index];
  document.getElementById('editType').value = entry.type;
  document.getElementById('editName').value = entry.name || "";
  document.getElementById('editDate').value = entry.time;
  editDialog.classList.add('visible');
}

function closeEditDialog() {
  editDialog.classList.remove('visible');
}

function saveEdit() {
  const entry = history[editIndex];
  entry.type = document.getElementById('editType').value;
  entry.name = document.getElementById('editName').value.trim();
  entry.time = document.getElementById('editDate').value;
  recalcPities();
  updateDisplay();
  closeEditDialog();
}

function recalcPities() {
  pity4 = 0;
  pity5 = 0;
  let fourStarFound = false;
  let fiveStarFound = false;
  for (let i = 0; i < history.length; i++) {
    if (!fourStarFound && history[i].type.includes('4★')) {
      pity4 = i;
      fourStarFound = true;
    }
    if (!fiveStarFound && history[i].type.includes('5★')) {
      pity5 = i;
      fiveStarFound = true;
    }
  }
}

function exportData() {
  const data = JSON.stringify({ pity4, pity5, history }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'pity_genshin.json';
  link.click();
}

function importData() {
  document.getElementById('fileInput').click();
}

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      pity4 = data.pity4 || 0;
      pity5 = data.pity5 || 0;
      history = data.history || [];
      recalcPities();
      updateDisplay();
    } catch {
      alert('Archivo inválido');
    }
  };
  reader.readAsText(file);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  pity4 = +localStorage.getItem('pity4') || 0;
  pity5 = +localStorage.getItem('pity5') || 0;
  history = JSON.parse(localStorage.getItem('history') || '[]');
  
  recalcPities();
  updateDisplay();
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }

  // Add pull buttons
  document.querySelectorAll('.btn-normal, .btn-4star, .btn-5star').forEach(button => {
    button.addEventListener('click', (e) => {
      addPull(e.target.dataset.type);
    });
  });

  // Edit history
  document.getElementById('history').addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-icon')) {
      openEdit(parseInt(e.target.dataset.index));
    }
  });

  // Modal buttons
  document.getElementById('saveEditBtn').addEventListener('click', saveEdit);
  document.getElementById('closeEditBtn').addEventListener('click', closeEditDialog);

  // Import/Export buttons
  document.getElementById('exportBtn').addEventListener('click', exportData);
  document.getElementById('importBtn').addEventListener('click', importData);
  document.getElementById('fileInput').addEventListener('change', handleFile);
});
