const alertPlaceholder = document.getElementById('liveAlertPlaceholder');

const alert = (message, type) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Закрыть"></button>',
        '</div>'
    ].join('');

    alertPlaceholder.append(wrapper);
};
// alert('1234', 'success');
const alertTrigger = document.getElementById('liveAlertBtn');
if (alertTrigger) {
    alertTrigger.addEventListener('click', () => {
        alert('Отлично, вы запустили это предупреждающее сообще', 'success');
    });
}