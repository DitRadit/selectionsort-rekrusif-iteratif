const dataAwal = [{
        nim: 40
      },
      {
        nim: 15
      },
      {
        nim: 30
      },
      {
        nim: 10
      },
      {
        nim: 50
      },
      {
        nim: 20
      }
    ];

    let A = [];
    let fastMode = false;

    const speedSlider = document.getElementById("speedSlider");
    const speedValue = document.getElementById("speedValue");

    let speed = speedSlider.value;

    speedSlider.oninput = () => {
      speed = speedSlider.value;
      speedValue.innerText = speed + " ms";
    };

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, fastMode ? 0 : ms));
    }


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
        bar.style.height = mhs.nim * 5 + "px";

        // 🔥 INI YANG PENTING
        bar.style.backgroundColor = mhs.color || "steelblue";

        wrap.appendChild(value);
        wrap.appendChild(bar);
        container.appendChild(wrap);
      });
    }


    function bars() {
      return document.querySelectorAll(".bar");
    }

    async function selectionSort(A, n) {
      let pass = 1;
      let i, idx, temp;

      while (pass <= n - 1) {

        // reset warna
        A.forEach(x => x.color = "steelblue");

        idx = pass - 1; // index minimum
        A[idx].color = "green"; // minimum sementara
        render();
        await sleep(speed);

        i = pass;

        while (i < n) {

          A[i].color = "red"; // perbandingan
          render();
          await sleep(speed);

          if (A[idx].nim > A[i].nim) {
            A[idx].color = "steelblue";
            idx = i;
            A[idx].color = "green";
          } else {
            A[i].color = "steelblue";
          }

          i = i + 1;
        }

        // proses swap
        A[pass - 1].color = "orange";
        A[idx].color = "orange";
        render();
        await sleep(speed);

        temp = A[pass - 1];
        A[pass - 1] = A[idx];
        A[idx] = temp;

        // posisi sudah benar
        A[pass - 1].color = "gold";
        render();
        await sleep(speed);

        pass = pass + 1;
      }

      // elemen terakhir pasti terurut
      A[n - 1].color = "gold";
      render();
    }

    async function selectionSortRecursive(A, n, pass = 1) {
      let i, idx, temp;

      // BASE CASE
      if (pass > n - 1) {
        A[n - 1].color = "gold";
        render();
        return;
      }

      // reset warna
      A.forEach(x => x.color = "steelblue");

      idx = pass - 1; // minimum index
      A[idx].color = "green"; // minimum sementara
      render();
      await sleep(speed);

      i = pass;

      // cari elemen minimum
      while (i < n) {
        A[i].color = "red"; // perbandingan
        render();
        await sleep(speed);

        if (A[idx].nim > A[i].nim) {
          A[idx].color = "steelblue";
          idx = i;
          A[idx].color = "green";
        } else {
          A[i].color = "steelblue";
        }

        i = i + 1;
      }

      // proses swap
      A[pass - 1].color = "orange";
      A[idx].color = "orange";
      render();
      await sleep(speed);

      temp = A[pass - 1];
      A[pass - 1] = A[idx];
      A[idx] = temp;

      // posisi sudah benar
      A[pass - 1].color = "gold";
      render();
      await sleep(speed);

      // REKURSI KE PASS BERIKUTNYA
      await selectionSortRecursive(A, n, pass + 1);
    }


    function resetData() {
      fastMode = false;
      A = JSON.parse(JSON.stringify(dataAwal));
      render();
    }

    function runIterative() {
      resetData();
      selectionSort(A, A.length);
    }

    function runRecursive() {
      resetData();
      selectionSortRecursive(A, A.length);
    }

    function fastFinish() {
      fastMode = true;
    }


    resetData();