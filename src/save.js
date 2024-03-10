const Save = ({ attributes }) => {
	const { numberOfPosts, order, customApiUrl } = attributes;
	return (
		<div
			className="slideshow_for_posts--container"
			data-num-posts={numberOfPosts}
			data-sort-order={order}
			data-custom-api-url={customApiUrl}
		></div>
	);
};

export default Save;
