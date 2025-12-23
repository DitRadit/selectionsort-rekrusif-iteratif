/* ================= GLOBAL DATA ================= */

let animationId = 0;

let dataAwal = [];
let A = [];
let fastMode = false;

let comparisons = 0;
let swaps = 0;

/* ================= ELEMENT ================= */
const container = document.getElementById("array");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
const compareText = document.getElementById("compareCount");
const swapText = document.getElementById("swapCount");
const iterBtn = document.getElementById("iterBtn");
const recBtn = document.getElementById("recBtn");

let speed = speedSlider.value;

/* ================= UTIL ================= */
function sleep(ms, id) {
  return new Promise(resolve => {
    setTimeout(() => {
      if (id === animationId) resolve();
    }, fastMode ? 0 : ms);
  });
}


function updateStats() {
  compareText.innerText = comparisons;
  swapText.innerText = swaps;
}

function disableButtons(state) {
  iterBtn.disabled = state;
  recBtn.disabled = state;
}

/* ================= SPEED ================= */
speedSlider.oninput = () => {
  speed = speedSlider.value;
  speedValue.innerText = speed + " ms";
};

/* ================= GENERATE DATA ================= */
function generateData() {
  cancelAnimation();   // 🔥 FIX UTAMA
  fastMode = false;

  const size = parseInt(document.getElementById("dataSize").value);
  dataAwal = [];

  for (let i = 0; i < size; i++) {
    dataAwal.push({
      nim: Math.floor(Math.random() * 90) + 10,
      state: "default"
    });
  }

  resetData();
}



/* ================= RENDER ================= */
function render() {
  container.innerHTML = "";
  A.forEach(item => {
    const wrap = document.createElement("div");
    wrap.className = "bar-container";

    const value = document.createElement("div");
    value.className = "bar-value";
    value.innerText = item.nim;

    const bar = document.createElement("div");
    bar.className = "bar " + item.state;
    bar.style.height = item.nim * 3 + "px";

    wrap.appendChild(value);
    wrap.appendChild(bar);
    container.appendChild(wrap);
  });
}

/* ================= RESET ================= */
function resetData() {
  cancelAnimation();   // 🔥 BIAR AMAN

  comparisons = 0;
  swaps = 0;
  updateStats();

  A = JSON.parse(JSON.stringify(dataAwal));
  render();
}


/* ================= SELECTION SORT ITERATIVE ================= */
async function selectionSort(A, n, id) {
  for (let pass = 0; pass < n - 1; pass++) {

    if (id !== animationId) return; // 🛑 STOP

    A.forEach(x => x.state = "default");

    let minIdx = pass;
    A[minIdx].state = "min";
    render();
    await sleep(speed, id);

    for (let j = pass + 1; j < n; j++) {
      if (id !== animationId) return;

      A[j].state = "compare";
      comparisons++;
      updateStats();
      render();
      await sleep(speed, id);

      if (A[j].nim < A[minIdx].nim) {
        A[minIdx].state = "default";
        minIdx = j;
        A[minIdx].state = "min";
      } else {
        A[j].state = "default";
      }
    }

    if (minIdx !== pass) {
      A[pass].state = A[minIdx].state = "swap";
      render();
      await sleep(speed, id);

      [A[pass], A[minIdx]] = [A[minIdx], A[pass]];
      swaps++;
      updateStats();
    }

    A[pass].state = "sorted";
    render();
    await sleep(speed, id);
  }

  A[n - 1].state = "sorted";
  render();
}


/* ================= SELECTION SORT RECURSIVE ================= */
async function selectionSortRecursive(A, n, pass, id) {
  if (id !== animationId) return;
  if (pass >= n - 1) {
    A[n - 1].state = "sorted";
    render();
    return;
  }

  A.forEach(x => x.state = "default");

  let minIdx = pass;
  A[minIdx].state = "min";
  render();
  await sleep(speed, id);

  for (let j = pass + 1; j < n; j++) {
    if (id !== animationId) return;

    A[j].state = "compare";
    comparisons++;
    updateStats();
    render();
    await sleep(speed, id);

    if (A[j].nim < A[minIdx].nim) {
      A[minIdx].state = "default";
      minIdx = j;
      A[minIdx].state = "min";
    } else {
      A[j].state = "default";
    }
  }

  if (minIdx !== pass) {
    A[pass].state = A[minIdx].state = "swap";
    render();
    await sleep(speed, id);

    [A[pass], A[minIdx]] = [A[minIdx], A[pass]];
    swaps++;
    updateStats();
  }

  A[pass].state = "sorted";
  render();
  await sleep(speed, id);

  await selectionSortRecursive(A, n, pass + 1, id);
}

/* ================= INSTANT SORT ================= */
function selectionSortInstant(A) {
  let n = A.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      if (A[j].nim < A[minIdx].nim) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [A[i], A[minIdx]] = [A[minIdx], A[i]];
      swaps++;
    }
  }

  A.forEach(x => x.state = "sorted");
  updateStats();
  render();
}

function selectionSortInstantRecursive(A, i = 0) {
  let n = A.length;

  if (i >= n - 1) return;

  let minIdx = i;
  for (let j = i + 1; j < n; j++) {
    comparisons++;
    if (A[j].nim < A[minIdx].nim) {
      minIdx = j;
    }
  }

  if (minIdx !== i) {
    [A[i], A[minIdx]] = [A[minIdx], A[i]];
    swaps++;
  }

  selectionSortInstantRecursive(A, i + 1);
}



/* ================= CONTROL ================= */
async function runIterative() {
  cancelAnimation();
  const currentId = animationId;

  disableButtons(true);
  comparisons = swaps = 0;
  updateStats();

  const startTime = performance.now(); // ⏱️ START

  if (A.length > 200) {
    selectionSortInstant(A);
    const endTime = performance.now(); // ⏱️ END
    console.log(
      `[ITERATIVE - INSTANT] Runtime: ${(endTime - startTime).toFixed(2)} ms`
    );
    disableButtons(false);
    return;
  }

  await selectionSort(A, A.length, currentId);

  if (currentId === animationId) {
    const endTime = performance.now(); // ⏱️ END
    console.log(
      `[ITERATIVE - ANIMATED] Runtime: ${(endTime - startTime).toFixed(2)} ms`
    );
    disableButtons(false);
  }
}


async function runRecursive() {
  cancelAnimation();
  const currentId = animationId;

  disableButtons(true);
  comparisons = swaps = 0;
  updateStats();

  const startTime = performance.now(); // ⏱️ START

  if (A.length > 200) {
    selectionSortInstant(A);
    const endTime = performance.now(); // ⏱️ END
    console.log(
      `[RECURSIVE - INSTANT] Runtime: ${(endTime - startTime).toFixed(2)} ms`
    );
    disableButtons(false);
    return;
  }

  await selectionSortRecursive(A, A.length, 0, currentId);

  if (currentId === animationId) {
    const endTime = performance.now(); // ⏱️ END
    console.log(
      `[RECURSIVE - ANIMATED] Runtime: ${(endTime - startTime).toFixed(2)} ms`
    );
    disableButtons(false);
  }
}



function fastFinish() {
  fastMode = true;
  comparisons = swaps = 0;
  updateStats();

  const startTime = performance.now();
  selectionSortInstant(A);
  const endTime = performance.now();

  console.log(
    `[FAST FINISH - INSTANT] Runtime: ${(endTime - startTime).toFixed(2)} ms`
  );
}


function cancelAnimation() {
  animationId++;         
  disableButtons(false); 
}


/* ================= INIT ================= */
generateData();
