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

    document.getElementById('meritRating').addEventListener('change', function() {
        const meritRating = this.value;
        updateMeritMessage(meritRating);
    });

    document.getElementById('calculateButton').addEventListener('click', calculate);
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

function updateMeritMessage(meritRating) {
    let message = '';
    switch (meritRating) {
        case 'Needs Improvement':
            message = 'Evaluations with an overall rating of “Needs Improvement” are not eligible for performance-based merit increase.';
            break;
        case 'Meets Performance Objectives':
            message = 'Evaluations with an overall rating of “Meets Performance Objectives” will earn a 3% increase, not to exceed the advertised maximum of the salary range for the classification.';
            break;
        case 'Exceeds Performance Objectives':
            message = 'Evaluations with an overall rating of “Exceeds Performance Objectives” will earn a 6% increase, not to exceed the advertised maximum of the salary range for the classification.';
            break;
        case 'Demonstrates Exceptional Performance':
            message = 'Evaluations with an overall rating of “Demonstrates Exceptional Performance” will earn a 9% increase, not to exceed the Exceptional Performance maximum of the salary range for the classification.';
            break;
        default:
            message = '';
    }

    document.getElementById('meritMessage').textContent = message;
}

function showConditionalMessage(message) {
    const popupWindow = window.open('', '_blank', 'width=400,height=300');
    popupWindow.document.write(`
        <html>
        <head>
            <title>Conditional Message</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    text-align: center;
                    padding: 20px;
                }
                .message {
                    background-color: #fff;
                    padding: 20px;
                    border: 2px solid #ccc;
                    border-radius: 5px;
                    max-width: 90%;
                    margin: 0 auto;
                }
                h2 {
                    color: #333;
                }
            </style>
        </head>
        <body>
            <div class="message">
                <h2>Conditional Message</h2>
                <p>${message}</p>
                <button onclick="window.close()">Close</button>
            </div>
        </body>
        </html>
    `);
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
        estimatedRate = newRate;
    } else if (meritRating === 'Meets Performance Objectives' || meritRating === 'Exceeds Performance Objectives') {
        const meritRate = newRate * (1 + meritPercentage / 100);
        estimatedRate = newRate > maxRate ? newRate : Math.min(meritRate, maxRate);
    } else if (meritRating === 'Demonstrates Exceptional Performance') {
        const meritRate = newRate * (1 + meritPercentage / 100);
        estimatedRate = newRate > topRate ? newRate : Math.min(meritRate, topRate);
    }

    // Calculate actual percentage increase
    const actualPercentageIncrease = ((estimatedRate - newRate) / newRate) * 100;

    document.getElementById('newRate').textContent = newRate.toFixed(2);
    document.getElementById('estimatedRate').textContent = estimatedRate.toFixed(2);
    document.getElementById('actualPercentage').textContent = `${actualPercentageIncrease.toFixed(2)}%`;

    // Show the conditional message
    let conditionalMessage = '';
    if (meritRating === 'Needs Improvement') {
        conditionalMessage = 'Evaluations with an overall rating of “Needs Improvement” are not eligible for performance-based merit increase.';
    } else if ((meritRating === 'Meets Performance Objectives' || meritRating === 'Exceeds Performance Objectives') && newRate >= maxRate) {
        conditionalMessage = 'Your hourly rate after COLA has exceeded the Advertised Max of your salary range; therefore, without a rating of “Demonstrating Exceptional Performance,” you are not eligible to receive an OPC merit increase.';
    } else if ((meritRating === 'Meets Performance Objectives' || meritRating === 'Exceeds Performance Objectives') && newRate < maxRate && estimatedRate >= maxRate) {
        conditionalMessage = 'Your hourly rate and merit cannot exceed the Advertised Max of your salary range.';
    } else if (meritRating === 'Demonstrates Exceptional Performance' && newRate >= topRate) {
        conditionalMessage = 'Your hourly rate after COLA has exceeded the top of the Exceptional Performance range of your salary range; therefore, you are not eligible to receive an OPC merit increase.';
    } else if (meritRating === 'Demonstrates Exceptional Performance' && newRate < topRate && estimatedRate >= topRate) {
        conditionalMessage = 'Your hourly rate and merit cannot exceed the top of the Exceptional Performance area of your salary range.';
    }

    if (conditionalMessage) {
        showConditionalMessage(conditionalMessage);
    }

    // Update the merit message based on the new rate and estimated rate
    updateMeritMessage(meritRating);
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
    document.getElementById('estimatedRate').textContent = '---';
    document.getElementById('actualPercentage').textContent = '---';
    document.getElementById('meritMessage').textContent = '';
}
