'use strict';



/**
 * add event on element
 */

const addEventOnElem = function (elem, type, callback) {
  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      elem[i].addEventListener(type, callback);
    }
  } else {
    elem.addEventListener(type, callback);
  }
}



/**
 * toggle navbar
 */

const navbar = document.querySelector("[data-navbar]");
const navLinks = document.querySelectorAll("[data-nav-link]");
const navToggler = document.querySelector("[data-nav-toggler]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  navToggler.classList.toggle("active");
}

addEventOnElem(navToggler, "click", toggleNavbar);

const closeNavbar = function () {
  navbar.classList.remove("active");
  navToggler.classList.remove("active");
}

addEventOnElem(navLinks, "click", closeNavbar);



/**
 * header active
 */

const header = document.querySelector("[data-header]");

window.addEventListener("scroll", function () {
  if (window.scrollY > 100) {
    header.classList.add("active");
  } else {
    header.classList.remove("active");
  }
});


function showFullscreenImage(imageSrc) {
  const overlay = document.getElementById('fullscreenOverlay');
  const image = document.getElementById('fullscreenImage');

  image.src = imageSrc;
  overlay.classList.add('active');
}

function hideFullscreenImage() {
  const overlay = document.getElementById('fullscreenOverlay');
  overlay.classList.remove('active');

  // Wait for the fade-out transition to complete before clearing the image source
  setTimeout(() => {
    const image = document.getElementById('fullscreenImage');
    image.src = '';
  }, 500); // Match the CSS transition duration
}

