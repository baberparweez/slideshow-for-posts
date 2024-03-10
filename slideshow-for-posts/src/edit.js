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
	const { numberOfPosts, order } = attributes; // Ensure customApiUrl is destructured from attributes

	const [posts, setPosts] = useState([]);

	useEffect(() => {
		const apiUrl = `https://wptavern.com/wp-json/wp/v2/posts?_embed&per_page=${numberOfPosts}&order=${order}&orderby=date`;
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
	}, [numberOfPosts, order]); // React to changes in these attributes

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title="Block Settings" initialOpen={true}>
					{/* <TextControl
						label="Custom API URL"
						value={customApiUrl}
						onChange={(value) => setAttributes({ customApiUrl: value })}
						help="Enter a custom API URL to fetch posts from."
					/> */}
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
							{console.log(post)}
							<img
								src={
									post._embedded["wp:featuredmedia"]
										? post._embedded["wp:featuredmedia"][0].source_url
										: ""
								}
								alt={post.title.rendered}
							/>
							<p>{post.title.rendered}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Edit;
