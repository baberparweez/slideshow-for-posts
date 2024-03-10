import { useState, useEffect } from "@wordpress/element";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import {
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
} from "@wordpress/components";

const Edit = (props) => {
	const blockProps = useBlockProps({
		className: "ddl-block",
	});
	const { attributes, setAttributes } = props;
	const { numberOfPosts, order, customApiUrl } = attributes; // Ensure customApiUrl is destructured from attributes

	const [posts, setPosts] = useState([]);
	const customApi = customApiUrl ? customApiUrl : "https://wptavern.com";

	// Utility function to remove HTML tags from a string
	function stripHtml(html) {
		var temporaryDiv = document.createElement("div");
		temporaryDiv.innerHTML = html;
		return temporaryDiv.textContent || temporaryDiv.innerText || "";
	}

	useEffect(() => {
		const apiUrl = `${customApi}/wp-json/wp/v2/posts?_embed&per_page=${numberOfPosts}&order=${order}&orderby=date`;
		const cacheKey = `posts_${encodeURIComponent(apiUrl)}`;

		const cachedPosts = sessionStorage.getItem(cacheKey);
		if (cachedPosts) {
			setPosts(JSON.parse(cachedPosts));
		} else {
			fetch(apiUrl)
				.then((response) => response.json())
				.then((fetchedPosts) => {
					sessionStorage.setItem(cacheKey, JSON.stringify(fetchedPosts));
					setPosts(fetchedPosts);
				})
				.catch((error) => console.error("Fetching posts failed:", error));
		}
	}, [numberOfPosts, order, customApiUrl]); // React to changes in these attributes

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title="Block Settings" initialOpen={true}>
					<TextControl
						label="Custom API URL"
						value={customApiUrl}
						onChange={(value) => setAttributes({ customApiUrl: value })}
						help="Enter a custom API URL to fetch posts from. Default value is 'https://wptavern.com'."
					/>
					<RangeControl
						label="Number of Posts"
						value={numberOfPosts}
						onChange={(value) => setAttributes({ numberOfPosts: value })}
						min={1}
						max={12}
					/>
					<SelectControl
						label="Order"
						value={order}
						options={[
							{ label: "Latest Posts First", value: "desc" },
							{ label: "Oldest Posts First", value: "asc" },
						]}
						onChange={(value) => setAttributes({ order: value })}
					/>
				</PanelBody>
			</InspectorControls>
			<div className="slideshow_for_posts--container">
				<div className="slideshow_for_posts--slides">
					{posts.map((post) => (
						<div key={post.id} className="slideshow_for_posts--slide">
							{post._embedded &&
								post._embedded["wp:featuredmedia"] &&
								post._embedded["wp:featuredmedia"][0] && (
									<img
										src={post._embedded["wp:featuredmedia"][0].source_url}
										alt={post.title.rendered}
									/>
								)}
							<h4 className="title">{post.title.rendered}</h4>
							<p className="date">{new Date(post.date).toLocaleDateString()}</p>
							<div className="excerpt">{stripHtml(post.excerpt.rendered)}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Edit;
