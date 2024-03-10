# Slideshow for Posts WordPress Plugin

## Purpose

The "Slideshow for Posts" WordPress plugin dynamically displays posts fetched from an external API (https://wptavern.com/wp-json/wp/v2/posts) on the WordPress frontend in a slideshow format. Each post showcases details such as featured image, title, and other meta data. Users can click on one of the posts to open it in a new tab.

## Technical Requirements

-   **Node.js (v19 or higher)**: Required for compiling JavaScript assets.
-   **NPM**: For managing Node.js packages within the block

## Installation

### Setting Up the Environment

1. **Install NPM**: Make sure NPM is installed on your system.

### Manual Plugin Installation

1. **Download the Plugin**: Clone this repository into your WordPress plugins directory:

    ```bash
    cd wp-content/plugins
    git clone https://github.com/baberparweez/slideshow-for-posts
    ```

2. **Install JavaScript Dependencies**: Install the required Node.js packages in the block folder:

    ```bash
    cd slideshow-for-posts
    npm install
    ```

3. **Activate the Plugin**: Log into your WordPress admin dashboard, go to Plugins, and activate "Slideshow for Posts"

## Running the Compiler

To compile JavaScript and SCSS files:

```bash
npm run start
```

This command should compile your SCSS and JavaScript files, typically outputting to a `dist` directory within your plugin folder.

## Contributions

Contributions are welcome! Please feel free to submit pull requests or open issues to discuss proposed changes or enhancements.

## License

This project is open-sourced under the MIT License
