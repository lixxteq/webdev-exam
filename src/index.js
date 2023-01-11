const bsModal = new bootstrap.Modal(document.getElementById('confirmModal'));
let routesCurrentPage = 1;
let currentSelectedRoute = null;
let currentSelectedGuide = null;

const getRoutes = async () => {
    const url = new URL(apiUrl + '/routes');
    url.searchParams.append('api_key', apiKey);
    const response = await fetch(url);
    const routes = await response.json();
    return routes;
};

const getGuides = async (id) => {
    const url = new URL(apiUrl + `/routes/${id}/guides`);
    url.searchParams.append('api_key', apiKey);
    const response = await fetch(url);
    const guides = await response.json();
    return guides;
};

const setActiveGuide = (guide) => {
    const guidesTable = document.querySelector('.guides-mountpoint');
    currentSelectedGuide = guide;

    for (let el of guidesTable.children) {
        el.classList.remove('selected-item');
        if (el.getAttribute('data-value') == guide.id) 
            el.classList.add('selected-item');
    }

    const confirmBtnContainer = document.querySelector('.confirm');
    confirmBtnContainer.classList.remove('d-none');
};

const buildGuideItem = (guide) => {
    const item = document.createElement('tr');
    const avatar = document.createElement('th');
    const name = document.createElement('th');
    const langs = document.createElement('th');
    const experience = document.createElement('th');
    const price = document.createElement('th');
    const choose = document.createElement('th');
    const chooseBtn = document.createElement('a');
    const avatarImg = document.createElement('img');

    avatarImg.src = '/assets/avatar';
    avatarImg.width = 64;
    avatar.append(avatarImg);
    name.textContent = guide.name;
    langs.textContent = guide.language;
    price.textContent = guide.pricePerHour;
    experience.textContent = guide.workExperience;
    chooseBtn.textContent = 'Выбрать гида';
    chooseBtn.classList = 'btn btn-outline-secondary';
    chooseBtn.href = '#confirm';
    item.setAttribute('data-value', guide.id);
    chooseBtn.onclick = () => {
        setActiveGuide(guide);
    };

    choose.append(chooseBtn);
    item.append(avatar, name, langs, experience, price, choose);
    return item;
};

const buildGuidesList = async (guidesList) => {
    const guidesContainer = document.querySelector('#guides');
    const guidesTable = guidesContainer.querySelector('.guides-mountpoint');
    const routeTitle = guidesContainer.querySelector('.route-title');
    routeTitle.textContent = `Выбранный маршрут: ${currentSelectedRoute.name}`;
    guidesTable.innerHTML = '';

    for (let guide of guidesList) {
        guidesTable.append(buildGuideItem(guide));
    };

    guidesContainer.classList.remove('d-none');
    if (currentSelectedGuide != null) setActiveGuide(currentSelectedGuide);
};

const buildGuideLangsList = (guidesList) => {
    const langSelect = document.querySelector('#select-by-lang');
    langSelect.innerHTML = '';
    console.log('invoked');


    const langs = [];
    for (let guide of guidesList) {
        langs.push(guide.language);
    }
    const uniqLangsList = [...new Set(langs)];
    console.log(uniqLangsList);

    const nullOption = document.createElement('option');
    nullOption.textContent = 'Не выбрано';
    nullOption.value = 'null';
    langSelect.append(nullOption);

    for (let l of uniqLangsList) {
        let option = document.createElement('option');
        option.textContent = l;
        option.value = l;
        langSelect.append(option);
        console.log('appended');
    }
};

const selectGuides = (lang, experience, guidesList) => {
    const requiredGuides = [];
    console.log('select invoked');
    for (let guide of guidesList) {
        if ((guide.language == lang || lang == 'null') && 
        (guide.workExperience >= experience || experience == '')) 
            requiredGuides.push(guide);
    }
    console.log(requiredGuides);
    return requiredGuides;
};

const attachGuideSelectHandler = (guidesList) => {
    const langSelect = document.querySelector('#select-by-lang');
    console.log(langSelect);
    const experienceInput = document.querySelector('#select-by-experience');

    const selectHandler = () => {
        const lang = langSelect.value;
        const minExperience = experienceInput.value;
        console.log('handler invoked');

        if (lang.value == 'null' && minExperience == '')
            buildGuidesList(guidesList);
        else buildGuidesList(selectGuides(lang, minExperience, guidesList));
    };

    langSelect.onchange = selectHandler;
    experienceInput.oninput = selectHandler;
};

