/**
 * Enable all usefull buttons. Show graphical plot
 * using Plot.ly, graphical framework.
 * 
 * @param {String} x_value The value selected in the x axe select menu  
 * @param {String} y_value The value selected in the y axe select menu  
 * @param {Array} color_value Array of intensity values. Default : undefined
 * @param {Array} color_scale The colorscale plot.ly need to use. Can be a string (ex : 'RdBu') or an array of array for custom colorscale. (ex : [[0, rgb(0,0,0)], [0.5, rgb(255,255,255)]]) Default : undefined
 */
function draw_on_axes(x_value=X_name, y_value=Y_name, color_value=undefined, color_scale=undefined){
    var X = [];
    var Y = [];

    for (i=0; i < TAB_LENGTH ; i++) {
        X.push(PARSED_RESULTS[i][x_value]);
        Y.push(PARSED_RESULTS[i][y_value]);
    }

    //Enables save PNG/SVG buttons when the plot is shown 
    if(document.getElementById('svg_button').disabled){
        document.getElementById('svg_button').removeAttribute('disabled');
        document.getElementById('png_button').removeAttribute('disabled');
    }

    //Enables button for parameters and axes selection
    if(document.getElementById('x_axis_select_id').disabled){
        //Axes selection
        document.getElementById('x_axis_select_id').removeAttribute('disabled');
        document.getElementById('y_axis_select_id').removeAttribute('disabled');

        //parameters selection
        for(let layer_index = 1; layer_index <= 5; layer_index++){
            console.log(layer_index);
            //Reset sliders and color pickers
            document.getElementById(`color_layer_${layer_index}`).value = "#1f77b4"; //Default blue color on plotly
            document.getElementById(`dot_size_${layer_index}`).value = 3;
            if(document.getElementById(`selectLayer${layer_index}`) != null){
                document.getElementById(`selectLayer${layer_index}`).removeAttribute('disabled');
            }
        }
    }

    //Allow parameters selection
    document.getElementById('numberOfLayers').removeAttribute('disabled');

    //if the graph is already displayed, we'll re-draw on the same graphic. It'll eat less resources
    if (IS_CREATED) {
        Plotly.purge(GRAPHDIV);
        Plotly.react(GRAPHDIV, [{
            x: X,
            y: Y,
            mode: 'markers',
            marker: {
                size: DOT_SIZE,
                color: color_value,
                colorscale: color_scale,
            },
            type: 'scattergl',
            hoverinfo: 'none' //to hide labels on points
            }], 
            LAYOUT, {responsive: true}
        );
        return;
    }
    else {
        Plotly.newPlot(GRAPHDIV, [{
            x: X,
            y: Y,
            mode: 'markers',
            marker: {
                size: DOT_SIZE,
                color: color_value,
                colorscale: color_scale,
            },
            type: 'scattergl',
            hoverinfo: 'none' //to hide labels on points
            }], 
            LAYOUT, {responsive: true});
        IS_CREATED = true;
    }
}

/**
 * 
 * THIS DESCRIPTION SHOULD BE REPHRASED (seriously, this is mumbling)
 * Finds how many lists of parameters are displayed
 * Color each point in function of : 
 * 
 *  -> How many parameters are shown
 * 
 *  -> If it's a qualitative value
 * 
 *  -> If it's a quantitative value (color palette on a RGB scale)
 * 
 * @param {Number} list_number The id number of the select button.
 */
function color_point(list_number){

    column_name = document.getElementById(`selectLayer${list_number}`).value;

    for(let j=1; j <= 2; j++){
        document.getElementById(`display_qual_color_${j}`).setAttribute('hidden', '');
        document.getElementById(`display_shapes_${j}`).setAttribute('hidden', '');
    }
    document.getElementById('display_legend').setAttribute('hidden', '');
    document.getElementById('save_param_button').setAttribute('disabled', '');
    document.getElementById('load_param_button').setAttribute('disabled', '');
    number_parameters = document.getElementById('numberOfLayers').value;

    //hide "shape" and "color" radio button
    for (let j = 0; j<= number_parameters; j++) {
        if(document.getElementById(`control_checkbox_${j}`)!=null){
            document.getElementById(`control_checkbox_${j}`).setAttribute('hidden', '');
            
            //Change select for "shape" instead of "color"
            document.getElementById(`cb_shape_${j}`).checked = true;
            document.getElementById(`cb_color_${j}`).checked = false;
        }
    }

    switch(number_parameters) {
        //If we have only one parameter selected
        case "1":
            one_parameter(list_number);
        break;

        case "2":
            two_parameters();
        break;

        case "3":
            three_parameters();
        break;

        case "4":
            four_parameters();
        break;

        case "5":
            five_parameters();
        break;

        default:
            //This shouldn't happend. But we never know
            alert("A problem has been encountered.\nPlease reload the application");
        break;
    }
}


