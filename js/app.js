const addWidgetForm = document.querySelector(".sidebar__form");
const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");
const errorMessage = document.querySelector(".sidebar__error");
const widgetsList = document.querySelector(".widgets__list");
const clearButton = document.querySelector('.sidebar__clear');
let count = 0;
let widgets = [];


const runApp = async () => {
    checkLocalStorage()
    clearWidgets();
    submitListener()
}

function addWidget(id, latitude, longitude) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=0d0291632d2bdd2519cb082f179dd246&lang=ru&units=metric`)
        .then(response => response.json())
        .then(weather => {
            const icon = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
            renderWidget(id, weather, icon, latitude, longitude)
        })
        .catch(() => {
            errorMessage.textContent = "❌ Некорректные координаты";
        });
}

function renderWidget(id, data, icon, currentLatitude, currentLongitude) {
    const widget = document.createElement("div");
    widget.classList.add("widget");
    widget.innerHTML = `
        <h1 class="widget__coordinates">${data.coord.lat.toFixed(4)}°, ${data.coord.lon.toFixed(4)}°</h1>
        <div class="widget__wrapper">
            <div class="widget__weather">
                <img class="widget__weather__icon" src=${icon} alt="Weather Icon">
                <h2 class="widget__weather__temperature">${Math.floor(data.main.temp)}°</h2>
            </div>
            <div class="widget__info">
                <div class="widget__info__container">
                    <p class="widget__info__name">Ветер</p>
                    <p class="widget__info__value">${data.wind.speed.toFixed(0)} м/c</p>
                </div>
                <div class="widget__info__container">
                    <p class="widget__info__name">Влажность</p>
                    <p class="widget__info__value">${data.main.humidity}%</p>
                </div>
            </div>
        </div>
        <div id="widget__map${id}" class="widget__map"></div>
    `;
    widgetsList.appendChild(widget);
    ymaps.ready(() => initMap(id, currentLatitude, currentLongitude));
}

function initMap(id, latitude, longitude) {
    const map = new ymaps.Map(`widget__map${id}`, {
        center: [latitude, longitude],
        zoom: 8,
        controls: []
    });

    let placemark = new ymaps.Placemark([latitude, longitude], {}, {
        preset: "twirl#redDotIcon"
    });

    map.geoObjects.add(placemark);
}

function submitListener() {
    addWidgetForm.addEventListener("submit",  e => {
        e.preventDefault();
        let currentLatitude = latitudeInput.value;
        let currentLongitude = longitudeInput.value;
        widgets.push({id: count, latitude: currentLatitude, longitude: currentLongitude});
        addWidget(widgets.length, currentLatitude, currentLongitude);
        count += 1;
        localStorage.setItem("widgets", JSON.stringify(widgets));
        localStorage.setItem("count", count);
        addWidgetForm.reset();
        errorMessage.textContent = "";
    });
}

function clearWidgets() {
    clearButton.addEventListener("click", e => {
        widgets = [];
        count = 0;
        widgetsList.innerHTML = "";
        latitudeInput.value = "";
        longitudeInput.value = "";
        localStorage.clear();
    });
}

function checkLocalStorage() {
    if (widgetsList.innerHTML === "") {
        let tempWidgets = JSON.parse(localStorage.getItem("widgets"));
        if(tempWidgets) {
            widgets = tempWidgets
            widgets.map((widget, index) => {
                addWidget(index, widget.latitude, widget.longitude)
                count += 1
            })
        }
    }
}

runApp()
