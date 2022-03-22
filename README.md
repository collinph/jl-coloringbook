# JL Coloring book

A single javascript file that creates a custom HTML tag (webcomponent) that can be used for a highly customizable coloring book on your website.

## Features

* Minimum HTML required to implement
* Anyone can color a coloring book page.
* Supports erasing, saving and pringing.
* Undo function
* When navigating to another coloring page or a different web page, the state saved so you can continue coloring where you left off
* Supports any number of images (pages) in your coloring book, with included navigation.
* Multiple coloring books can be embeded on a page.
* Customizable color palette.
* Will not interfere with your website's CSS, and your website will not interfere with how the component is themed.
* Full Themeable without editing javascript code.
* AutoInit can be disabled, allowing custom JS to asyncronously gather image names and initialize afterwards.


## Demo

Visit https://primoweb.com/vfc-coloring-book for a demo of the script embeded into a busy wordpress design.
See the examples folder for more.

## Prerequisites

###jQuery 3+

Your page will need jquery on it already, which most websites already have. If not, you can include it as simply as

```
<script src="https://code.jquery.com/jquery-3.4.1.min.js"</script>
```

You can embed that code either in the head of your page, or somewhere prior to calling the tag. If you're using wordpress or another content manatement system, it likely already has jquery installed so ignore it unless the coloring book fails to initialize.

### Upload and call the jl-coloringBook.js file (or point to CDN).

Include the following code somewhere near top of your HTML, preferably in the `<head>` section:

```
<script src="/PathToFile/js-coloringBook.js"></script>

```

To pull the file from jsDelivr CDN use the following..
```
<script src="https://cdn.jsdelivr.net/gh/collinph/jl-coloringbook/jl-coloringBook.js"></script>
```

## Simple Use

JL Coloring book works in its most simple form by wrapping a group of  `<img>` tags  with the `<jl-coloringbook>` tag.

````
<jl-coloringbook>
	<img src="yourImageHere.jpg" />
	<img src="yourSecondImageHere.jpg" />
	<img src="rinseAndRepeatToYourHeartsContent.jpg" />
</jl-coloringbook>
````

You can embed this code in any section of your HTML and the plugin will automatically size itself based on the container.

## Customization

Don't like the colors? Want to change the spacing? Want to randomize the image that loads on default?  We've got you covered.

### Custom color palette
You can add `<i>` tags to replace the default palette of painting colors as in the example below. Please note that the last color will be the "eraser" tool.
```html
<jl-coloringbook>
	<i color="rgba(87, 87, 87,0.8)"></i>
	<i color="rgba(220, 35, 35,0.8)"></i>
	<i color="rgba(42, 75, 215,0.8)"></i>
	<i color="rgba(29, 105, 20,0.8)"></i>
	<i color="rgba(129, 74, 25,0.8)"></i>
	<i color="rgba(129, 38, 192,0.8)"></i>
	<i color="rgba(255, 255, 255,0.8)"></i>
	<i color="rgba(255, 255, 255)"></i>
	<img src="./images/astronaut.png" />
	<img src="./images/eagle.png" />
	<img src="./images/glass.jpg" />
</jl-coloringbook>
```

### Randomize the first loaded image

To make the coloring book to open to a random page when first loaded, use the `randomize` attribute.
```
<jl-coloringbook randomize="true">
	<img src="./images/astronaut.png" />
	<img src="./images/eagle.png" />
	<img src="./images/glass.jpg" />
</jl-coloringbook>
```

### Max Brush size

The default maximum brush size is 32 (px) because most browsers do not support a cursor larger than 32x32. You can make the max brush size larger than 32, however the cursor size won't grow beyond 32px. To increase the max brush size, use the `maxbrushsize` attribute.
```
<jl-coloringbook maxbrushsize="32">
	<img src="./images/astronaut.png" />
	<img src="./images/eagle.png" />
	<img src="./images/glass.jpg" />
</jl-coloringbook>
```

### Advanced customization of the layout.
Want bigger buttons? Want it to look a particular way on mobile? Want to change the look entirely? You'll need to create a custom theme file and edit to your liking. You will have to tell the component to use this css file by using the `css` attribute.

```
<jl-coloringbook css="./customizedThene.css">
	<img src="./images/astronaut.png" />
	<img src="./images/eagle.png" />
	<img src="./images/glass.jpg" />
</jl-coloringbook>
```
### Delayed initialization 
Need to build the image list dynamically? Perhaps you need to fetch the image data from a JSON file and build the img tags after they load? Just tyrn off autoinit and call init() after the dom for the tag is completely built.
````
<jl-coloringbook autoinit="0" id="dynamic">
</jl-coloringbook>
<script>
$('#dynamic').append('<img src="some_image_name_i_dynamically_determined" />').append('<img src="repeat_as_much_as_you_want.png"/>');
$('#dynamic')[0].init(); // initialize one time after dom updated with config tags
</script>
````
### "Outer CSS" rules.

CSS Classes or rules can be used on the `jl-coloringbook` tag to force it to render at specific widths or alignments like you would any <div> or section of your site.

## Important Note
Due to the way browser security is concerned, images should be hosted on the same server as the website (they usually are). You can get around this with proper CORS rules, however, that's outside the scope of this document. You'll know that you're violating CORS rules if the print and save function doesn't work.
## Licensing

This project is free to be used on any site free of charge. If you enjoy this project and would like to its continued development, I accept tips via paypal at [joe@primoweb.com](mailto:joe@primoweb.com)
Copyright 2020,2021,2022, Joe Love
