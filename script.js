let currentDate = new Date().toISOString().split('T')[0];
let meals = [], workouts = [];
let macrosChart;

const datePicker = document.getElementById('datePicker');
const mealForm = document.getElementById('mealForm');
const workoutForm = document.getElementById('workoutForm');
const mealList = document.getElementById('mealList');
const workoutList = document.getElementById('workoutList');
const totalCalSpan = document.getElementById('totalCal');
const totalProteinSpan = document.getElementById('totalProtein');
const totalCarbsSpan = document.getElementById('totalCarbs');
const totalFatSpan = document.getElementById('totalFat');

function loadData() {
    const stored = localStorage.getItem(`fitwoman_${currentDate}`);
    if (stored) {
        const data = JSON.parse(stored);
        meals = data.meals || [];
        workouts = data.workouts || [];
    } else {
        meals = [];
        workouts = [];
    }
    renderAll();
}

function saveData() {
    localStorage.setItem(`fitwoman_${currentDate}`, JSON.stringify({ meals, workouts }));
}

function addMeal(e) {
    e.preventDefault();
    const name = document.getElementById('mealName').value;
    const cal = parseFloat(document.getElementById('mealCal').value);
    const protein = parseFloat(document.getElementById('mealProtein').value) || 0;
    const carbs = parseFloat(document.getElementById('mealCarbs').value) || 0;
    const fat = parseFloat(document.getElementById('mealFat').value) || 0;
    if (!name || isNaN(cal)) return;
    meals.push({ name, cal, protein, carbs, fat });
    saveData();
    renderMeals();
    updateSummaryAndChart();
    mealForm.reset();
}

function addWorkout(e) {
    e.preventDefault();
    const exercise = document.getElementById('exerciseSelect').value;
    const sets = parseInt(document.getElementById('workoutSets').value);
    const reps = parseInt(document.getElementById('workoutReps').value);
    if (!exercise || isNaN(sets) || isNaN(reps)) return;
    workouts.push({ exercise, sets, reps });
    saveData();
    renderWorkouts();
    workoutForm.reset();
}

function renderMeals() {
    mealList.innerHTML = '';
    meals.forEach((meal, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${meal.name}</strong> – ${meal.cal} kcal
                ${meal.protein ? `| P:${meal.protein}g` : ''}
                ${meal.carbs ? `| C:${meal.carbs}g` : ''}
                ${meal.fat ? `| G:${meal.fat}g` : ''}
            </div>
            <button class="delete-btn" data-index="${idx}" data-type="meal">🗑️</button>
        `;
        mealList.appendChild(li);
    });
    attachDeleteEvents();
}

function renderWorkouts() {
    workoutList.innerHTML = '';
    workouts.forEach((workout, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${workout.exercise}</strong> – ${workout.sets} x ${workout.reps}
            </div>
            <button class="delete-btn" data-index="${idx}" data-type="workout">🗑️</button>
        `;
        workoutList.appendChild(li);
    });
    attachDeleteEvents();
}

function attachDeleteEvents() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = btn.dataset.index;
            const type = btn.dataset.type;
            if (type === 'meal') meals.splice(idx, 1);
            else workouts.splice(idx, 1);
            saveData();
            renderAll();
            updateSummaryAndChart();
        });
    });
}

function getTotals() {
    let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    meals.forEach(meal => {
        totalCal += meal.cal;
        totalProtein += meal.protein || 0;
        totalCarbs += meal.carbs || 0;
        totalFat += meal.fat || 0;
    });
    return { totalCal, totalProtein, totalCarbs, totalFat };
}

function updateSummaryAndChart() {
    const totals = getTotals();
    totalCalSpan.textContent = totals.totalCal;
    totalProteinSpan.textContent = totals.totalProtein;
    totalCarbsSpan.textContent = totals.totalCarbs;
    totalFatSpan.textContent = totals.totalFat;
    if (macrosChart) macrosChart.destroy();
    const ctx = document.getElementById('macrosChart').getContext('2d');
    macrosChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Proteínas', 'Carboidratos', 'Gorduras'],
            datasets: [{
                data: [totals.totalProtein, totals.totalCarbs, totals.totalFat],
                backgroundColor: ['#c44569', '#f5a97f', '#81b29a']
            }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
}

function renderAll() {
    renderMeals();
    renderWorkouts();
    updateSummaryAndChart();
}

datePicker.value = currentDate;
datePicker.addEventListener('change', (e) => {
    currentDate = e.target.value;
    loadData();
});
mealForm.addEventListener('submit', addMeal);
workoutForm.addEventListener('submit', addWorkout);
loadData();