/**
 * Displays legend under the plot for quantitative values
 * @param {Array} legend Array of strings : title of each trace to display in the legend
 */
function display_legend (legend) {
    document.getElementById('display_legend').removeAttribute('hidden');

    var textNode = document.createElement("div");
    
    var string_to_display = '<ul>';
    for(let elem in legend){

        string_to_display += '<li>'+legend[elem]+'</li>';
    }
    string_to_display += '</ul>';

    textNode.innerHTML=string_to_display;

    //Add title
    document.getElementById('legend_title').innerHTML = 'Layers Combinations Legend';
    document.getElementById('legend').appendChild(textNode);
}


/**
 * Will be activated when there is a color change
 * for a layer.
 * Call again the main function of the number of 
 * total layer.
 * 
 * @param {string} number_layout total number of layout displayed 
 */
function color_change (number_layout) {

    number_parameters = document.getElementById('numberOfLayers').value; //var or let ?
    //hex_value = document.getElementById(`color_layer_${number_layout}`).value;

    //react with a new color palette range
    if(number_parameters == 1){
        one_parameter(1);
    }

    else if (number_parameters == 2){
        two_parameters();
    }

    else if (number_parameters == 3){
        three_parameters();
    }

    else if (number_parameters == 4){
        four_parameters();
    }

    else {
        five_parameters();
    }
}

