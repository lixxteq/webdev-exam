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

const apiKey = 'f6733e30-cdd9-407c-8aff-6fe1edfafc3f';
const apiUrl = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api')

const getRoutes = async () => {
    const url = new URL(apiUrl + '/routes');
    url.searchParams.append('api_key', apiKey);
    const response = await fetch(url);
    const routes = await response.json();
    return routes;
};

const getGuides = async (id) => {
    const url = new URL(apiUrl + `/routes/${id}/guides`)
    url.searchParams.append('api_key', apiKey);
    const response = await fetch(url);
    const guides = await response.json();
    return guides;
}

const buildRoutesChunk = (chunk) => {
    const routesContainer = document.querySelector('.routes-mountpoint');
    routesContainer.innerHTML = '';
    for (let route of chunk) {
        // console.log(route);
        routesContainer.append(buildRouteItem(route))
    }
}

let routesCurrentPage = 1;
let currentSelectedRoute = null;
let currentSelectedGuide = null;

const setActive = (page) => {
    const paginationBar = document.querySelector('.pagination');
    for (let el of paginationBar.children) {
        el.classList.remove('active');
        if (el.value == page) el.classList.add('active');
    }
}

const setupPagination = (partitioned) => {
    console.log(partitioned);
    routesCurrentPage = 1;
    const paginationBar = document.querySelector('.pagination');
    let currPages = paginationBar.children;
    while (currPages.length > 2) {
        paginationBar.removeChild(currPages[currPages.length-2]);
    }

    const [prevBtn, nextBtn] = paginationBar.querySelectorAll('.page-item');
    const setupButtons = () => {
        prevBtn.onclick = () => {
            routesCurrentPage -= 1;
            buildRoutesChunk(partitioned[routesCurrentPage]);
            setActive(routesCurrentPage);
            
        }
        nextBtn.onclick = () => {
            routesCurrentPage += 1;
            buildRoutesChunk(partitioned[routesCurrentPage]);
            setActive(routesCurrentPage);
            
        }
    }

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
            buildRoutesChunk(partitioned[i-1]);
            setActive(i)
            routesCurrentPage = i;
        }
        nextBtn.before(pageBtn);
    }

    setupButtons();
}

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

const setActiveGuide = (guide) => {
    const guidesTable = document.querySelector('.guides-mountpoint');
    currentSelectedGuide = guide;

    for (let el of guidesTable.children) {
        el.classList.remove('selected-item');
        if (el.getAttribute('data-value') == guide.id) el.classList.add('selected-item');
    }

    const confirmBtnContainer = document.querySelector('.confirm');
    confirmBtnContainer.classList.remove('d-none');
}

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
    item.setAttribute('data-value', guide.id);
    chooseBtn.onclick = () => {
        setActiveGuide(guide);
    }

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

const setActiveRoute = (route) => {
    const routesContainer = document.querySelector('.routes-mountpoint');
    currentSelectedRoute = route;
    currentSelectedGuide = null;
    const routeElements = routesContainer.children;
    for (let el of routeElements) {
        el.classList.remove('selected-item');
        if (el.getAttribute('data-value') == route.id) el.classList.add('selected-item');
    }
}

const buildRouteItem = (route) => {
    // console.log(route);
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
        // selectGuideOptionsHandler(guidesList);
    }

    item.append(name, desc, objects, select);
    return item;
};

const buildGuideLangsList = (guidesList) => {
    const langSelect = document.querySelector('#select-by-lang');
    langSelect.innerHTML = ''
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
        if ((guide.language == lang || lang == 'null') && (guide.workExperience >= experience || experience == '')) requiredGuides.push(guide);
    }
    console.log(requiredGuides);
    return requiredGuides;
}

