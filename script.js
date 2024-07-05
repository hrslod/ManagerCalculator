document.addEventListener("DOMContentLoaded", () => {
    loadTitles();
});

let titlesData = [];

function loadTitles() {
    fetch('data.csv')
        .then(response => response.text())
        .then(data => {
            titlesData = parseCSV(data);
            populateTitleDropdown(titlesData);
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
                salarySchedule: cells[1],
                minRate: parseFloat(cells[2]),
                midRate: parseFloat(cells[3]),
                maxRate: parseFloat(cells[4]),
                exceptionalMin: parseFloat(cells[5]),
                exceptionalMax: parseFloat(cells[6])
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
    const dropdown = document.getElementById('title');
    const selectedTitle = titlesData[dropdown.value];

    const tbody = document.getElementById('salary-table').getElementsByTagName('tbody')[0];
    tbody.innerHTML = `
        <tr>
            <td>${selectedTitle.salarySchedule}</td>
            <td>${selectedTitle.minRate.toFixed(2)}</td>
            <td>${selectedTitle.midRate.toFixed(
