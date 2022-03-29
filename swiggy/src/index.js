import { data } from '../public/data.js'; 
import { ELEMENT_ID, PAGINATION } from './constants.js';
import { removeAllChilds } from './util.js';

//state variables
const restaurants = data;
let sortBy = "name";
let filterName = "tags";
let filterValue = "";
let searchValue = "";
let isBookmarkPage = false;
let currentPage = 1;

//DOM elements
const restaurantCardsContainerElement = document.getElementById(ELEMENT_ID.RESTAURANT_CARD_CONTAINER);
const restaurantCardTemplateElement = document.getElementById(ELEMENT_ID.RESTAURANT_CARD_TEMPLATE);
const sortByElement = document.getElementById(ELEMENT_ID.SORT_BY);
const filterNameElement = document.getElementById(ELEMENT_ID.FILTER_NAME);
const filterValueElement = document.getElementById(ELEMENT_ID.FILTER_VALUE);
const searchElement = document.getElementById(ELEMENT_ID.SEARCH);
const bookmarkPageElement = document.getElementById(ELEMENT_ID.BOOKMARK_PAGE);
const paginationElement = document.getElementById(ELEMENT_ID.PAGINATION);
const pagesElement = document.getElementById(ELEMENT_ID.PAGES);
const pageTemplateElement = document.getElementById(ELEMENT_ID.PAGE);
const pageLeftElement = document.getElementById(ELEMENT_ID.PAGE_LEFT);
const pageRightElement = document.getElementById(ELEMENT_ID.PAGE_RIGHT);


const getFilteredRestaurants = () => (
    restaurants
    .filter(restaurant => !isBookmarkPage || restaurant.favorite)
    .filter(restaurant => JSON.stringify(restaurant).includes(searchValue))
    .filter(restaurant => restaurant[filterName].toString().includes(filterValue.toString()))
    .sort((a,b) => a[sortBy].toString().localeCompare(b[sortBy].toString()))
)

const getPaginatedRestaurants = () => {
    const startIndex = (currentPage-1)*PAGINATION.RECORD_PER_PAGE;
    const endIndex = startIndex + PAGINATION.RECORD_PER_PAGE;
    return getFilteredRestaurants().slice(startIndex, endIndex);
}

const getRestaurantElement = restaurant => {
    const {id, name, location, eta, rating, tags, favorite} = restaurant;
    const restaurantCard = restaurantCardTemplateElement.cloneNode(true);
    restaurantCard.setAttribute('id', `restaurant-id-${id}`);
    restaurantCard.querySelector("*[data-id='name']").textContent = name;
    restaurantCard.querySelector("*[data-id='location']").textContent = location;
    restaurantCard.querySelector("*[data-id='eta']").textContent = eta;
    restaurantCard.querySelector("*[data-id='rating']").textContent = rating;
    restaurantCard.querySelector("*[data-id='tags']").textContent = tags;
    restaurantCard.querySelector("*[data-id='bookmark']").textContent = favorite ? "bookmark" : "bookmark_border";
    restaurantCard.querySelector("*[data-id='bookmark']").addEventListener("click", () => onBookmarkClick(id));
    return restaurantCard;
}

const renderRestaurants = () => {
    const visibleRestaurants = getPaginatedRestaurants();
    removeAllChilds(restaurantCardsContainerElement);
    for (const restaurant of visibleRestaurants) {
        restaurantCardsContainerElement.appendChild(getRestaurantElement(restaurant));
    }
    renderPagination();
}

const getPageElement = (pageNumber) => {
    const pageElement = pageTemplateElement.cloneNode(true);
    pageElement.setAttribute('id', `page-id-${pageNumber}`);
    pageElement.dataset.id = pageNumber;
    pageElement.textContent = pageNumber;
    if(currentPage === pageNumber) {
        pageElement.classList.add('active')
    }
    return pageElement;
}

const calculateStartAndEndPages = () => {
    const totalRecords = getFilteredRestaurants().length;
    const totalPages = Math.floor( (totalRecords-1)/PAGINATION.RECORD_PER_PAGE+1 );
    let startPage = 1;
    let endPage = totalPages;
    if(totalPages > PAGINATION.MAX_PAGES) {
        if(currentPage <= Math.floor(PAGINATION.MAX_PAGES/2)) {
            startPage = 1;
            endPage = PAGINATION.MAX_PAGES;
            pageLeftElement.style.display = 'none';
        } else if(currentPage >= totalPages - Math.floor(PAGINATION.MAX_PAGES/2)) {
            startPage = totalPages - PAGINATION.MAX_PAGES + 1;
            endPage = totalPages;
            pageRightElement.style.display = 'none';
        } else {
            startPage = currentPage - Math.floor((PAGINATION.MAX_PAGES-1)/2);
            endPage = startPage + PAGINATION.MAX_PAGES - 1;
            pageLeftElement.style.display = 'block';
            pageRightElement.style.display = 'block';
        }
    } else {
        pageLeftElement.style.display = 'none';
        pageRightElement.style.display = 'none';
    }
    return { startPage, endPage };
}

const renderPagination = () => {
    const totalRecords = getFilteredRestaurants().length;
    removeAllChilds(pagesElement);
    const isPaginationVisible = totalRecords > PAGINATION.RECORD_PER_PAGE;
    if(isPaginationVisible) {
        const { startPage, endPage } = calculateStartAndEndPages();
        for(let i = startPage; i <= endPage; i++) {
            pagesElement.appendChild(getPageElement(i))
        }
    } else {
        pageLeftElement.style.display = 'none';
        pageRightElement.style.display = 'none';
    }
}

const sort = e => {
    sortBy = sortByElement.value;
    currentPage = 1;
    renderRestaurants();
}

const filterNameChange = e => {
    filterName = filterNameElement.value;
    filterValueElement.value = "";
    currentPage = 1;
    renderRestaurants();
}

const filterValueChange = e => {
    filterValue = filterValueElement.value;
    currentPage = 1;
    renderRestaurants();
}

const searchValueChange = e => {
    searchValue = searchElement.value;
    currentPage = 1;
    renderRestaurants();
}

const onPageChangeClick = e => {
    const pageId = e.target.dataset.id;
    if(pageId) {
        if(pageId === "left") {
            currentPage --;
        } else if(pageId === "right") {
            currentPage ++;
        } else {
            currentPage = Number(pageId);
        }
        renderRestaurants();
    }
}

const debouncedSearchValueChange = _.debounce(searchValueChange, 500);

const onBookmarkClick = id => {
    restaurants[id-1].favorite = !restaurants[id-1].favorite;
    const restaurantCard = document.getElementById(`restaurant-id-${id}`);
    restaurantCard.querySelector("*[data-id='bookmark']").textContent = restaurants[id-1].favorite ? "bookmark" : "bookmark_border";
}

const onBookmarkPageClick = id => {
    isBookmarkPage = !isBookmarkPage;
    bookmarkPageElement.textContent = isBookmarkPage ? "bookmark" : "bookmark_border";
    currentPage = 1;
    renderRestaurants();
}

function init() {
    sortByElement.addEventListener('change', sort);
    filterNameElement.addEventListener('change', filterNameChange);
    filterValueElement.addEventListener('keyup', filterValueChange);
    searchElement.addEventListener('keyup', debouncedSearchValueChange);
    bookmarkPageElement.addEventListener('click', onBookmarkPageClick);
    paginationElement.addEventListener('click', onPageChangeClick);
    renderRestaurants();
}

init();