/**
 * Transform a hexadecimal code (string) into a rgb color code (array) 
 * @param {string} hex Hexadecimal code of a color 
 */
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Return a palette of 3 colors : [#e3e3e3, the color given, #000000].
 * @param {string} color RGB values returned for one layer (from grey to the color to black). 
 */
function creating_palette_one_layer (color){
    return [[0, "#e3e3e3"], 
            [0.5, `rgb(${color.r},${color.g},${color.b})`],
            [1, 'rgb(0,0,0)']];
}

/**
 * Return a palette composed by two colors : #e3e3e3, and the color given.
 * @param {string} color RGB values returned for several layers (from grey to the color). 
 */
function creating_palette_several_layers (color) {
    return [[0, "#e3e3e3"], [1, `rgb(${color.r},${color.g},${color.b})`]];
}

/**
 * Compute all intermediates color between two or more (up to 5) values.
 * @param {Array} color Array of hexadecimal color values selected by the user 
 * @returns {Array} middle_colors Array of RGB color values selected by the user
 */
function calculation_middle_color(color) {
    //Call Combinatorics function which gives all combination possibilities for a given array
    let color_combinations = Combinatorics.power(color);

    let middle_colors = [];
    let rgb_color = [];

    //No need for the first one "[]" to be treated
    //This "for" loop will generate an intermediate color for each combination
    color_combinations.forEach(function(combination){ 

        //We don't care about empty and solo combination
        if(combination.length != 0 && combination.length != 1){

            //Hexadecimal conversion to RGB values
            for(hex_color in combination){
                rgb_color.push(hexToRgb(combination[hex_color]));
            }

            //Calculations of the average color
            let middle_R = 0, middle_B = 0, middle_G = 0;

            for(actual_color in rgb_color){
                middle_R += rgb_color[actual_color].r;
                middle_B += rgb_color[actual_color].b;
                middle_G += rgb_color[actual_color].g;
            }

            middle_R = parseInt(middle_R/rgb_color.length);
            middle_B = parseInt(middle_B/rgb_color.length);
            middle_G = parseInt(middle_G/rgb_color.length);
            
            middle_colors.push(`rgb(${middle_R}, ${middle_G}, ${middle_B})`);

            rgb_color = [];
        }
    });

    return middle_colors;
}

/**
 * Change the dot size of a specific layer and all the layers associated to this one. 
 * Insert a black border line for each point which has a width >= 6.
 * Reset the size and the border line when there is an other layer selected.
 * 
 * WARNING : That's not an elegant way to proceed. This function needs to be updated
 * in the future (the traces are hard written, and we want to avoid that.)
 * Plus, this piece of code is extremely slow. We should improve it 
 * 
 * @param {string} layer_id As the name says : The ID of the layer selected
 */
function change_dot_size (layer_id) {
    let nb_traces = (GRAPHDIV.data.length); //To retreive the correct amount of layers
    let nb_layers = document.getElementById('numberOfLayers').value;
    let dot_size = document.getElementById(`dot_size_${layer_id}`).value;

    //First thing, let's see which tracks are affected by the size change.
    //It's an ugly way to proceed, and it can be improved
    var affected_traces;

    switch(nb_traces){
        case 1:
            //There is no proper trace, all the points on the graph can be changed
            affected_traces = [0];
        break;

        case 2:
            affected_traces = [1];
        break;

        case 4:
            if(nb_layers == 2){
                //Check how many quantitatives values
                let n_quantitatives = is_quantitative([1, 2]);
                
                //If there is two quantitatives layers :
                //      Increase the size of the dots and relatives traces
                if(n_quantitatives === 2){
                    if(layer_id == 1){
                        affected_traces = [1,3];
                    }
                    else {
                        affected_traces = [2,3];
                    }
                }

                //If there is only one quantitative layer : 
                //      Treats it like case 1
                else {
                    affected_traces = [1];
                }
            }
            else {
                //Check where are the quantitatives values
                if(is_quantitative(1)){
                    if(is_quantitative(2)){
                        //1 and 2
                        if(layer_id == 2){
                            affected_traces = [2,3];
                        }
                        else {
                            affected_traces = [1,3];
                        }
                    }
                    else {
                        //1 and 3
                        if(layer_id == 1){
                            affected_traces = [1, 3];
                        }
                        else {
                            affected_traces = [2, 3]
                        }
                    }
                }
                else {
                    //2 and 3
                    if(layer_id == 2){
                        affected_traces = [1, 3];
                    }
                    else {
                        affected_traces = [2, 3];
                    }
                }
            }

        break;

        case 8:
            if(nb_layers == 3){
                if(layer_id == 1){
                    affected_traces = [1,4,5,7];
                }
                else if (layer_id == 2) {
                    affected_traces = [2,4,6,7];
                }
                else {
                    affected_traces = [3,5,6,7];
                }
            }
            else {
                //There is four layers with one qualitative value
                if(layer_id == 1){
                    affected_traces = [1,4,5,7];
                }
                else if (layer_id == 2){
                    //If the 1 is qualitative, then the second button will be connected to the first trace.
                    if(is_quantitative(1)){
                        affected_traces = [2,4,6,7];
                    }
                    else {
                        affected_traces = [1,4,5,7];
                    }
                }
                else if (layer_id == 3){
                    //If 1 or 2 is qualitative, then the second button will be connected to the second trace.
                    if(is_quantitative(1) && is_quantitative(2)){
                        affected_traces = [3,5,6,7];
                    }
                    else {
                        affected_traces = [2,4,6,7];
                    }
                }
                else {
                    affected_traces = [3,5,6,7];
                }
            }
        break;

        case 16:
            if(nb_layers == 4){
                if(layer_id == 1){
                    affected_traces = [1,5,6,7,11,12,13,15];
                }
                else if (layer_id == 2) {
                    affected_traces = [2,5,8,9,11,12,14,15];
                }
                else if (layer_id == 3) {
                    affected_traces = [3,6,8,10,11,13,14,15];
                }
                else {
                    affected_traces = [4,7,9,10,12,13,14,15];
                }
            }
            else {
                if(layer_id == 1){
                    //Can only be layer 1
                    affected_traces = [1,5,6,7,11,12,13,15];
                }
                else if(layer_id == 2){
                    //Can be layer 1 or layer 2 (if there is a qualitative value selected in the first button)
                    if(is_quantitative(1)){
                        //If button 1 has quantitative values, then the button 2 is concerned by the second layer
                        affected_traces = [2,5,8,9,11,12,14,15];
                    }
                    else {
                        affected_traces = [1,5,6,7,11,12,13,15];
                    }
                }
                else if(layer_id == 3) {
                    if(is_quantitative(1) && is_quantitative(2)){
                        //If button 1 and 2 have both quantitative values, then the third button has the third layer
                        affected_traces = [3,6,8,10,11,13,14,15];
                    }
                    else {
                        //One of the two is qualitative, then the button will show the second layer
                        affected_traces = [2,5,8,9,11,12,14,15]; 
                    }
                }
                else if(layer_id == 4){
                    //Can be the layer 3 or 4 depending on the number of qualitative values before the fourth button
                    if(is_quantitative(1) && is_quantitative(2) && is_quantitative(3) && is_quantitative(4)){
                        affected_traces = [4,7,9,10,12,13,14,15];
                    }
                    else {
                        affected_traces = [3,6,8,10,11,13,14,15];
                    }
                }
                else {
                    //The fifth button can only display the fourth layer
                    affected_traces = [4,7,9,10,12,13,14,15];
                }
            }
        break;

        case 32:
            //There will be 32 traces only if there is 5 quantitative values selected, which is the maximum of this application.
            if(layer_id == 1){
                affected_traces = [1,6,7,8,9,16,17,18,19,20,21,26,27,28,29,31];
            }
            else if (layer_id == 2) {
                affected_traces = [2,6,10,11,12,16,17,18,22,23,24,26,27,28,30,31];
            }
            else if (layer_id == 3) {
                affected_traces = [3,7,10,13,14,16,19,20,22,23,25,26,27,29,30,31];
            }
            else if (layer_id == 4) {
                affected_traces = [4,8,11,13,15,17,19,21,22,24,25,26,28,29,30,31];
            }
            else {
                affected_traces = [5,9,12,14,15,18,20,21,23,24,25,27,28,29,30,31];
            }
        break;

        default:
            //This shouldn't happend. But we never know
            alert("A problem has been encountered.\nPlease reload the application");
        break;
    }

    //Look if there is a transform or not
    if(GRAPHDIV.data[0].transforms === undefined){
        //If yes, we can change the size (and line) directly on the marker
        let update;

        if(dot_size >= 6){
            update = {
                'marker.size': `${dot_size}`,
                'marker.line.color': 'rgb(0, 0, 0)',
                'marker.line.width': '1'
            };
        }
        else {
            update = {
                'marker.size': `${dot_size}`,
                'marker.line.color': 'rgb(0, 0, 0)',
                'marker.line.width': '0'
            };
        }

        //Reset all others dot size sliders to their initial position (3)
        for(let j = 1; j<= nb_layers; j++){
            if(j != layer_id) {
                document.getElementById(`dot_size_${j}`).value = 3;
            }
        }
        Plotly.restyle(GRAPHDIV, {'marker.size': '3',
                                  'marker.line.width': '0'});
        //Restyle concerned traces
        Plotly.restyle(GRAPHDIV, update, affected_traces);
    }

    //If no (there is already an existing transform, the size (and line) is changed
    //inside the transfroms of concerned traces.
    else {

        //Supress all useless transforms size
        for(stylesIndex in GRAPHDIV.data[0].transforms[0].styles){
            if(GRAPHDIV.data[0].transforms[0].styles[stylesIndex].value.marker.size == 3){
                let str = `transforms[0].styles[${stylesIndex}].value.marker.size`;
                Plotly.restyle(GRAPHDIV, {[str]: null});
                str = `transforms[0].styles[${stylesIndex}].value.marker.line`;
                Plotly.restyle(GRAPHDIV, {[str]: null});
            }
        }
        let update;

        if(dot_size >= 6){
            update = {
                'marker.size': `${dot_size}`,
                'marker.line.color': 'rgb(0, 0, 0)',
                'marker.line.width': '1'
            };
        }
        else {
            update = {
                'marker.size': `${dot_size}`,
                'marker.line.color': 'rgb(0, 0, 0)',
                'marker.line.width': '0'
            };
        }

        //Reset all others dot size sliders to their initial position (3)
        for(let j = 1; j<= nb_layers; j++){
            if(j != layer_id) {
                document.getElementById(`dot_size_${j}`).value = 3;
            }
        }
        Plotly.restyle(GRAPHDIV, {'marker.size': '3',
                                  'marker.line.width': '0'});
        //Restyle concerned traces
        Plotly.restyle(GRAPHDIV, update, affected_traces);
    }
}

/**
 * Second try on this function
 * @param {numeber} number_id 
 */
function add_legend_shapes (number_id) {

}