document.addEventListener('DOMContentLoaded', function () {
    fetch('data.csv')
        .then(response => response.text())
        .then(data => {
            const titles = parseCSV(data);
            const titleSelect = document.getElementById('title');
            titles.forEach(title => {
                const option = document.createElement('option');
                option.text = title.title;
                option.value = title.title;
                titleSelect.add(option);
            });
        });

    document.getElementById('title').addEventListener('change', populateFields);
    document.getElementById('meritRating').addEventListener('change', updateMeritMessage);
});

function parseCSV(data) {
    const lines = data.split('\n');
    const result = [];
    const headers = lines[0].split(',');
    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = lines[i].split(',');
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j].trim()] = currentline[j].trim();
        }
        result.push(obj);
    }
    return result;
}

function populateFields() {
    const title = document.getElementById('title').value;
    fetch('data.csv')
        .then(response => response.text())
        .then(data => {
            const titles = parseCSV(data);
            const selectedTitle = titles.find(t => t.title === title);
            if (selectedTitle) {
                document.getElementById('schedule').innerText = selectedTitle.schedule;
                document.getElementById('min').innerText = selectedTitle.min;
                document.getElementById('mid').innerText = selectedTitle.mid;
                document.getElementById('max').innerText = selectedTitle.max;
                document.getElementById('bottom').innerText = selectedTitle.bottom;
                document.getElementById('top').innerText = selectedTitle.top;
            }
        });
}

function updateMeritMessage() {
    const meritRating = document.getElementById('meritRating').value;
    const meritMessage = document.getElementById('meritMessage');
    let message = '';
    switch (meritRating) {
        case 'Needs Improvement':
            message = 'Evaluations with an overall rating of “Needs Improvement” are not eligible for performance-based merit increase.';
            break;
        case 'Meets Performance Objectives':
            message = 'Evaluations with an overall rating of “Meets Performance Objectives” may earn a 3% increase, not to exceed the advertised maximum of the salary range for the classification.';
            break;
        case 'Exceeds Performance Objectives':
            message = 'Evaluations with an overall rating of “Exceeds Performance Objectives” may earn a 6% increase, not to exceed the advertised maximum of the salary range for the classification.';
            break;
        case 'Demonstrates Exceptional Performance':
            message = 'Evaluations with an overall rating of “Demonstrates Exceptional Performance” may earn a 9% increase, not to exceed the Exceptional Performance maximum of the salary range for the classification.';
            break;
        default:
            message = '';
    }
    meritMessage.innerText = message;
}

function calculate() {
    // Calculation logic here...
}

function clearForm() {
    document.getElementById('title').value = 'Select One';
    document.getElementById('currentHourlyRate').value = '';
    document.getElementById('meritRating').value = 'Select One';
    document.getElementById('schedule').innerText = '';
    document.getElementById('min').innerText = '';
    document.getElementById('mid').innerText = '';
    document.getElementById('max').innerText = '';
    document.getElementById('bottom').innerText = '';
    document.getElementById('top').innerText = '';
    document.getElementById('newRateLabel').querySelector('.result').innerText = '---';
    document.getElementById('meritIncreaseLabel').querySelector('.result').innerText = '---';
    document.getElementById('estimatedRateLabel').querySelector('.result').innerText = '---';
    document.getElementById('meritMessage').innerText = '';
}
