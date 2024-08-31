let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null;
let selectedTimes = [];
let selectedLaptops = [];

const timeSlots = [
    { label: "1교시 (8:30-9:20)", value: "1교시" },
    { label: "2교시 (9:30-10:20)", value: "2교시" },
    { label: "3교시 (10:30-11:20)", value: "3교시" },
    { label: "4교시 (11:30-12:20)", value: "4교시" },
    { label: "점심시간 (12:20-13:40)", value: "점심시간" },
    { label: "5교시 (13:40-14:30)", value: "5교시" },
    { label: "6교시 (14:40-15:30)", value: "6교시" },
    { label: "7교시 (15:40-16:30)", value: "7교시" },
    { label: "방과후 (17:00-17:50)", value: "방과후" },
    { label: "야자 (18:00-20:50)", value: "야자" },
];

let reservations = JSON.parse(localStorage.getItem('reservations')) || {};

function generateCalendar(month, year) {
    const calendarBody = document.querySelector("#calendar tbody");
    const calendarHeader = document.getElementById("month-year");

    calendarBody.innerHTML = "";
    calendarHeader.innerText = `${year} ${new Date(year, month).toLocaleString("default", { month: "long" })}`;

    const firstDay = new Date(year, month).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let date = 1;
    for (let i = 0; i < 6; i++) {
        const row = document.createElement("tr");

        for (let j = 0; j < 7; j++) {
            const cell = document.createElement("td");
            if (i === 0 && j < firstDay) {
                cell.innerHTML = "";
            } else if (date > daysInMonth) {
                break;
            } else {
                const fullDate = `${year}-${month + 1}-${date}`;

                cell.innerHTML = date;
                cell.dataset.date = fullDate;

                cell.addEventListener("click", handleDateClick);

                if (reservations[fullDate]) {
                    cell.classList.add("reserved");
                } else if (
                    date === new Date().getDate() &&
                    month === new Date().getMonth() &&
                    year === new Date().getFullYear()
                ) {
                    cell.classList.add("today");
                }

                date++;
            }
            row.appendChild(cell);
        }

        calendarBody.appendChild(row);
    }
}

function handleDateClick(event) {
    const date = event.target.dataset.date;

    selectedDate = date;
    selectedTimes = [];
    selectedLaptops = [];

    highlightSelectedDate(date);
    showTimeSelection();
}

function highlightSelectedDate(date) {
    const allCells = document.querySelectorAll("#calendar td");
    allCells.forEach((cell) => {
        if (cell.dataset.date === date) {
            cell.classList.add("selected");
        } else {
            cell.classList.remove("selected");
        }
    });
}

function showTimeSelection() {
    const timeSelectionContainer = document.getElementById("time-selection-container");
    const timeGrid = document.getElementById("time-grid");

    timeSelectionContainer.style.display = "block";
    document.getElementById("laptop-selection-container").style.display = "none";
    timeGrid.innerHTML = "";

    timeSlots.forEach((slot) => {
        const button = document.createElement("button");
        button.innerText = slot.label;
        button.dataset.time = slot.value;

        button.addEventListener("click", handleTimeSelection);
        timeGrid.appendChild(button);
    });
}

function handleTimeSelection(event) {
    const timeSlot = event.target.dataset.time;

    if (selectedTimes.includes(timeSlot)) {
        selectedTimes = selectedTimes.filter((time) => time !== timeSlot);
        event.target.classList.remove("selected");
    } else {
        selectedTimes.push(timeSlot);
        event.target.classList.add("selected");
    }
}

document.getElementById("confirm-time").addEventListener("click", () => {
    if (selectedTimes.length > 0) {
        showLaptopSelection();
    } else {
        alert("Please select at least one time slot!");
    }
});

function showLaptopSelection() {
    const laptopSelectionContainer = document.getElementById("laptop-selection-container");
    const laptopGrid = document.getElementById("laptop-grid");

    document.getElementById("time-selection-container").style.display = "none";
    laptopSelectionContainer.style.display = "block";
    laptopGrid.innerHTML = "";

    for (let i = 1; i <= 32; i++) {
        const button = document.createElement("button");
        button.innerText = `Laptop ${i}`;
        button.dataset.laptop = i;

        if (isLaptopAvailable(i)) {
            button.addEventListener("click", handleLaptopSelection);
        } else {
            button.classList.add("disabled");
        }

        laptopGrid.appendChild(button);
    }
}

function isLaptopAvailable(laptop) {
    const selectedTimesKey = selectedTimes.join(",");

    return !Object.keys(reservations).some((key) => {
        return (
            key.startsWith(`${selectedDate}-`) && reservations[key].includes(laptop)
        );
    });
}

function handleLaptopSelection(event) {
    const laptop = event.target.dataset.laptop;

    if (selectedLaptops.includes(laptop)) {
        selectedLaptops = selectedLaptops.filter((lap) => lap !== laptop);
        event.target.classList.remove("selected");
    } else {
        selectedLaptops.push(laptop);
        event.target.classList.add("selected");
    }

    updateLaptopAvailability();
}

function updateLaptopAvailability() {
    const allButtons = document.querySelectorAll("#laptop-grid button");

    allButtons.forEach((button) => {
        const laptop = button.dataset.laptop;
        if (!isLaptopAvailable(laptop)) {
            button.classList.add("disabled");
        } else {
            button.classList.remove("disabled");
        }
    });
}

document.getElementById("confirm-selection").addEventListener("click", () => {
    if (selectedLaptops.length > 0) {
        saveReservation();
    } else {
        alert("Please select at least one laptop!");
    }
});

function saveReservation() {
    const reservationKey = `${selectedDate}-${selectedTimes.join(",")}`;

    if (!reservations[reservationKey]) {
        reservations[reservationKey] = [];
    }

    reservations[reservationKey] = reservations[reservationKey].concat(
        selectedLaptops.map(Number)
    );
    localStorage.setItem("reservations", JSON.stringify(reservations));

    const confirmationDiv = document.getElementById("confirmation");
    confirmationDiv.innerHTML = `Reservation confirmed for ${selectedDate}, times: ${selectedTimes.join(", ")} with Laptops ${selectedLaptops.join(", ")}`;
    confirmationDiv.style.display = "block";

    generateCalendar(currentMonth, currentYear);
}

document.getElementById("prev-month").addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
});

document.getElementById("next-month").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
});

document.getElementById("reset-reservations").addEventListener("click", () => {
    reservations = {};
    localStorage.setItem("reservations", JSON.stringify(reservations));
    generateCalendar(currentMonth, currentYear);
    alert("All reservations have been reset.");
});

// 로컬 저장소 변경 시 다른 탭에서도 예약 상태를 동기화하는 이벤트 핸들러 추가
window.addEventListener('storage', (event) => {
    if (event.key === 'reservations') {
        reservations = JSON.parse(event.newValue) || {};
        generateCalendar(currentMonth, currentYear);
        const confirmationDiv = document.getElementById("confirmation");
        confirmationDiv.innerHTML = "Reservations have been updated.";
        confirmationDiv.style.display = "block";
    }
});

// 초기 캘린더 생성
generateCalendar(currentMonth, currentYear);
