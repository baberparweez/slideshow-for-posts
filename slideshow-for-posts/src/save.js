const Save = ({ attributes }) => {
	const { numberOfPosts, sortOrder, customApiUrl } = attributes;
	return (
		<div
			className="slideshow_for_posts--container"
			data-num-posts={numberOfPosts}
			data-sort-order={sortOrder}
			data-custom-api-url={customApiUrl}
		></div>
	);
};

export default Save;
