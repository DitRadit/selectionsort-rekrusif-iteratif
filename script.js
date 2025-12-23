let dataAwal = [];
let A = [];
let fastMode = false;

/* ================= SPEED CONTROL ================= */
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
let speed = speedSlider.value;

speedSlider.oninput = () => {
  speed = speedSlider.value;
  speedValue.innerText = speed + " ms";
};

function sleep(ms) {
  return new Promise(resolve =>
    setTimeout(resolve, fastMode ? 0 : ms)
  );
}

/* ================= GENERATE DATA ================= */
function generateData() {
  const size = parseInt(document.getElementById("dataSize").value);
  dataAwal = [];

  for (let i = 0; i < size; i++) {
    dataAwal.push({
      nim: Math.floor(Math.random() * 90) + 10,
      color: "steelblue"
    });
  }

  resetData();
}

/* ================= RENDER ================= */
const container = document.getElementById("array");

function render() {
  container.innerHTML = "";
  A.forEach(mhs => {
    const wrap = document.createElement("div");
    wrap.className = "bar-container";

    const value = document.createElement("div");
    value.className = "bar-value";
    value.innerText = mhs.nim;

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = mhs.nim * 3 + "px";
    bar.style.backgroundColor = mhs.color;

    wrap.appendChild(value);
    wrap.appendChild(bar);
    container.appendChild(wrap);
  });
}

/* ================= SELECTION SORT ITERATIF (ANIMASI) ================= */
async function selectionSort(A, n) {
  let pass = 1;

  while (pass <= n - 1) {
    A.forEach(x => x.color = "steelblue");

    let idx = pass - 1;
    A[idx].color = "green";
    render();
    await sleep(speed);

    let i = pass;
    while (i < n) {
      A[i].color = "red";
      render();
      await sleep(speed);

      if (A[idx].nim > A[i].nim) {
        A[idx].color = "steelblue";
        idx = i;
        A[idx].color = "green";
      } else {
        A[i].color = "steelblue";
      }
      i++;
    }

    A[pass - 1].color = "orange";
    A[idx].color = "orange";
    render();
    await sleep(speed);

    let temp = A[pass - 1];
    A[pass - 1] = A[idx];
    A[idx] = temp;

    A[pass - 1].color = "gold";
    render();
    await sleep(speed);

    pass++;
  }

  A[n - 1].color = "gold";
  render();
}

/* ================= SELECTION SORT REKURSIF (ANIMASI) ================= */
async function selectionSortRecursive(A, n, pass = 1) {
  if (pass > n - 1) {
    A[n - 1].color = "gold";
    render();
    return;
  }

  A.forEach(x => x.color = "steelblue");

  let idx = pass - 1;
  A[idx].color = "green";
  render();
  await sleep(speed);

  let i = pass;
  while (i < n) {
    A[i].color = "red";
    render();
    await sleep(speed);

    if (A[idx].nim > A[i].nim) {
      A[idx].color = "steelblue";
      idx = i;
      A[idx].color = "green";
    } else {
      A[i].color = "steelblue";
    }
    i++;
  }

  A[pass - 1].color = "orange";
  A[idx].color = "orange";
  render();
  await sleep(speed);

  let temp = A[pass - 1];
  A[pass - 1] = A[idx];
  A[idx] = temp;

  A[pass - 1].color = "gold";
  render();
  await sleep(speed);

  await selectionSortRecursive(A, n, pass + 1);
}

/* ================= SELECTION SORT LANGSUNG (NO ANIMATION) ================= */
function selectionSortInstant(A) {
  let n = A.length;
  let pass = 1;

  while (pass <= n - 1) {
    let idx = pass - 1;
    let i = pass;

    while (i < n) {
      if (A[idx].nim > A[i].nim) {
        idx = i;
      }
      i++;
    }

    let temp = A[pass - 1];
    A[pass - 1] = A[idx];
    A[idx] = temp;

    pass++;
  }

  A.forEach(x => x.color = "gold");
  render();
}

function selectionSortInstantRecursive(A, n = A.length, pass = 1) {
  if (pass > n - 1) {
    A.forEach(x => x.color = "gold");
    render();
    return;
  }

  let idx = pass - 1;
  let i = pass;

  while (i < n) {
    if (A[idx].nim > A[i].nim) {
      idx = i;
    }
    i++;
  }

  let temp = A[pass - 1];
  A[pass - 1] = A[idx];
  A[idx] = temp;

  selectionSortInstantRecursive(A, n, pass + 1);
}


/* ================= CONTROL ================= */
function resetData() {
  fastMode = false;
  A = JSON.parse(JSON.stringify(dataAwal));
  render();
}

async function runIterative() {
  const start = performance.now();

  if (A.length > 200 || fastMode) {
    selectionSortInstant(A);
  } else {
    fastMode = false;
    await selectionSort(A, A.length);
  }

  const end = performance.now();
  console.log(`Runtime Iteratif: ${(end - start).toFixed(2)} ms`);
}


async function runRecursive() {
  const start = performance.now();

  if (A.length > 200 || fastMode) {
    selectionSortInstant(A);
  } else {
    fastMode = false;
    await selectionSortRecursive(A, A.length);
  }

  const end = performance.now();
  console.log(`Runtime Rekursif: ${(end - start).toFixed(2)} ms`);
}


function fastFinish() {
  fastMode = true;

  const A1 = JSON.parse(JSON.stringify(A));
  const A2 = JSON.parse(JSON.stringify(A));

  const start = performance.now();
  selectionSortInstant(A1);
  const end = performance.now();

  const start1 = performance.now();
  selectionSortInstantRecursive(A2);
  const end1 = performance.now();

  console.log(`Runtime Instant (Iteratif): ${(end - start).toFixed(2)} ms`);
  console.log(`Runtime Instant (Rekursif): ${(end1 - start1).toFixed(2)} ms`);
}



/* ================= INIT ================= */
generateData();
