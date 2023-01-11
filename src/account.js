const bsEditModal = new bootstrap.Modal(document.getElementById('editModal'));
const bsDeleteModal = 
    new bootstrap.Modal(document.getElementById('deleteModal'));

const getOrders = async () => {
    const url = new URL(apiUrl + '/orders');
    url.searchParams.append('api_key', apiKey);
    const response = await fetch(url);
    const orders = await response.json();
    return orders;
};

const getOrderById = async (id) => {
    const url = new URL(apiUrl + `/orders/${id}`);
    url.searchParams.append('api_key', apiKey);
    const response = await fetch(url);
    const order = await response.json();
    return order;
};

const getRouteById = async (id) => {
    const url = new URL(apiUrl + `/routes/${id}`);
    url.searchParams.append('api_key', apiKey);
    const response = await fetch(url);
    const route = await response.json();
    return route;
};

const getGuideById = async (id) => {
    const url = new URL(apiUrl + `/guides/${id}`);
    url.searchParams.append('api_key', apiKey);
    const response = await fetch(url);
    const guide = await response.json();
    return guide;
};

const getDataSet = async (id) => {
    const order = await getOrderById(id);
    const route = await getRouteById(order.route_id);
    const guide = await getGuideById(order.guide_id);
    const formData = {
        id: id,
        guideName: guide.name,
        routeName: route.name,
        date: order.date,
        time: order.time,
        duration: order.duration,
        amount: order.persons,
        pricePerHour: guide.pricePerHour,
        price: order.price,
        optionFirst: order.optionFirst,
        optionSecond: order.optionSecond
    };
    return formData;
};

const parseDate = (date) => {
    const [year, month, day] = date.split('-');
    return `${day}.${month}.${year}`;
};

const buildOrderItem = async (idx, order) => {
    const item = document.createElement('tr');
    const number = document.createElement('th');
    const name = document.createElement('th');
    const date = document.createElement('th');
    const price = document.createElement('th');
    const options = document.createElement('th');
    const infoIcon = document.createElement('i');
    const editIcon = document.createElement('i');
    const deleteIcon = document.createElement('i');

    const routeName = (await getRouteById(order.route_id)).name;
    number.textContent = idx;
    name.textContent = routeName;
    date.textContent = parseDate(order.date);
    price.textContent = order.price;

    infoIcon.classList = 'fa fa-eye btn col-2';
    infoIcon.setAttribute('data-bs-toggle', 'modal');
    infoIcon.setAttribute('data-bs-target', '#viewModal');
    infoIcon.setAttribute('data-bs-id', order.id);
    editIcon.classList = 'fa fa-edit btn col-2';
    editIcon.setAttribute('data-bs-toggle', 'modal');
    editIcon.setAttribute('data-bs-target', '#editModal');
    editIcon.setAttribute('data-bs-id', order.id);
    deleteIcon.classList = 'fa fa-trash btn col-2';
    deleteIcon.setAttribute('data-bs-toggle', 'modal');
    deleteIcon.setAttribute('data-bs-target', '#deleteModal');
    deleteIcon.setAttribute('data-bs-id', order.id);

    options.append(infoIcon, editIcon, deleteIcon);
    item.append(number, name, date, price, options);
    return item;
};

const buildOrdersTable = async () => {
    const orders = await getOrders();
    const ordersTable = document.querySelector('.orders-mountpoint');
    ordersTable.innerHTML = '';

    for (let i = 0; i < orders.length; i++) {
        ordersTable.append(await buildOrderItem(i + 1, orders[i]));
    }
};

const deleteOrder = async (id) => {
    const url = new URL(apiUrl + `/orders/${id}`);
    url.searchParams.append('api_key', apiKey);
    const response = await fetch(url, {
        method: 'DELETE'
    });

    console.log(response);

    if (!response.ok) 
        alert(`Ошибка удаления заявки (статус ${response.status})`, 'error');
    else {
        alert('Заявка успешно удалена', 'success');
        buildOrdersTable();
    }

    bsDeleteModal.hide();
};

const editOrder = async (id, data) => {
    const url = new URL(apiUrl + `/orders/${id}`);
    url.searchParams.append('api_key', apiKey);
    const response = await fetch(url, {
        method: 'PUT',
        body: data
    });

    console.log(response);

    if (!response.ok)
        alert(`Ошибка редактирования заявки (статус ${response.status})`, 
            'error');
    else {
        alert('Заявка успешно отредактирована', 'success');
        buildOrdersTable();
    }

    bsEditModal.hide();
};

