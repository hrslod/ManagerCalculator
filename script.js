document.addEventListener('DOMContentLoaded', function() {
    fetch('data.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            console.log('CSV Data:', data); // Debugging: Log the fetched CSV data
            const titles = parseCSV(data);
            console.log('Parsed Titles:', titles); // Debugging: Log the parsed titles
            populateTitles(titles);
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
});

function parseCSV(data) {
    const lines = data.split('\n');
    const headers = lines[0].split(',');
    const titles = lines.slice(1).map(line => {
        const values = line.split(',');
        let title = {};
        headers.forEach((header, index) => {
            title[header.trim()] = values[index]?.trim();
        });
        return title;
    });
    return titles;
}

function populateTitles(titles) {
    const titleSelect = document.getElementById('title');
    titles.forEach(title => {
        if (title.Title) { // Ensure there is a valid title to add
            const option = document.createElement('option');
            option.value = title.Title;
            option.textContent = title.Title;
            titleSelect.appendChild(option);
        }
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

    let estimatedRate;

    if (meritRating === 'Needs Improvement') {
        document.getElementById('meritMessage').textContent = 'Evaluations with an overall rating of “Needs Improvement” are not eligible for performance-based merit increase.';
        estimatedRate = newRate;
    } else if (meritRating === 'Meets Performance Objectives' || meritRating === 'Exceeds Performance Objectives') {
        const meritRate = newRate * (1 + meritPercentage / 100);
        estimatedRate = newRate > maxRate ? newRate : Math.min(meritRate, maxRate);
        document.getElementById('meritMessage').textContent = `Evaluations with an overall rating of “${meritRating}” may earn a ${meritPercentage}% increase.`;
    } else if (meritRating === 'Demonstrates Exceptional Performance') {
        const meritRate = newRate * (1 + meritPercentage / 100);
        estimatedRate = newRate > topRate ? newRate : Math.min(meritRate, topRate);
        document.getElementById('meritMessage').textContent = 'Evaluations with an overall rating of “Demonstrates Exceptional Performance” may earn a 9% increase.';
    }

    document.getElementById('newRate').textContent = newRate.toFixed(2);
    document.getElementById('meritIncrease').textContent = `${meritPercentage}%`;
    document.getElementById('estimatedRate').textContent = estimatedRate.toFixed(2);
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
