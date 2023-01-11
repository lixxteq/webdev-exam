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
};



const buildRouteItem = (route) => {
    // console.log(route);
    const item = document.createElement('tr');
    const name = document.createElement('th');
    const desc = document.createElement('th');
    const objects = document.createElement('th');
    const select = document.createElement('th');
    const selectBtn = document.createElement('button')
    selectBtn.textContent = 'Выбрать маршрут';
    name.textContent = route.name;
    desc.textContent = route.description;
    objects.textContent = route.mainObject;
    select.append(selectBtn);
    selectBtn.onclick = () => {
        currentSelectedRoute = route;
        buildGuidesList(route.id)
    }

    item.append(name, desc, objects, select);
    return item;
};

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

window.onload = async () => {
    const allRoutes = await getRoutes();
    buildRoutesList(allRoutes);
    buildMainObjectsList(allRoutes);
    attachSearchHandler(allRoutes);
}