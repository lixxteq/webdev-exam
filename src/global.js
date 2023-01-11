const alertPlaceholder = document.getElementById('liveAlertPlaceholder');
const apiKey = 'f6733e30-cdd9-407c-8aff-6fe1edfafc3f';
const apiUrl = 
    new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api');

const alert = (message, type) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        // eslint-disable-next-line max-len
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Закрыть"></button>',
        '</div>'
    ].join('');

    alertPlaceholder.append(wrapper);
    const alert = 
        bootstrap.Alert.getOrCreateInstance(alertPlaceholder.querySelector('.alert'));
    setTimeout(() => {
        alert.close();
    }, 5000);
};

const isWeekend = (date) => {
    const ndate = new Date(date);
    if (ndate.getDay() == 0 || ndate.getDay() == 6) return true;
    return false;
};

const priceForMorning = (time) => {
    let hours = time.slice(0, 2);
    if (hours >= 9 && hours <= 12) return 400;
    else return 0;
};

const priceForEvening = (time) => {
    let hours = time.slice(0, 2);
    if (hours >= 20 && hours <= 23) return 1000;
    else return 0;
};

const priceForHolidaysWeekends = (date) => {
    const holidayList = [
        '01-01',
        '01-02',
        '01-03',
        '01-04',
        '01-05',
        '01-06',
        '02-23',
        '03-08',
        '05-01',
        '05-08',
        '05-09',
        '06-12',
        '09-01',
        '11-06'
    ];

    const month = date.split('-')[1];
    const day = date.split('-')[2];
    if (isWeekend(date) || holidayList.includes(`${month}-${day}`)) return 1.5;
    return 1;
};

const priceForAmount = (amount) => {
    if (amount >= 10 && amount <= 20) return 1500;
    if (amount >= 5 && amount < 10) return 1000;
    return 0;
};

const getTotalPrice = (date, time, guideHourPrice, hoursNumber, peopleAmount, 
    option1 = false, option2 = false) => {

    let basePrice = guideHourPrice * 
        hoursNumber * priceForHolidaysWeekends(date) + 
        priceForMorning(time) + priceForEvening(time) + 
        priceForAmount(peopleAmount);
    let totalPrice = basePrice * (option1 ? 0.85 : 1) * 
        (option2 ? (isWeekend(date) ? 1.25 : 1.3) : 1);
    return Math.round(totalPrice);
};

const validateDate = (date) => {
    const dateVal = new Date(date);
    const dateNow = new Date();
    return dateVal >= dateNow;
};

const validateTime = (time) => {
    const [hours, minutes] = time.split(':');
    return (parseInt(hours) <= 23 && parseInt(hours) >= 9 && 
        (minutes == '00' || minutes == '30'));
};

const validateAmount = (amount) => {
    return parseInt(amount) >= 1 && parseInt(amount) <= 20;
};