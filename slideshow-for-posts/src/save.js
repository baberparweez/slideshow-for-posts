const Save = ({ attributes }) => {
	const { numberOfPosts, sortOrder, customApiUrl } = attributes;
	return (
		<div
			className="slideshow_for_posts--container"
			data-num-posts={numberOfPosts}
			data-sort-order={sortOrder}
		></div>
	);
};

export default Save;
