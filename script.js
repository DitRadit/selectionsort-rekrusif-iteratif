/* ================= GLOBAL DATA ================= */
const sizes = [5, 10, 100, 1000, 10000, 50000];
let dataAwal = [];
let A = [];
let comparisons = 0;
let swaps = 0;
let isAscending = true;
let charts = { summary: null, trials: {} };

// Mendaftarkan plugin datalabels
Chart.register(ChartDataLabels);

const container = document.getElementById("array");
const compareText = document.getElementById("compareCount");
const swapText = document.getElementById("swapCount");
const timeText = document.getElementById("timeExec");
const statusText = document.getElementById("statusText");

/* ================= UTIL ================= */
function updateStats(time = 0) {
  compareText.innerText = comparisons.toLocaleString();
  swapText.innerText = swaps.toLocaleString();
  timeText.innerText = time.toFixed(4) + " ms";
}

function setOrder(order) {
  isAscending = order === "asc";
  generateData();
}

function isBetter(a, b) {
  return isAscending ? a < b : a > b;
}

function generateData() {
  const size = parseInt(document.getElementById("dataSize").value);
  dataAwal = Array.from({ length: size }, () => ({
    nim: Math.floor(Math.random() * 90) + 10,
    state: "default"
  }));
  resetData();
}

function render() {
  const displayLimit = Math.min(A.length, 1000);
  container.innerHTML = "";
  for(let i = 0; i < displayLimit; i++) {
    const bar = document.createElement("div");
    bar.className = "bar " + A[i].state;
    bar.style.height = A[i].nim * 1.5 + "px";
    container.appendChild(bar);
  }
}

function resetData() {
  comparisons = 0; swaps = 0;
  updateStats();
  A = JSON.parse(JSON.stringify(dataAwal));
  render();
  statusText.innerText = "Status: Idle";
}

/* ================= SORTING LOGIC ================= */
function selectionSortIterative(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      comparisons++;
      if (isBetter(arr[j].nim, arr[minIdx].nim)) minIdx = j;
    }
    if (minIdx !== i) { [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]; swaps++; }
  }
}

function trampoline(fn) {
  return function(...args) {
    let result = fn.apply(this, args);
    while (typeof result === 'function') result = result();
    return result;
  };
}

const selectionSortRecursiveTrampolined = trampoline(function self(arr, i = 0) {
  if (i >= arr.length - 1) return null;
  let minIdx = i;
  for (let j = i + 1; j < arr.length; j++) {
    comparisons++;
    if (isBetter(arr[j].nim, arr[minIdx].nim)) minIdx = j;
  }
  if (minIdx !== i) { [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]; swaps++; }
  return () => self(arr, i + 1);
});

/* ================= CHARTS LOGIC ================= */
function initCharts() {
  // 1. KONFIGURASI GRAFIK RINGKASAN (DENGAN LABEL)
  const ctxSum = document.getElementById('summaryChart').getContext('2d');
  charts.summary = new Chart(ctxSum, {
    type: 'line',
    data: {
      labels: sizes.map(s => s.toLocaleString()),
      datasets: [
        { label: 'Iteratif (ms)', data: [], borderColor: '#4f46e5', tension: 0.3 },
        { label: 'Rekursif (ms)', data: [], borderColor: '#f59e0b', tension: 0.3 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        datalabels: { 
          display: true, // Label diaktifkan khusus di grafik ini
          align: (context) => context.datasetIndex === 0 ? 'top' : 'bottom',
          anchor: (context) => context.datasetIndex === 0 ? 'end' : 'start',
          offset: 8,
          font: { weight: 'bold', size: 10 }, 
          formatter: v => v ? v.toFixed(4) + " ms" : "" 
        } 
      },
      scales: { 
        y: { 
          beginAtZero: true, 
          grace: '15%',
          title: { display: true, text: 'Waktu Eksekusi (ms)', font: { weight: 'bold' } }
        },
        x: { title: { display: true, text: 'Jumlah Data (n)', font: { weight: 'bold' } } }
      }
    }
  });

  // 2. KONFIGURASI GRAFIK DETAIL (TANPA LABEL)
  const trialContainer = document.getElementById('trialChartsContainer');
  trialContainer.innerHTML = '';
  sizes.forEach(size => {
    const box = document.createElement('div');
    box.className = 'chart-box';
    box.innerHTML = `<h4>Data Size: ${size.toLocaleString()}</h4><div class="canvas-holder"><canvas id="chart-${size}"></canvas></div>`;
    trialContainer.appendChild(box);

    const ctxTrial = document.getElementById(`chart-${size}`).getContext('2d');
    charts.trials[size] = new Chart(ctxTrial, {
      type: 'line',
      data: {
        labels: Array.from({length: 10}, (_, i) => i + 1),
        datasets: [
          { label: 'Iteratif', data: [], borderColor: '#4f46e5', borderWidth: 1.5, pointRadius: 2 },
          { label: 'Rekursif', data: [], borderColor: '#f59e0b', borderWidth: 1.5, pointRadius: 2 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          datalabels: { display: false }, // Label dinonaktifkan di grafik detail
          legend: { display: false } 
        },
        scales: { 
          y: { beginAtZero: true, title: { display: true, text: 'ms', font: { size: 10 } } },
          x: { title: { display: true, text: 'Trial ke-n', font: { size: 10 } } }
        }
      }
    });
  });
}

async function runBenchmark() {
  const sumIter = []; const sumRec = [];
  statusText.innerText = "Status: Benchmark Sedang Berjalan...";

  for (let size of sizes) {
    const tIter = []; const tRec = [];
    const iterations = size <= 100 ? 1000 : 1; 

    for (let t = 0; t < 10; t++) {
      let testData = Array.from({ length: size }, () => ({ nim: Math.floor(Math.random() * 90) + 10 }));
      
      let t0 = performance.now();
      for(let i = 0; i < iterations; i++) {
        let cI = JSON.parse(JSON.stringify(testData));
        selectionSortIterative(cI);
      }
      tIter.push((performance.now() - t0) / iterations);

      let t2 = performance.now();
      for(let i = 0; i < iterations; i++) {
        let cR = JSON.parse(JSON.stringify(testData));
        selectionSortRecursiveTrampolined(cR);
      }
      tRec.push((performance.now() - t2) / iterations);
      
      if (size > 1000) await new Promise(r => setTimeout(r, 10));
    }
    
    charts.trials[size].data.datasets[0].data = tIter;
    charts.trials[size].data.datasets[1].data = tRec;
    charts.trials[size].update();

    sumIter.push(tIter.reduce((a, b) => a + b) / 10);
    sumRec.push(tRec.reduce((a, b) => a + b) / 10);
  }

  charts.summary.data.datasets[0].data = sumIter;
  charts.summary.data.datasets[1].data = sumRec;
  charts.summary.update();
  statusText.innerText = "Status: Benchmark Selesai!";
}

window.onload = () => { generateData(); initCharts(); };