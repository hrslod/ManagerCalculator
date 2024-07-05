document.addEventListener("DOMContentLoaded", () => {
    loadTitles();
});

function loadTitles() {
    fetch('data.csv')
        .then(response => response.text())
        .then(data => {
            const titles = parseCSV(data);
            populateTitleDropdown(titles);
        });
}

function parseCSV(data) {
    const lines = data.split('\n');
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(',');
        if (cells.length > 1) {
            result.push({
                title: cells[0],
                minRate: parseFloat(cells[1]),
                maxRate: parseFloat(cells[2]),
                exceptionalMin: parseFloat(cells[3]),
                exceptionalMax: parseFloat(cells[4]),
                cola: parseFloat(cells[5])
            });
        }
    }
    return result;
}

function populateTitleDropdown(titles) {
    const dropdown = document.getElementById('title');
    titles.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = item.title;
        dropdown.add(option);
    });
}

function generateTable() {
    const titles = parseCSV(data);
    const dropdown = document.getElementById('title');
    const selectedTitle = titles[dropdown.value];

    const tbody = document.getElementById('salary-table').getElementsByTagName('tbody')[0];
    tbody.innerHTML = `
        <tr>
            <td>${selectedTitle.minRate}</td>
            <td>${selectedTitle.maxRate}</td>
            <td>${selectedTitle.exceptionalMin}</td>
            <td>${selectedTitle.exceptionalMax}</td>
        </tr>
    `;
}

function calculateMeritIncrease() {
    const currentRate = parseFloat(document.getElementById('current-rate').value);
    const meritRating = parseFloat(document.getElementById('merit-rating').value);
    const dropdown = document.getElementById('title');
    const selectedTitle = parseCSV(data)[dropdown.value];

    const colaIncrease = currentRate * (selectedTitle.cola / 100);
    const meritIncrease = currentRate * (meritRating / 100);
    const estimatedRate = currentRate + colaIncrease + meritIncrease;

    document.getElementById('cola-increase').innerText = colaIncrease.toFixed(2);
    document.getElementById('merit-increase').innerText = meritIncrease.toFixed(2);
    document.getElementById('estimated-rate').innerText = estimatedRate.toFixed(2);
}

function clearForm() {
    document.getElementById('title').selectedIndex = 0;
    document.getElementById('current-rate').value = '';
    document.getElementById('merit-rating').selectedIndex = 0;
    document.getElementById('salary-table').getElementsByTagName('tbody')[0].innerHTML = '';
    document.getElementById('cola-increase').innerText = '';
    document.getElementById('merit-increase').innerText = '';
    document.getElementById('estimated-rate').innerText = '';
}
