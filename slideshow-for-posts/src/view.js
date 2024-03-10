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

	function goToPreviousSlide() {
		if (currentIndex === 0) {
			// If we're at the first slide, move to the last slide from the left
			slidesContainer.style.transition = "none";
			currentIndex = totalSlides - 1;
			updateActiveSlide();
			slidesContainer.style.transform = `translateX(-${totalSlides * 100}%)`;
			setTimeout(() => {
				slidesContainer.style.transition = "transform 0.3s ease-in-out";
				updateSlidePosition();
			}, 10);
		} else {
			currentIndex--;
			updateActiveSlide();
			updateSlidePosition();
		}
	}

	function goToNextSlide() {
		if (currentIndex === totalSlides - 1) {
			// If we're at the last slide, move to the first slide from the right
			slidesContainer.style.transition = "none";
			currentIndex = 0;
			updateActiveSlide();
			slidesContainer.style.transform = `translateX(${totalSlides * 100}%)`;
			setTimeout(() => {
				slidesContainer.style.transition = "transform 0.3s ease-in-out";
				updateSlidePosition();
			}, 10);
		} else {
			currentIndex++;
			updateActiveSlide();
			updateSlidePosition();
		}
	}

	const onDragStart = (e) => {
		startX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
		currentX = startX;
		slidesContainer.style.cursor = "grabbing";
	};

	const onDragMove = (e) => {
		e.preventDefault(); // Prevent default touch/mouse behavior

		currentX = e.touches[0].clientX;

		const diffX = currentX - startX;
		const slideWidth = slidesContainer.offsetWidth;
		const maxTranslateX = (totalSlides - 1) * slideWidth;
		const translateX = Math.min(Math.max(-maxTranslateX, diffX), 0);

		slidesContainer.style.transform = `translateX(${translateX}px)`;
	};

	const onDragEnd = (e) => {
		const endX =
			e.type === "touchend" ? e.changedTouches[0].clientX : e.clientX;
		const threshold = 50; // Minimum distance to trigger a slide change
		const slideWidth = slidesContainer.offsetWidth;
		const maxTranslateX = (totalSlides - 1) * slideWidth;

		if (endX - startX > threshold) {
			// Go to previous slide
			if (currentIndex === 0) {
				// If we're at the first slide, move to the last slide from the left
				slidesContainer.style.transition = "none";
				currentIndex = totalSlides - 1;
				updateActiveSlide();
				slidesContainer.style.transform = `translateX(-${totalSlides * 100}%)`;
				setTimeout(() => {
					slidesContainer.style.transition = "transform 0.3s ease-in-out";
					updateSlidePosition();
				}, 10);
			} else {
				currentIndex--;
				updateActiveSlide();
				updateSlidePosition();
			}
		} else if (startX - endX > threshold) {
			// Go to next slide
			if (currentIndex === totalSlides - 1) {
				// If we're at the last slide, move to the first slide from the right
				slidesContainer.style.transition = "none";
				currentIndex = 0;
				updateActiveSlide();
				slidesContainer.style.transform = `translateX(${totalSlides * 100}%)`;
				setTimeout(() => {
					slidesContainer.style.transition = "transform 0.3s ease-in-out";
					updateSlidePosition();
				}, 10);
			} else {
				currentIndex++;
				updateActiveSlide();
				updateSlidePosition();
			}
		} else {
			updateSlidePosition(); // Snap back to the current slide
		}

		currentX = null; // Reset currentX to stop further translation
		slidesContainer.style.cursor = "";
	};
	// Attach the touch event listeners to the container for mobile
	container.addEventListener("touchstart", onDragStart);
	container.addEventListener("touchmove", onDragMove);
	container.addEventListener("touchend", onDragEnd);

	container.addEventListener("mousedown", onDragStart);
	container.addEventListener("mousemove", onDragMove);
	container.addEventListener("mouseup", onDragEnd);

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
