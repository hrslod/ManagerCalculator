document.addEventListener('DOMContentLoaded', function() {
    fetch('data.csv')
        .then(response => response.text())
        .then(data => {
            const titles = parseCSV(data);
            populateTitles(titles);
        });
});

function parseCSV(data) {
    const lines = data.split('\n');
    const headers = lines[0].split(',');
    const titles = lines.slice(1).map(line => {
        const values = line.split(',');
        let title = {};
        headers.forEach((header, index) => {
            title[header.trim()] = values[index].trim();
        });
        return title;
    });
    return titles;
}

function populateTitles(titles) {
    const titleSelect = document.getElementById('title');
    titles.forEach(title => {
        const option = document.createElement('option');
        option.value = title.Title;
        option.textContent = title.Title;
        titleSelect.appendChild(option);
    });

    titleSelect.addEventListener('change', function() {
        const selectedTitle = titles.find(title => title.Title === this.value);
        if (selectedTitle) {
            document.getElementById('schedule').textContent = selectedTitle.Schedule;
            document.getElementById('min').textContent = selectedTitle.Min;
            document.getElementById('mid').textContent = selectedTitle.Mid;
            document.getElementById('max').textContent = selectedTitle.Max;
            document.getElementById('bottom').textContent = selectedTitle.Bottom;
            document.getElementById('top').textContent = selectedTitle.Top;
        }
    });
}

function calculate() {
    const currentRate = parseFloat(document.getElementById('currentHourlyRate').value.replace('$', ''));
    const meritRating = document.getElementById('meritRating').value;
    const minRate = parseFloat(document.getElementById('min').textContent);
    const maxRate = parseFloat(document.getElementById('max').textContent);
    const bottomRate = parseFloat(document.getElementById('bottom').textContent);
    const topRate = parseFloat(document.getElementById('top').textContent);

    let meritPercentage = 0;
    let newRate = currentRate * 1.0425; // COLA is 4.25%

    switch (meritRating) {
        case 'Meets Performance Objectives':
            meritPercentage = 3;
            break;
        case 'Exceeds Performance Objectives':
            meritPercentage = 6;
            break;
        case 'Demonstrates Exceptional Performance':
            meritPercentage = 9;
            break;
        default:
            meritPercentage = 0;
    }

    if (meritRating === 'Needs Improvement') {
        document.getElementById('meritMessage').textContent = 'Evaluations with an overall rating of “Needs Improvement” are not eligible for performance-based merit increase.';
    } else if (meritRating === 'Meets Performance Objectives') {
        newRate = Math.min(newRate * (1 + meritPercentage / 100), maxRate);
        document.getElementById('meritMessage').textContent = 'Evaluations with an overall rating of “Meets Performance Objectives” may earn a 3% increase, not to exceed the advertised maximum of the salary range for the classification.';
    } else if (meritRating === 'Exceeds Performance Objectives') {
        newRate = Math.min(newRate * (1 + meritPercentage / 100), maxRate);
        document.getElementById('meritMessage').textContent = 'Evaluations with an overall rating of “Exceeds Performance Objectives” may earn a 6% increase, not to exceed the advertised maximum of the salary range for the classification.';
    } else if (meritRating === 'Demonstrates Exceptional Performance') {
        newRate = Math.min(newRate * (1 + meritPercentage / 100), topRate);
        document.getElementById('meritMessage').textContent = 'Evaluations with an overall rating of “Demonstrates Exceptional Performance” may earn a 9% increase, not to exceed the Exceptional Performance maximum of the salary range for the classification.';
    }

    document.getElementById('newRate').textContent = newRate.toFixed(2);
    document.getElementById('meritIncrease').textContent = `${meritPercentage}%`;
    document.getElementById('estimatedRate').textContent = (newRate + newRate * meritPercentage / 100).toFixed(2);
}

function clearForm() {
    document.getElementById('title').value = '';
    document.getElementById('currentHourlyRate').value = '';
    document.getElementById('meritRating').value = '';
    document.getElementById('schedule').textContent = '';
    document.getElementById('min').textContent = '';
    document.getElementById('mid').textContent = '';
    document.getElementById('max').textContent = '';
    document.getElementById('bottom').textContent = '';
    document.getElementById('top').textContent = '';
    document.getElementById('newRate').textContent = '---';
    document.getElementById('meritIncrease').textContent = '---';
    document.getElementById('estimatedRate').textContent = '---';
    document.getElementById('meritMessage').textContent = '';
}