const setActiveRoute = (route) => {
    const routesContainer = document.querySelector('.routes-mountpoint');
    currentSelectedRoute = route;
    currentSelectedGuide = null;
    const routeElements = routesContainer.children;
    for (let el of routeElements) {
        el.classList.remove('selected-item');
        if (el.getAttribute('data-value') == route.id) 
            el.classList.add('selected-item');
    }
};

const buildRouteItem = (route) => {
    const item = document.createElement('tr');
    const name = document.createElement('th');
    const desc = document.createElement('th');
    const objects = document.createElement('th');
    const select = document.createElement('th');
    const selectBtn = document.createElement('a');
    selectBtn.textContent = 'Выбрать маршрут';
    selectBtn.classList = 'btn btn-outline-secondary';
    selectBtn.href = '#guides';
    item.setAttribute('data-value', route.id);
    name.textContent = route.name;
    desc.textContent = route.description;
    objects.textContent = route.mainObject;
    select.append(selectBtn);
    selectBtn.onclick = async () => {
        setActiveRoute(route);
        const guidesList = await getGuides(currentSelectedRoute.id);
        buildGuidesList(guidesList);
        buildGuideLangsList(guidesList);
        attachGuideSelectHandler(guidesList);
    };

    item.append(name, desc, objects, select);
    return item;
};

const buildRoutesChunk = (chunk) => {
    const routesContainer = document.querySelector('.routes-mountpoint');
    routesContainer.innerHTML = '';
    for (let route of chunk) {
        routesContainer.append(buildRouteItem(route));
    }
};

const setActive = (page) => {
    const paginationBar = document.querySelector('.pagination');
    for (let el of paginationBar.children) {
        el.classList.remove('active');
        if (el.value == page) el.classList.add('active');
    }
};

const setupPagination = (partitioned) => {
    console.log(partitioned);
    routesCurrentPage = 1;
    const paginationBar = document.querySelector('.pagination');
    let currPages = paginationBar.children;
    while (currPages.length > 2) {
        paginationBar.removeChild(currPages[currPages.length - 2]);
    }

    const [prevBtn, nextBtn] = paginationBar.querySelectorAll('.page-item');
    const setupButtons = () => {
        prevBtn.onclick = () => {
            routesCurrentPage -= 1;
            buildRoutesChunk(partitioned[routesCurrentPage]);
            setActive(routesCurrentPage);

        };
        nextBtn.onclick = () => {
            routesCurrentPage += 1;
            buildRoutesChunk(partitioned[routesCurrentPage]);
            setActive(routesCurrentPage);

        };
    };

    for (let i = 1; i <= partitioned.length; i++) {
        const pageBtn = document.createElement('li');
        const pageLink = document.createElement('a');
        pageBtn.classList.add('page-item');
        pageBtn.value = i;
        pageLink.classList.add('page-link');
        pageLink.href = '#routes';
        pageLink.textContent = i.toString();
        pageBtn.append(pageLink);
        pageBtn.onclick = () => {
            buildRoutesChunk(partitioned[i - 1]);
            setActive(i);
            routesCurrentPage = i;
        };
        nextBtn.before(pageBtn);
    }

    setupButtons();
};

const buildRoutesList = async (routes = null) => {
    if (!routes) {
        routes = await getRoutes();
    }

    const partitioned = [];
    for (let i = 0; i < routes.length; i += 5) {
        const part = routes.slice(i, i + 5);
        partitioned.push(part);
    }

    setupPagination(partitioned);
    buildRoutesChunk(partitioned[0]);
    if (currentSelectedRoute != null) setActiveRoute(currentSelectedRoute);
};

const buildMainObjectsList = (allRoutes) => {
    const objectSelect = document.querySelector('#select-by-object');
    const objectsList = [];
    for (let route of allRoutes) {
        let objects = route.mainObject.split('–').join('-').split('-');
        objects = objects.map(el => el.trim());
        objects.forEach((el) => {
            objectsList.push(el);
        });
    }
    const uniqObjectsList = [...new Set(objectsList)];
    uniqObjectsList.forEach((el) => {
        let option = document.createElement('option');
        option.textContent = el;
        option.value = el;
        objectSelect.append(option);
    });
};