const attachGuideSelectHandler = (guidesList) => {
    const langSelect = document.querySelector('#select-by-lang');
    console.log(langSelect);
    const experienceInput = document.querySelector('#select-by-experience');

    const selectHandler = () => {
        const lang = langSelect.value;
        const minExperience = experienceInput.value;
        console.log('handler invoked');

        if (lang.value == 'null' && minExperience == '') buildGuidesList(guidesList)
        else buildGuidesList(selectGuides(lang, minExperience, guidesList));
    }

    langSelect.onchange = selectHandler;
    experienceInput.oninput = selectHandler;
}

const buildMainObjectsList = (allRoutes) => {
    const objectSelect = document.querySelector('#select-by-object');
    const objectsList = [];
    for (let route of allRoutes) {
        let objects = route.mainObject.split('–').join('-').split('-');
        objects = objects.map(el => el.trim());
        objects.forEach((el) => {
            objectsList.push(el);
        })
    }
    const uniqObjectsList = [...new Set(objectsList)];
    uniqObjectsList.forEach((el) => {
        let option = document.createElement('option');
        option.textContent = el;
        option.value = el;
        objectSelect.append(option);
    })
}

const attachSearchHandler = (allRoutes) => {
    const searchBar = document.querySelector('.search-bar');
    const objectSelect = document.querySelector('#select-by-object');
    const searchHandler = () => {
        const query = searchBar.value;
        const mainObject = objectSelect.value;
        if (query == '' && mainObject == 'null') buildRoutesList(allRoutes)
        else buildRoutesList(searchRoutes(query, mainObject, allRoutes));
    }
    searchBar.oninput = searchHandler;
    objectSelect.onchange = searchHandler;
}

const searchRoutes = (searchQuery, mainObject, allRoutes) => {
    const requiredRoutes = [];
    for (let route of allRoutes) {
        if ((route.name.includes(searchQuery) || searchQuery == '') && (route.mainObject.includes(mainObject) || mainObject == 'null')) requiredRoutes.push(route);
    };
    console.log(requiredRoutes);
    return requiredRoutes;
}

// const validate = (date, time, amount) => {
//     // var dateformat = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
//     // console.log(date);
//     // if (date.match(dateformat)) return true
//     // else return false;
//     return true;
// }
const isWeekend = (date) => {

}

const is

const calculatePrice = (date, guideHourPrice, hoursNumber, )

const attachModalHandler = () => {
    const openModalBtn = document.querySelector('.confirm-button');
    const modalWindow = document.querySelector('#confirmModal');
    // const cancelBtn = modalWindow.querySelector('.cancel-btn');

    modalWindow.addEventListener('show.bs.modal', () => {
        if (!currentSelectedGuide || !currentSelectedRoute) {
            alert('Выберите маршрут и гида', 'error');
            modalWindow.classList.remove('show')
        }
        else {
            const confirmBtn = modalWindow.querySelector('#modal-confirm-button');
            const guideNameField = modalWindow.querySelector('.modal-guide-name');
            const routeNameField = modalWindow.querySelector('.modal-route-name');
            const dateSelect = modalWindow.querySelector('#modal-date');
            const timeSelect = modalWindow.querySelector('#modal-time');
            const durationSelect = modalWindow.querySelector('#modal-duration');
            const amountInput = modalWindow.querySelector('#modal-amount');
            // const extraOption1 = modalWindow.querySelector('#modal-option-1');

            guideNameField.textContent = currentSelectedGuide.name;
            routeNameField.textContent = currentSelectedRoute.name;
            amountInput.textContent = 'Заполните все поля';

            confirmBtn.onclick = () => {
                // if (!validate(dateSelect.value, timeSelect.value, amountInput.value)) {
                //     alert('Введены неверные данные', 'error');
                //     modalWindow.classList.remove('show');
                // }
                
            }
        }
    })
}

window.onload = async () => {
    const allRoutes = await getRoutes();
    buildRoutesList(allRoutes);
    buildMainObjectsList(allRoutes);
    attachSearchHandler(allRoutes);
    attachModalHandler();
}