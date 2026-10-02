const menu = document.querySelector('.burger-menu').onclick = function() {
    document.querySelector('.menu__list').classList.toggle('active-menu')
    document.querySelector('.burger-menu').classList.toggle('active')
};