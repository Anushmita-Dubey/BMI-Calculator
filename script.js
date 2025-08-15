let lastBMI = null;
let lastCategory = "";
let lastWeightChange = "";

const $ = (id) => document.getElementById(id);

const bmiCategory = (bmi) => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25)   return "Normal weight";
  if (bmi < 30)   return "Overweight";
  return "Obese";
};

const weightChangeToNormal = (bmi, weight, heightMeters) => {
  const minNormalWeight = 18.5 * (heightMeters ** 2);
  const maxNormalWeight = 24.9 * (heightMeters ** 2);
  if (bmi < 18.5) {
    const gain = (minNormalWeight - weight).toFixed(1);
    return `Gain ${gain} kg`;
  } else if (bmi > 24.9) {
    const lose = (weight - maxNormalWeight).toFixed(1);
    return `Lose ${lose} kg`;
  }
  return "Healthy range";
};

const toMetersFromUI = () => {
  const units = $("units").value;
  if (units === "meters" || units === "centimeters") {
    let h = parseFloat($("height").value);
    if (Number.isNaN(h) || h <= 0) return null;
    if (units === "centimeters") h = h / 100;
    return h;
  }
  const ft = parseFloat($("feet").value) || 0;
  const inch = parseFloat($("inches").value) || 0;
  const totalInch = ft * 12 + inch;
  if (totalInch <= 0) return null;
  return totalInch * 0.0254;
};

const heightDisplayFromUI = () => {
  const units = $("units").value;
  if (units === "meters") {
    return `${$("height").value} m`;
  } else if (units === "centimeters") {
    return `${$("height").value} cm`;
  } else {
    const ft = $("feet").value || "0";
    const inch = $("inches").value || "0";
    return `${ft} ft ${inch} in`;
  }
};

const saveHistoryToStorage = (arr) =>
  localStorage.setItem("bmiHistory", JSON.stringify(arr));

const getHistoryFromStorage = () =>
  JSON.parse(localStorage.getItem("bmiHistory") || "[]");

function toggleHeightInputs() {
  const mode = $("units").value;
  $("height-m-cm").style.display = (mode === "feet-inches") ? "none" : "block";
  $("height-ft-in").style.display = (mode === "feet-inches") ? "flex" : "none";
}

function computeBMI() {
  const weight = parseFloat($("weight").value);
  const hMeters = toMetersFromUI();
  if (!weight || weight <= 0 || !hMeters || hMeters <= 0) {
    $("bmiResult").textContent = "Please enter a valid weight and height.";
    return;
  }
  const bmi = weight / (hMeters * hMeters);
  lastBMI = Number(bmi.toFixed(2));
  lastCategory = bmiCategory(lastBMI);
  lastWeightChange = weightChangeToNormal(lastBMI, weight, hMeters);
  $("bmiResult").textContent = `Your BMI is ${lastBMI} (${lastCategory}) — ${lastWeightChange}`;
}

function resetForm() {
  ["name","age","weight","height","feet","inches"].forEach(id => {
    const el = $(id);
    if (el) el.value = "";
  });
  lastBMI = null;
  lastCategory = "";
  lastWeightChange = "";
  $("bmiResult").textContent = "";
}

function saveHistory() {
  const name = $("name").value.trim();
  const age = $("age").value.trim();
  const weight = $("weight").value.trim();
  if (!name || !age || !weight) {
    alert("Please fill Name, Age, and Weight.");
    return;
  }
  if (lastBMI === null) {
    alert("Compute BMI before saving to history.");
    return;
  }
  const dateStr = new Date().toLocaleDateString("en-GB"); // dd/mm/yyyy
  const row = {
    date: dateStr,
    name,
    age,
    weight,
    height: heightDisplayFromUI(),
    bmi: lastBMI.toFixed(2),
    category: lastCategory,
    change: lastWeightChange
  };
  const hist = getHistoryFromStorage();
  hist.push(row);
  saveHistoryToStorage(hist);
  loadHistory();
}

function loadHistory() {
  const tbody = document.querySelector("#historyTable tbody");
  tbody.innerHTML = "";
  const hist = getHistoryFromStorage();
  hist.forEach((item, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${item.date}</td>
      <td>${item.name}</td>
      <td>${item.age}</td>
      <td>${item.weight}</td>
      <td>${item.height}</td>
      <td>${item.bmi}</td>
      <td>${item.category}</td>
      <td>${item.change}</td>
      <td><button class="action-btn" data-index="${i}">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

document.addEventListener("click", (e) => {
  if (e.target && e.target.matches("button.action-btn")) {
    const idx = Number(e.target.getAttribute("data-index"));
    const hist = getHistoryFromStorage();
    hist.splice(idx, 1);
    saveHistoryToStorage(hist);
    loadHistory();
  }
});  

function clearHistory() {
  if (confirm("Clear all history? This cannot be undone.")) {
    localStorage.removeItem("bmiHistory");
    loadHistory();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  $("btnCompute").addEventListener("click", computeBMI);
  $("btnReset").addEventListener("click", resetForm);
  $("btnSave").addEventListener("click", saveHistory);
  $("btnClear").addEventListener("click", clearHistory);
  $("units").addEventListener("change", toggleHeightInputs);
  toggleHeightInputs();
  loadHistory();
});
