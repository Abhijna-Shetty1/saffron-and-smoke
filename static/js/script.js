const header = document.querySelector(".site-header");

window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});


/* =========================
   SCROLL REVEAL
========================= */

const revealElements = document.querySelectorAll(
    ".section-label, h2, .story-copy, .story-image, " +
    ".menu-section, .experience-item, .gallery-item, " +
    ".chef-copy, .chef-image, .reservation-copy, " +
    ".reservation-form, .location-inner"
);

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.15
    }
);

revealElements.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
});

const reservationForm = document.querySelector(".reservation-form");

if (reservationForm) {
    reservationForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(reservationForm);

        const reservation = {
            name: formData.get("name"),
            guests: formData.get("guests"),
            date: formData.get("date"),
            time: formData.get("time")
        };

        try {
            const response = await fetch("/api/reservations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(reservation)
            });

            const result = await response.json();

            if (result.success) {
                alert("Your table request has been received.");
                reservationForm.reset();
            } else {
                alert(result.message);
            }

        } catch (error) {
            alert("Unable to submit your request. Please try again.");
            console.error(error);
        }
    });
}

console.log("Saffron & Smoke JS loaded");

/* =========================
   RESERVATION DATE
========================= */

const reservationDate = document.querySelector("#reservation-date");

if (reservationDate) {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    reservationDate.min = `${year}-${month}-${day}`;
}

/* =========================
   MENU CATEGORY TABS
========================= */

const menuTabs = document.querySelectorAll(".menu-tab");
const menuCarousels = document.querySelectorAll(".menu-carousel");

menuTabs.forEach((tab) => {

    tab.addEventListener("click", () => {

        const category = tab.dataset.category;

        menuTabs.forEach((item) => {
            item.classList.remove("active");
        });

        menuCarousels.forEach((carousel) => {
            carousel.classList.remove("active");
        });

        tab.classList.add("active");

        const selectedCarousel = document.getElementById(category);

        if (selectedCarousel) {
            selectedCarousel.classList.add("active");
        }

    });

});

/* =========================
   MENU CATEGORY FILTERS
========================= */

const menuFilters = document.querySelectorAll(".menu-filter");
const menuCategories = document.querySelectorAll(".menu-category");

menuFilters.forEach((button) => {
    button.addEventListener("click", () => {

        const category = button.dataset.category;

        menuFilters.forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        menuCategories.forEach((menu) => {
            menu.classList.toggle(
                "active",
                menu.dataset.menuCategory === category
            );
        });
    });
});