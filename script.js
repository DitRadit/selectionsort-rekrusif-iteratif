const sizes = [5, 10, 100, 1000, 10000, 50000];
let dataAwal = [];
let A = [];
let comparisons = 0;
let swaps = 0;
let isAscending = true;
let charts = { summary: null, trials: {} };


Chart.register(ChartDataLabels);

const container = document.getElementById("array");
const compareText = document.getElementById("compareCount");
const swapText = document.getElementById("swapCount");
const timeText = document.getElementById("timeExec");
const statusText = document.getElementById("statusText");
let ANIM_DELAY = 500;


function updateSpeed(val) {
  ANIM_DELAY = Number(val);
  document.getElementById("speedValue").innerText = ANIM_DELAY + " ms";
}


function sleep(ms = ANIM_DELAY) {
  return new Promise(r => setTimeout(r, ms));
}


function clearState() {
  A.forEach(x => x.state = "default");
}

async function selectionSortIterativeAnimated(arr) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let bestIdx = i;
    arr[i].state = "active";
    render();
    await sleep();

    for (let j = i + 1; j < n; j++) {
      arr[j].state = "compare";
      comparisons++;
      render();
      await sleep();

      if (isBetter(arr[j].nim, arr[bestIdx].nim)) {
        arr[bestIdx].state = "default";
        bestIdx = j;
        arr[bestIdx].state = "active";
        render();
        await sleep();
      } else {
        arr[j].state = "default";
      }
    }

    if (bestIdx !== i) {
      [arr[i], arr[bestIdx]] = [arr[bestIdx], arr[i]];
      swaps++;
      render();
      await sleep();
    }

    arr[i].state = "sorted";
    clearState();
    render();
  }

  arr[n - 1].state = "sorted";
  render();
}

async function selectionSortRecursiveAnimated(arr) {
  const n = arr.length;
  const stack = [0];

  while (stack.length) {
    const i = stack.pop();
    if (i >= n - 1) continue;

    let bestIdx = i;
    arr[i].state = "active";
    render();
    await sleep();

    for (let j = i + 1; j < n; j++) {
      arr[j].state = "compare";
      comparisons++;
      render();
      await sleep();

      if (isBetter(arr[j].nim, arr[bestIdx].nim)) {
        arr[bestIdx].state = "default";
        bestIdx = j;
        arr[bestIdx].state = "active";
        render();
        await sleep();
      } else {
        arr[j].state = "default";
      }
    }

    if (bestIdx !== i) {
      [arr[i], arr[bestIdx]] = [arr[bestIdx], arr[i]];
      swaps++;
      render();
      await sleep();
    }

    arr[i].state = "sorted";
    clearState();
    render();

    stack.push(i + 1);
  }
}




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

  for (let i = 0; i < displayLimit; i++) {
    const wrapper = document.createElement("div");
    wrapper.className = "bar-wrapper";

    const value = document.createElement("div");
    value.className = "bar-value";
    value.innerText = A[i].nim;

    const bar = document.createElement("div");
    bar.className = "bar " + A[i].state;
    bar.style.height = (A[i].nim * 1.5) + "px";

    wrapper.appendChild(value);
    wrapper.appendChild(bar);
    container.appendChild(wrapper);
  }
}



function resetData() {
  comparisons = 0; swaps = 0;
  updateStats();
  A = JSON.parse(JSON.stringify(dataAwal));
  render();
  statusText.innerText = "Status: Idle";
}

function selectionSortIterative(arr) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let bestIdx = i;

    for (let j = i + 1; j < n; j++) {
      comparisons++;

      if (isBetter(arr[j].nim, arr[bestIdx].nim)) {
        bestIdx = j;
      }
    }

    if (bestIdx !== i) {
      [arr[i], arr[bestIdx]] = [arr[bestIdx], arr[i]];
      swaps++;
    }
  }
}

function selectionSortRecursive(arr) {
  const n = arr.length;
  const stack = [0];

  while (stack.length) {
    const i = stack.pop();
    if (i >= n - 1) continue;

    let bestIdx = i;

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      if (isBetter(arr[j].nim, arr[bestIdx].nim)) {
        bestIdx = j;
      }
    }

    if (bestIdx !== i) {
      [arr[i], arr[bestIdx]] = [arr[bestIdx], arr[i]];
      swaps++;
    }

    stack.push(i + 1);
  }
}


/* ================= CONTROL (DIPERBAIKI) ================= */
async function runIterative() {
  resetData();
  statusText.innerText = "Status: Sorting Iteratif...";

  if (A.length <= 10) {
    await selectionSortIterativeAnimated(A);
    updateStats(0);
  } else {
    const t0 = performance.now();
    selectionSortIterative(A);
    updateStats(performance.now() - t0);
    A.forEach(x => x.state = "sorted");
    render();
  }

  statusText.innerText = "Status: Selesai (Iteratif)";
}


async function runRecursive() {
  resetData();
  statusText.innerText = "Status: Sorting Rekursif...";

  if (A.length <= 10) {
    await selectionSortRecursiveAnimated(A);
    updateStats(0);
  } else {
    const t0 = performance.now();
    selectionSortRecursive(A);
    updateStats(performance.now() - t0);
    A.forEach(x => x.state = "sorted");
    render();
  }

  statusText.innerText = "Status: Selesai (Rekursif)";
}


/* ================= CHARTS LOGIC ================= */
function initCharts() {
  if (charts.summary) charts.summary.destroy(); // Hapus chart lama jika ada

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
          display: true,
          align: (context) => context.datasetIndex === 0 ? 'top' : 'bottom',
          anchor: (context) => context.datasetIndex === 0 ? 'end' : 'start',
          offset: 8,
          font: { weight: 'bold', size: 10 }, 
          formatter: v => v ? v.toFixed(4) + " ms" : "" 
        } 
      },
      scales: { 
        y: { beginAtZero: true, grace: '15%', title: { display: true, text: 'Waktu (ms)' } },
        x: { title: { display: true, text: 'Jumlah Data (n)' } }
      }
    }
  });

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
        plugins: { datalabels: { display: false }, legend: { display: false } },
        scales: { 
          y: { beginAtZero: true },
          x: { title: { display: true, text: 'Trial' } }
        }
      }
    });
  });
}

async function runBenchmark() {
  document.getElementById("speedSlider").disabled = true;
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
        selectionSortRecursive(cR);
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
  document.getElementById("speedSlider").disabled = false;

}

window.onload = () => { generateData(); initCharts(); };