const searchRoutes = (searchQuery, mainObject, allRoutes) => {
    const requiredRoutes = [];
    for (let route of allRoutes) {
        if ((route.name.includes(searchQuery) || searchQuery == '') && 
        (route.mainObject.includes(mainObject) || mainObject == 'null')) 
            requiredRoutes.push(route);
    };
    console.log(requiredRoutes);
    return requiredRoutes;
};

const attachSearchHandler = (allRoutes) => {
    const searchBar = document.querySelector('.search-bar');
    const objectSelect = document.querySelector('#select-by-object');
    const searchHandler = () => {
        const query = searchBar.value;
        const mainObject = objectSelect.value;
        if (query == '' && mainObject == 'null') buildRoutesList(allRoutes);
        else buildRoutesList(searchRoutes(query, mainObject, allRoutes));
    };
    searchBar.oninput = searchHandler;
    objectSelect.onchange = searchHandler;
};

const postOrder = async (data) => {
    const url = new URL(apiUrl + `/orders`);
    url.searchParams.append('api_key', apiKey);
    const response = await fetch(url, {
        method: 'POST',
        body: data,
    });
    if (!response.ok) 
        alert(`Ошибка оформления заказа (статус ${response.status})`);
    else alert('Заказ успешно оформлен', 'success');

    bsModal.hide();
};

const attachModalHandler = () => {
    const modalWindow = document.querySelector('#confirmModal');

    modalWindow.addEventListener('show.bs.modal', () => {
        if (!currentSelectedGuide || !currentSelectedRoute) {
            alert('Выберите маршрут и гида', 'error');
            bsModal.hide();
        } else {
            const modalBody = modalWindow.querySelector('.modal-body');
            const confirmBtn = 
                modalWindow.querySelector('#modal-confirm-button');
            const guideNameField = 
                modalWindow.querySelector('.modal-guide-name');
            const routeNameField = 
                modalWindow.querySelector('.modal-route-name');
            const dateSelect = modalWindow.querySelector('#modal-date');
            const timeSelect = modalWindow.querySelector('#modal-time');
            const durationSelect = modalWindow.querySelector('#modal-duration');
            const amountInput = modalWindow.querySelector('#modal-amount');
            const totalPrice = modalWindow.querySelector('.modal-total-price');
            const extraOption1 = modalWindow.querySelector('#extra-option-1');
            const extraOption2 = modalWindow.querySelector('#extra-option-2');

            guideNameField.textContent = currentSelectedGuide.name;
            routeNameField.textContent = currentSelectedRoute.name;
            totalPrice.textContent = 'Заполните все поля';

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
                        timeSelect.value, currentSelectedGuide.pricePerHour, 
                        parseInt(durationSelect.value), 
                        parseInt(amountInput.value), 
                        extraOption1.checked, extraOption2.checked);
            });

            modalBody.addEventListener('change', () => {
                console.log('change event fired');
                if (modalHasCompleteData()) 
                    totalPrice.textContent = getTotalPrice(dateSelect.value, 
                        timeSelect.value, currentSelectedGuide.pricePerHour, 
                        parseInt(durationSelect.value), 
                        parseInt(amountInput.value), 
                        extraOption1.checked, extraOption2.checked);
            });

            confirmBtn.onclick = () => {
                if (modalValidateData()) {
                    const orderInfo = new FormData();
                    orderInfo.append('guide_id', currentSelectedGuide.id);
                    orderInfo.append('route_id', currentSelectedRoute.id);
                    orderInfo.append('date', dateSelect.value);
                    orderInfo.append('time', timeSelect.value);
                    orderInfo.append('duration', 
                        parseInt(durationSelect.value));
                    orderInfo.append('persons', parseInt(amountInput.value));
                    orderInfo.append('price', 
                        getTotalPrice(dateSelect.value, timeSelect.value, 
                            currentSelectedGuide.pricePerHour, 
                            parseInt(durationSelect.value), 
                            parseInt(amountInput.value), 
                            extraOption1.checked, extraOption2.checked));
                    orderInfo.append('optionFirst', 
                        extraOption1.checked ? 1 : 0);
                    orderInfo.append('optionSecond', 
                        extraOption2.checked ? 1 : 0);

                    console.log(orderInfo.get('optionFirst'));
                    postOrder(orderInfo);
                }
            };
        }
    });
};

window.onload = async () => {
    const allRoutes = await getRoutes();
    buildRoutesList(allRoutes);
    buildMainObjectsList(allRoutes);
    attachSearchHandler(allRoutes);
    attachModalHandler();
};