const attachEditModalHandler = () => {
    const editModal = document.querySelector('#editModal');

    editModal.addEventListener('show.bs.modal', async (event) => {
        const button = event.relatedTarget;
        const id = button.getAttribute('data-bs-id');
        const data = await getDataSet(id);
        console.log(data);

        const modalBody = editModal.querySelector('.modal-body');
        const editBtn = editModal.querySelector('#modal-edit-button');
        const guideNameField = editModal.querySelector('.modal-guide-name');
        const routeNameField = editModal.querySelector('.modal-route-name');
        const dateSelect = editModal.querySelector('#modal-date');
        const timeSelect = editModal.querySelector('#modal-time');
        const durationSelect = editModal.querySelector('#modal-duration');
        const amountInput = editModal.querySelector('#modal-amount');
        const totalPrice = editModal.querySelector('.modal-total-price');
        const extraOption1 = editModal.querySelector('#extra-option-1');
        const extraOption2 = editModal.querySelector('#extra-option-2');

        guideNameField.textContent = data.guideName;
        routeNameField.textContent = data.routeName;
        dateSelect.value = data.date;
        timeSelect.value = data.time;
        durationSelect.value = data.duration;
        amountInput.value = data.amount;
        extraOption1.checked = data.optionFirst;
        extraOption2.checked = data.optionSecond;

        totalPrice.textContent = data.price;

        const modalHasCompleteData = () => {
            if (dateSelect.value && timeSelect.value && amountInput.value) 
                return true;
            return false;
        };

        const modalValidateData = () => {
            if (!validateDate(dateSelect.value)) {
                alert('Неверно выбрана дата', 'warning');
                return false;
            }
            if (!validateTime(timeSelect.value)) {
                alert('Неверно выбрано время. Вы можете выбрать время\
                 экскурсии от 9:00 до 23:00 с интервалом в 30 минут\
                  (9:00, 9:30, 10:00...)', 'warning');
                return false;
            }
            if (!validateAmount(amountInput.value)) {
                alert('Неверно выбрано количество человек. В экскурсии\
                 может участвовать от 1 до 20 человек', 'warning');
                return false;
            }
            if (modalHasCompleteData()) return true;
            return false;
        };

        modalBody.addEventListener('input', () => {
            if (modalHasCompleteData()) 
                totalPrice.textContent = getTotalPrice(dateSelect.value, 
                    timeSelect.value, data.pricePerHour, 
                    parseInt(durationSelect.value), 
                    parseInt(amountInput.value), 
                    extraOption1.checked, extraOption2.checked);
        });

        modalBody.addEventListener('change', () => {
            console.log('change event fired');
            if (modalHasCompleteData()) 
                totalPrice.textContent = getTotalPrice(dateSelect.value, 
                    timeSelect.value, data.pricePerHour, 
                    parseInt(durationSelect.value), 
                    parseInt(amountInput.value), 
                    extraOption1.checked, extraOption2.checked);
        });

        editBtn.onclick = () => {
            if (modalValidateData()) {
                const editPrice = getTotalPrice(dateSelect.value, 
                    timeSelect.value, 
                    data.pricePerHour, 
                    parseInt(durationSelect.value), 
                    parseInt(amountInput.value), 
                    extraOption1.checked, extraOption2.checked);

                const toEdit = new FormData();
                if (dateSelect.value != data.date) 
                    toEdit.append('date', dateSelect.value);
                if (timeSelect.value != data.time.slice(0, 5))
                    toEdit.append('time', timeSelect.value);
                if (amountInput.value != data.amount)
                    toEdit.append('persons', parseInt(amountInput.value));
                if (durationSelect.value != data.duration)
                    toEdit.append('duration', parseInt(durationSelect.value));
                if (extraOption1.checked != data.optionFirst)
                    toEdit.append('optionFirst', extraOption1.checked ? 1 : 0);
                if (extraOption2.checked != data.optionSecond)
                    toEdit.append('optionSecond', extraOption2.checked ? 1 : 0);
                if (editPrice != data.price)
                    toEdit.append('price', editPrice);
                
                editOrder(id, toEdit);
            }
        };
    });
};

const attachViewModalHandler = () => {
    const viewModal = document.querySelector('#viewModal');

    viewModal.addEventListener('show.bs.modal', async (event) => {
        const button = event.relatedTarget;
        const id = button.getAttribute('data-bs-id');
        const data = await getDataSet(id);

        const [guideName, routeName, date, time, duration, amount, price] = 
            viewModal.querySelectorAll('span');
        const [extraOption1, extraOption2] = 
            viewModal.querySelectorAll('.extra-option-1, .extra-option-2');
        const optionsTitle = viewModal.querySelector('.options-title');
        optionsTitle.classList.add('d-none');
        extraOption1.classList.add('d-none');
        extraOption2.classList.add('d-none');
        
        if (data.optionFirst) {
            extraOption1.classList.remove('d-none');
            optionsTitle.classList.remove('d-none');
        }
        if (data.optionSecond) {
            extraOption2.classList.remove('d-none');
            optionsTitle.classList.remove('d-none');
        }

        guideName.textContent = data.guideName;
        routeName.textContent = data.routeName;
        date.textContent = parseDate(data.date);
        time.textContent = data.time;
        duration.textContent = data.duration + 
            (data.duration == '1' ? ' час' : ' часа');
        amount.textContent = data.amount;
        price.textContent = data.price;
    });
};

const attachDeleteModalHandler = () => {
    const deleteModal = document.querySelector('#deleteModal');

    deleteModal.addEventListener('show.bs.modal', async (event) => {
        const button = event.relatedTarget;
        const id = button.getAttribute('data-bs-id');

        const deleteBtn = deleteModal.querySelector('.delete-btn');
        deleteBtn.onclick = () => {
            deleteOrder(id);
        };
    });
};

window.onload = async () => {
    buildOrdersTable();
    attachEditModalHandler();
    attachViewModalHandler();
    attachDeleteModalHandler();
};