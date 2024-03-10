document.addEventListener("DOMContentLoaded", function () {
	document
		.querySelectorAll(".slideshow_for_posts--container")
		.forEach((container) => {
			// Initial API call setup
			const numberOfPosts = container.getAttribute("data-num-posts") || "3";
			const sortOrder = container.getAttribute("data-sort-order") || "desc";
			const customApiUrl =
				container.getAttribute("data-custom-api-url") || "https://wptavern.com";
			const initialApiUrl = `${customApiUrl}/wp-json/wp/v2/posts?_embed&per_page=${numberOfPosts}&order=${sortOrder}&orderby=date`;

			// Fetch initial posts
			fetchAndUpdatePosts(initialApiUrl, container, numberOfPosts, sortOrder);
		});
});

function renderPosts(posts, container) {
	let slidesOuter = container.querySelector(
		".slideshow_for_posts--slides_outer",
	);
	let slidesContainer = container.querySelector(".slideshow_for_posts--slides");
	if (!slidesContainer && !slidesContainer) {
		slidesOuter = document.createElement("div");
		slidesOuter.className = "slideshow_for_posts--slides_outer";
		container.appendChild(slidesOuter);

		slidesContainer = document.createElement("div");
		slidesContainer.className = "slideshow_for_posts--slides";
		slidesOuter.appendChild(slidesContainer);
	} else {
		slidesContainer.innerHTML = ""; // Clear existing slides for new content
	}

	posts.forEach((post) => {
		const slide = document.createElement("div");
		slide.className = "slideshow_for_posts--slide";

		const title = post.title.rendered;
		const imageUrl = post._embedded["wp:featuredmedia"]
			? post._embedded["wp:featuredmedia"][0].source_url
			: "";
		const date = new Date(post.date).toLocaleDateString();
		const excerpt = post.excerpt.rendered;
		const link = post.link;

		slide.innerHTML = `
            <div class="slideshow_for_posts--content">
                ${imageUrl ? `<img src="${imageUrl}" alt="${title}" />` : ""}
                <a href="${link}" target="_blank"><h4 class="title">${title}</h4></a>
                <p class="date">${date}</p>
                <div class="excerpt">${excerpt}</div>
                <a class="button" href="${link}" target="_blank">Read more</a>
            </div>
        `;

		slidesOuter.appendChild(slidesContainer);
		slidesContainer.appendChild(slide);
	});

	// Add or update the form for custom API URL input
	let form = container.querySelector("form");
	if (!form) {
		form = document.createElement("form");
		form.classList.add("slideshow_for_posts--form");
		form.innerHTML = `
              <input type="text" id="customApiUrl" placeholder="Enter WordPress site URL" />
              <button type="submit">New Posts</button>
          `;
		slidesOuter.prepend(form);
	}

	form.onsubmit = (e) => {
		e.preventDefault();
		const numberOfPosts = container.getAttribute("data-num-posts") || "3";
		const sortOrder = container.getAttribute("data-sort-order") || "desc";
		const customApiUrl = form.querySelector("#customApiUrl").value.trim();
		if (customApiUrl) {
			// Adjusted API call to use the provided URL
			const fullApiUrl = `${customApiUrl}/wp-json/wp/v2/posts?_embed&per_page=${numberOfPosts}&order=${sortOrder}&orderby=date`;
			fetchAndUpdatePosts(fullApiUrl, container, numberOfPosts, sortOrder);
		}
	};

	// Reinitialize the slider
	setupSlider(container);
}

function fetchAndUpdatePosts(apiUrl, container, numberOfPosts, sortOrder) {
	const cacheKey = `posts_${encodeURIComponent(apiUrl)}`;

	const cachedPosts = sessionStorage.getItem(cacheKey);
	if (cachedPosts) {
		const posts = JSON.parse(cachedPosts);
		renderPosts(posts, container);
		setupSlider(container);
	} else {
		fetch(
			`${apiUrl}/wp-json/wp/v2/posts?_embed&per_page=${numberOfPosts}&order=${sortOrder}&orderby=date`,
		)
			.then((response) => response.json())
			.then((posts) => {
				sessionStorage.setItem(cacheKey, JSON.stringify(posts));
				renderPosts(posts, container);
				setupSlider(container);
			})
			.catch((error) => console.error("Fetching posts failed:", error));
	}
}

function setupSlider(container) {
	const existingNextBtn = container.querySelector(".slideshow_for_posts--next");
	const existingPrevBtn = container.querySelector(".slideshow_for_posts--prev");
	if (existingNextBtn) existingNextBtn.remove();
	if (existingPrevBtn) existingPrevBtn.remove();

	let currentIndex = 0;
	const slidesContainer = container.querySelector(
		".slideshow_for_posts--slides",
	);
	const slides = slidesContainer.querySelectorAll(
		".slideshow_for_posts--slide",
	);
	const totalSlides = slides.length;
	let startX, endX;

	function updateActiveSlide() {
		slides.forEach((slide, index) => {
			if (index === currentIndex) {
				slide.classList.add("active");
			} else {
				slide.classList.remove("active");
			}
		});
	}

	// Initialize the first slide as active
	updateActiveSlide();

	function updateSlidePosition() {
		const newTransformValue = `translateX(-${currentIndex * 100}%)`;
		slidesContainer.style.transform = newTransformValue;
	}

	function goToNextSlide() {
		currentIndex = (currentIndex + 1) % totalSlides;
		updateActiveSlide();
		updateSlidePosition();
	}

	function goToPreviousSlide() {
		currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
		updateActiveSlide();
		updateSlidePosition();
	}

	const onDragStart = (e) => {
		startX = e.clientX;
	};

	const onDragEnd = (e) => {
		endX = e.clientX;
		const threshold = 50; // Minimum distance to trigger a slide change
		if (startX - endX > threshold) {
			goToNextSlide(); // Go to next slide
		} else if (endX - startX > threshold) {
			goToPreviousSlide(); // Go to previous slide
		}
	};

	// Attach the mouse event listeners to the container
	container.addEventListener("mousedown", onDragStart);
	container.addEventListener("mouseup", onDragEnd);

	// Optionally, add touch event listeners for mobile devices
	container.addEventListener("touchstart", (e) => onDragStart(e.touches[0]));
	container.addEventListener("touchend", (e) => onDragEnd(e.changedTouches[0]));

	// Create navigation if more than one slide
	if (slides.length > 1) {
		const prevBtn = document.createElement("button");
		prevBtn.innerHTML =
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8z"/><path d="M13.293 7.293 8.586 12l4.707 4.707 1.414-1.414L11.414 12l3.293-3.293-1.414-1.414z"/></svg>';
		prevBtn.classList.add("slideshow_for_posts--prev");
		prevBtn.addEventListener("click", goToPreviousSlide);

		const nextBtn = document.createElement("button");
		nextBtn.innerHTML =
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8z"/><path d="M13.293 7.293 8.586 12l4.707 4.707 1.414-1.414L11.414 12l3.293-3.293-1.414-1.414z"/></svg>';
		nextBtn.classList.add("slideshow_for_posts--next");
		nextBtn.addEventListener("click", goToNextSlide);

		container.appendChild(prevBtn);
		container.appendChild(nextBtn);
	}
}
