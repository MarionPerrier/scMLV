/**
 * Save an SVG image from the graphic dispayed
 * @param {number} width The output Width desired 
 * @param {number} height The output Height desired
 */
function save_to_svg (width, height) {

    //We have to transform the scatterGL plot to a simple scatter
    //This may take a lot of ressources, causes the browser to crash !!
    var is_confirmed = confirm("This may take a lot of ressources,\ncauses the browser to crash.\nDo you want to pursue ?");
    if(!is_confirmed){
        //early return
        return;
    }

    var update = {
        type: 'scatter'
    };
    Plotly.restyle(GRAPHDIV, update);

    Plotly.downloadImage(GRAPHDIV, 
        {format: 'svg', 
        width: width, 
        height: height, 
        filename: 'newplot'});

    //Then put again the graph in a WebGL mode
    update = {
        type: 'scattergl'
    };
    Plotly.restyle(GRAPHDIV, update);
}

/**
 * Save a PNG image from the graphic displayed
 * @param {number} width The output Width desired 
 * @param {number} height The output Height desired
 */
function save_to_png (width, height) {
    Plotly.downloadImage(GRAPHDIV, 
        {format: 'png', 
        width: width, 
        height: height, 
        filename: 'newplot'});
}

/**
 * Ask for the desired output chart's size.
 * The default values (1280 for Width, 450 for Height) represent 
 * the initial size of the graphic displayed on the screen.
 *  
 * @param {String} value The id of the button pressed. Can be "png_button" or "svg_button"
 */
function ask_for_size(value) {
    const re = /^(-)?[0-9]+(\.)?([0-9])*$/;
    var dimension = new Object();
    dimension.width;
    dimension.height;

    dimension.width = prompt('Width desired : ', '1280');
    dimension.height = prompt('Height desired : ', '450');

    if(re.test(dimension.width) && re.test(dimension.height)){
        switch(value){
            case "png_button":
                save_to_png(dimension.width, dimension.height); break;
            case "svg_button":
                save_to_svg(dimension.width, dimension.height); break;
        }
    }
    else {
        if(confirm("Sorry, but it wasn't numbers.\nPlease try again.")){
            ask_for_size();
        }
        else {
            return;
        }
    }
}