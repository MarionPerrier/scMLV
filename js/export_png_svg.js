/*
    Copyright (C) 2020  Marion PERRIER, Frédéric PONT

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/


/**
 * Save an SVG image from the graphic dispayed
 * @param {number} width The output Width desired 
 * @param {number} height The output Height desired
 * @param {boolean} ask_legend If a legend should be saved (true) or not (false)
 */
function save_to_svg (width, height, ask_legend) {

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

    //hide button
    Plotly.relayout(GRAPHDIV, 'updatemenus[0].visible', false);

    if(!ask_legend){
        //hide legend
        Plotly.relayout(GRAPHDIV, 'showlegend', false);
    }

    const name = ask_for_name();

    Plotly.downloadImage(GRAPHDIV, 
        {format: 'svg', 
        width: width, 
        height: height, 
        filename: name}
    );

    //Then put again the graph in a WebGL mode
    update = {
        type: 'scattergl'
    };
    Plotly.restyle(GRAPHDIV, update);
    Plotly.relayout(GRAPHDIV, 'updatemenus[0].visible', true);

    if(is_a_legend_possible()){
        if(!ask_legend){
            //redisplay legend
            Plotly.relayout(GRAPHDIV, 'showlegend', true);
        }
        else {
            save_legend_txt();
        }
    }
}

/**
 * Save a PNG image from the graphic displayed
 * @param {number} width The output Width desired 
 * @param {number} height The output Height desired
 * @param {boolean} ask_legend If a legend should be saved (true) or not (false)
 */
function save_to_png (width, height, ask_legend) {

    //Hide button
    Plotly.relayout(GRAPHDIV, 'updatemenus[0].visible', false);

    if(!ask_legend){
        //hide legend
        Plotly.relayout(GRAPHDIV, 'showlegend', false);
    }

    const name = ask_for_name();

    Plotly.downloadImage(GRAPHDIV, 
        {format: 'png', 
        width: width, 
        height: height, 
        filename: name}
    );

    Plotly.relayout(GRAPHDIV, 'updatemenus[0].visible', true);

    if(is_a_legend_possible()){
        if(!ask_legend){
            //redisplay legend
            Plotly.relayout(GRAPHDIV, 'showlegend', true);
        }
        else {
            save_legend_txt();
        }
    }
}

/**
 * To save the legend area in a .txt file named by default "legend.txt"
 */
function save_legend_txt () {
    let legend_content = document.getElementById('legend').textContent;
    
    var hiddenElement = document.createElement('a');

    hiddenElement.href = 'data:attachment/text,' + encodeURI(legend_content);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'legend.txt';
    hiddenElement.click();
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
    let ask_legend = false;

    dimension.width = prompt('Width desired : ', '1280');
    dimension.height = prompt('Height desired : ', '450');
    if(is_a_legend_possible()){
        ask_legend = window.confirm('Do you want to save the legend ?\nPress "OK" if yes, "Cancel" if no');
    }

    if(re.test(dimension.width) && re.test(dimension.height)){
        switch(value){
            case "png_button":
                save_to_png(dimension.width, dimension.height, ask_legend); break;
            case "svg_button":
                save_to_svg(dimension.width, dimension.height, ask_legend); break;
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

/**
 * Ask for the desired output file's name.
 * Default value : "newplot"
 * @returns {string} name of the file.
 */
function ask_for_name(){
    return prompt('Name of the file : ', 'newplot');
}

/**
 * Looks if a legend can be saved (ie : more than 1 quantitative layer)
 * @returns {boolean} true if a legend can be saved
 */
function is_a_legend_possible (){
    let number_of_layers = document.getElementById('numberOfLayers').value;
    if(number_of_layers != 1){
        if(number_of_layers == 2 && is_quantitative([1, 2]) === 1){
            return false;
        }
        else if(number_of_layers == 3 && is_quantitative([1, 2, 3]) === 1){
            return false;
        }
        else {
            return true;
        }
    }
    return false;
}