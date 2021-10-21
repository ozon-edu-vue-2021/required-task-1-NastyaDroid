'use strict';

var action = document.querySelector('.action');

var templateImagePopup = document.querySelector('#popup-image');
var container = document.querySelector('.images');
var popup = document.querySelector('.popup');
var popupContainer = document.querySelector('.popup .content');
var popupClose = document.querySelector('.popup .action');
var loader = document.querySelector('.loader');

const MAX_PAGE_IMAGES = 34;
 var loaderTimeout;

/**
 * Функция задаёт первоначальное состояние страницы.
 * Отправляется первый запрос за картинками, юез параметров т.к. с дефолтными настройками.
 */
var initialState = function () {
    action.disabled = false;
    let classes = action.classList;
    classes.remove('action');
    getPictures();
}

/**
 * Функция запрашивает картинки для галереи
 * и вызывает ф-цию отрисовки полученных картинок
 * @param {number} page
 * @param {number} limit
 */
var getPictures = function (nextPage, limit = 10) {
    showLoader();
    fetch(`https://picsum.photos/v2/list?page=${nextPage};limit=${limit}`)
        .then(function (response) {return response.json()})
        .then(function (result) {renderPictures(result)})
}

/**
 * Функция запрашивает информацию о конкретной картинке по её id
 * и вызывает ф-цию для отрисовки картинки в попапе
 * @param {number} id
 */
var getPictureInfo = function (id) {
    showLoader();
    fetch(`https://picsum.photos/id/${id}/info`)
        .then(function (response) {return response.json()})
        .then(function (result) {renderPopupPicture(result)})
}

/**
 * Функция показывает индикатор загрузки.
 * Меняет ситили, ничего не возвращает.
 */
var showLoader = function () {
    loader.style.visibility = 'visible';
}

/**
 * Функция скрывает индикатор загрузки.
 * Удаляет таймаут индикатора, ничего не возвращает.
 */
var hideLoader = function () {
    loaderTimeout = setTimeout(function () {
        loader.style.visibility = 'hidden';
        clearTimeout(loaderTimeout);
    }, 700);
}

/**
 * Функция пропорционально делит размер картинки,
 * чтобы в превью не загружать слишком большие картинки,
 * которые возвращает сервис
 * @param {string} src
 * @param {number} size
 */
var cropImage = function (src, size = 2) {
    var [domain, key, id, width, height] = src.split('/').splice(2);
    var newWidth = Math.floor(+width / size);
    var newHeight = Math.floor(+height / size);

    return `https://${domain}/${key}/${id}/${newWidth}/${newHeight}`;
}

/**
 * Функция копирует шаблон для каждой картинки,
 * заполняет его и встраивает в разметку
 * @param {array} list
 */
var renderPictures = function (list) {
    if (!list.length) {
        throw Error(`Pictures not defined. The list length: ${list.length}`);
    }
    var templateImageCard = document.querySelector('#image');
    var fragment = document.createDocumentFragment();

    list.forEach(function (element) {
        var clone = templateImageCard.content.cloneNode(true);
        var link = clone.querySelector('a');

        link.href = element.url;
        link.dataset.id = element.id;

        var image = clone.querySelector('img');
        image.src = cropImage(element.download_url, 5);
        image.alt = element.author;
        image.classList.add('preview');
        fragment.appendChild(clone)
    });

    container.appendChild(fragment);
    hideLoader();
}

/**
 * Функция копирует шаблон для картинки в попапе,
 * заполняет его и встраивает в попап
 * @param {object} picture
 */
var renderPopupPicture = function (picture) {
    var clone = templateImagePopup.content.cloneNode(true);
    var img = clone.querySelector('img');
    var link = clone.querySelector('a');
    var author = clone.querySelector('.author');

    img.src = cropImage(picture.download_url, 2);
    img.alt = picture.author;
    author.textContent = picture.author;
    img.width = picture.width / 10;
    link.href = picture.download_url;

    popupContainer.innerHTML = '';
    popupContainer.appendChild(clone)
    hideLoader();
    togglePopup();
}

/**
 * Функция переклбчает класс открытия на попапе
 */
var togglePopup = function () {
    popup.classList.toggle('open');
}

/**
 * @type {object} MouseEvent
 */

/**
 * Обработчик кнопки подгрузки картинок
 * @param {MouseEvent} evt
 */
var actionHandler = function (evt) {
    evt.preventDefault();
    var nextPage = evt.currentTarget.dataset.page;
    evt.currentTarget.dataset.page = Number(nextPage) + 1;
    console.log(nextPage);

    if (nextPage > MAX_PAGE_IMAGES) {
        console.warn(`WARN: You are trying to call a page that exceeds ${MAX_PAGE_IMAGES}`);
        evt.currentTarget.disabled = true;
    } else {
        getPictures(nextPage);
    }
}

/**
 * Обработчик события click по картинкам.
 * Запрашивает данные по картинке, на которую кликнули,
 * для открытия попапа с ней
 * @param {MouseEvent} evt
 */
var imageHandler = function (evt) {
    evt.preventDefault();

    if (evt.target.closest('a')) {
        getPictureInfo(evt.target.parentNode.getAttribute('data-id')); 
    }
}

action.addEventListener('click', actionHandler);
container.addEventListener('click', imageHandler);
popupClose.addEventListener('click', togglePopup);

initialState();
