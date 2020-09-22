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
 * WARNING : WILL FAIL IF THE COLUMN TITLE IS EQUAL TO ""
 * 
 * Add a legend under the plot, for qualitative values. 
 * Display a list of all values, with a choice of color
 * (color picker) and a range slider for a variable dot
 * size.
 * 
 * @param {number or array} list_number id of the button where the qualitative variable is. If there is two qualitative variables, the argument given is an array of id. 
 */
function add_legend_color (list_number) {

    //Do the same with the other qualitative variable if there is one
    if((!document.getElementById('display_shapes_1').hidden || !document.getElementById('display_qual_color_1').hidden) 
    && (!document.getElementById('display_shapes_2').hidden || !document.getElementById('display_qual_color_2').hidden)){
        //we disable the other quali
        for (let i = 1; i <= 5; i++){
            if(!document.getElementById(`control_checkbox_${i}`).hidden && i !== list_number){
                //Now the position has been found, we swap checkbox
                document.getElementById(`cb_color_${i}`).checked = false;
                document.getElementById(`cb_shape_${i}`).click();
            }
        }
    }

    //Looking for the div position depending on the id of the button where the qualitative variable is.
    if(document.getElementById('shapes_title_1').innerHTML.indexOf(document.getElementById(`selectLayer${list_number}`).value) !== -1){
        var position = 1;
    }
    else if(document.getElementById('shapes_title_2').innerHTML.indexOf(document.getElementById(`selectLayer${list_number}`).value) !== -1){
        var position = 2;
    }
    else {
        alert("A problem has occured.\nPlease reload the application.");
    }

    if(document.getElementById(`qual_color_title_${position}`).innerHTML != ""){
        document.getElementById(`display_shapes_${position}`).setAttribute('hidden', '');
        document.getElementById(`display_qual_color_${position}`).removeAttribute('hidden');
        return;
    }

    //Change for the real column_name
    //(the number means the position of the colum_name).
    let column_name = document.getElementById(`selectLayer${list_number}`).value;

    var myDiv = document.getElementById(`qual_color_${position}`);
    let differents_terms = [];

    //Take all values (class names for each point) - Is there already a native function doing it for less ressources ?
    //It would be nice to check. keyword : TO DO
    for(let j = 0; j < TAB_LENGTH; j++){
        let term = PARSED_RESULTS[j][column_name];

        if(!differents_terms.includes(term)){
            differents_terms.push(term);
        }
    }

    differents_terms.sort();

    //Makes sliders appear to the right for each term [TERM : *slider*]
    for (let term in differents_terms) {

        var number_of_cells = 0;
        //Calculates the number of cells for each terms
        for(data_number in GRAPHDIV.data){
            if(position === 1){
                //For text
                GRAPHDIV.data[data_number].text.forEach(
                    element => {if(element === differents_terms[term]){
                        number_of_cells += 1;
                    }
                });
            }
            if(position === 2){
                //For z
                GRAPHDIV.data[data_number].z.forEach(
                    element => {if(element === differents_terms[term]){
                        number_of_cells += 1;
                    }
                });
            }
        }

        //Create a div for each term
        let div = document.createElement("div");
        div.setAttribute('style', 'margin-top: 10px; margin-left: 10px; margin-right: 10px;');

        let label = document.createElement("label"); //Text where the label will go

        let element1 = document.createElement('input'); //This input will contain the select
        let element2 = document.createElement('input'); //And a slider to adjust the dot size

        let line = document.createElement('hr');

        //Assigns differents attributes to the new inputs elements
        label.innerText = `${differents_terms[term]} (${number_of_cells} cells) : ` ;
        label.setAttribute('style', 'float: left;');

        element1.setAttribute("id", `cp_${position}_${differents_terms[term]}`); // CP stands for "color picker"
        element1.setAttribute("name", `${differents_terms[term]}`);
        element1.setAttribute('type', 'color');
        element1.setAttribute('value', '#FFFFFF');
        element1.setAttribute('onchange', `change_legend_color(${position}, '${differents_terms}', '${differents_terms[term]}');`);

        element2.setAttribute('step', '1');
        element2.setAttribute('min', '1');
        element2.setAttribute('max', '20');
        element2.setAttribute('value', document.getElementsByName(`size_shape_${position}_${differents_terms[term]}`)[0].value);
        element2.setAttribute('type', 'range');
        element2.setAttribute('id', `size_${position}_${differents_terms[term]}`);
        element2.setAttribute('name', `size_color_${position}_${differents_terms[term]}`);
        element2.setAttribute('style', 'width: auto; float: right; margin-top:10px;');
        element2.setAttribute('onchange', `change_size_legend(${position}, '${differents_terms}', '${differents_terms[term]}', this.value);`);

        //Add them to the appropriate div
        div.appendChild(label);
        div.appendChild(element1);
        div.appendChild(element2);
        div.appendChild(line);
        myDiv.appendChild(div);
    }
    
    //Add the title
    document.getElementById(`qual_color_title_${position}`).innerHTML = `Legend of "${column_name}"`;
    //Makes the sliders appear
    document.getElementById(`display_qual_color_${position}`).removeAttribute('hidden');
    document.getElementById(`display_shapes_${position}`).setAttribute('hidden', '');
}

/**
 * Add a legend under the plot, for qualitative values.
 * Display a list of all values, with a choice of shapes for
 * points, and a range slider for a variable dot size.
 * 
 * @param {number} list_number id of the button where the qualitative variable is
 */
function add_legend_shapes (list_number) {

    if((!document.getElementById('display_shapes_1').hidden || !document.getElementById('display_qual_color_1').hidden) 
    && (!document.getElementById('display_shapes_2').hidden || !document.getElementById('display_qual_color_2').hidden)){
        //we disable the other quali
        for (let i = 1; i <= 5; i++){
            if(!document.getElementById(`control_checkbox_${i}`).hidden && i !== list_number){
                //Now the position has been found, we swap checkbox
                document.getElementById(`cb_color_${i}`).click();
                document.getElementById(`cb_shape_${i}`).checked = false;
            }
        }
    }

    if(document.getElementById(`shapes_title_1`).innerHTML != ""){
        //Looking for the div position depending on the id of the button where the qualitative variable is.
        if(document.getElementById('shapes_title_1').innerHTML.indexOf(document.getElementById(`selectLayer${list_number}`).value) !== -1){
            var position = 1;
        }
        else if(document.getElementById('shapes_title_2').innerHTML.indexOf(document.getElementById(`selectLayer${list_number}`).value) !== -1){
            var position = 2;
        }
        else {
            alert("A problem has occured.\nPlease reload the application.");
        }
        document.getElementById(`display_qual_color_${position}`).setAttribute('hidden', '');
        document.getElementById(`display_shapes_${position}`).removeAttribute('hidden');
        return;
    }

    if(typeof list_number === 'number'){
        list_number = [list_number];
    }
    for(var div_number = 1; div_number <= list_number.length; div_number++){

        //Change for the real column_name
        //(the number means the position of the colum_name)
        let column_name = document.getElementById(`selectLayer${list_number[div_number-1]}`).value;

        var myDiv = document.getElementById(`shapes_${div_number}`);
        let differents_terms = [];

        //Take all values (class names for each point)
        //I'm pretty sure there is a nicer way to do that. With a native function.
        // To check. keyword : TO DO
        for(let j = 0; j < TAB_LENGTH; j++){

            let term = PARSED_RESULTS[j][column_name];
            if(!differents_terms.includes(term)){
                differents_terms.push(term);
            }
        }

        differents_terms.sort();

        //Make sliders appears to the right for each term [TERM : *slider*]
        for (let term in differents_terms) {
            
            //Calculates the number of cells for each terms
            var number_of_cells = 0;
            for(data_number in GRAPHDIV.data){
                if(div_number === 1){
                    //For text
                    GRAPHDIV.data[data_number].text.forEach(
                        element => {if(element === differents_terms[term]){
                            number_of_cells += 1;
                        }
                    });
                }
                if(div_number === 2){
                    //For z
                    GRAPHDIV.data[data_number].z.forEach(
                        element => {if(element === differents_terms[term]){
                            number_of_cells += 1;
                        }
                    });
                }
            }

            //Create a div for each term
            let div = document.createElement("div");
            div.setAttribute('style', 'margin-top: 10px; margin-left: 10px; margin-right: 10px;');

            let label = document.createElement("label"); //Text where the label will go

            let element1 = document.createElement('div'); //This div will contain the select
            element1.setAttribute('class', 'select is-purple');
            let element1_1 = document.createElement("select"); //Select for shape
            
            let element2 = document.createElement("input"); //Slider for size
            let line = document.createElement('hr');
            line.setAttribute('color', 'purple');

            //Assigns differents attributes to the new inputs elements
            label.innerText = `${differents_terms[term]} (${number_of_cells} cells) : ` ;
            label.setAttribute('style', 'float: left;');

            element1_1.setAttribute("id", `shape_${div_number}_${differents_terms[term]}`);
            element1_1.setAttribute("name", `${differents_terms[term]}`);
            element1_1.setAttribute('style', 'align-items: center;')
            element1_1.setAttribute('onchange', `change_shape_legend(${div_number}, '${differents_terms}', '${differents_terms[term]}', this.value);`)

            let shapes = ['circle', 'cross', 'x', 'star', 'triangle-up', 'triangle-down'];
            shapes.forEach(function(shape){
                let option = document.createElement('option');

                option.value = `${shape}`;
                option.selected;
                option.text = `${shape}`;

                element1_1.appendChild(option);
                element1.appendChild(element1_1);
            });

            element2.setAttribute('step', '1');
            element2.setAttribute('min', '1');
            element2.setAttribute('max', '20');
            element2.setAttribute('value', '3');
            element2.setAttribute('type', 'range');
            element2.setAttribute('id', `size_${div_number}_${differents_terms[term]}`);
            element2.setAttribute('name', `size_shape_${div_number}_${differents_terms[term]}`);
            element2.setAttribute('style', 'width: auto; float: right; margin-top:10px;'); //margin-left: 15px; margin-right: 10px; 
            element2.setAttribute('onchange', `change_size_legend(${div_number}, '${differents_terms}', '${differents_terms[term]}', this.value);`);

            //Add them to the appropriate div
            div.appendChild(label);
            div.appendChild(element1);
            div.appendChild(element2);
            div.appendChild(line);
            myDiv.appendChild(div);
        }

        //Add the title
        document.getElementById(`shapes_title_${div_number}`).innerHTML = `Legend of "${column_name}"`;

        //Makes the sliders appear
        document.getElementById(`display_shapes_${div_number}`).removeAttribute('hidden');
        document.getElementById(`display_qual_color_${div_number}`).setAttribute('hidden', '');

        //Allows parameters download and upload
        document.getElementById(`save_param_button`).removeAttribute('disabled');
        document.getElementById(`load_param_button`).removeAttribute('disabled');
    }

    //Do the same with the other qualitative variable if there is one
    if(Array.isArray(list_number) && list_number.length>1){ //&& document.getElementById(`shapes_title_1`).innerHTML === "") 
        document.getElementById(`cb_color_${list_number[list_number.length -1]}`).click();
        document.getElementById(`cb_shape_${list_number[list_number.length -1]}`).checked = false;
    }
}

/**
 * Displays legend under the plot
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
function color_change (){

    var number_parameters = document.getElementById('numberOfLayers').value;
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
                    if(layer_id == 2 || layer_id == 3){
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
 * Happens when the value inside the select for "shape" is changed.
 * Changes the shape of the points wich belongs to the value selected 
 * 
 * @param {number} position indicates the div number to modify the shape (is it the first qualitative value or the second one ?)
 * @param {string} different_terms A string with all the terms of the concerned layer is in, separated by a comma
 * @param {string} term indicates the style number to modify
 * @param {string} valueShape the shape selected in the select. Can be one of those : ['circle', 'cross', 'x', 'star', 'triangle-up', 'triangle-down']
 */
function change_shape_legend (position, different_terms, term, valueShape){
    let terms = different_terms.split(",");

    //First step : Create a dictionnary of shapes and terms.
    let terms_and_shapes_associated = [terms];

    let all_shapes = []
    for(term_i in terms){
        all_shapes.push(document.getElementById(`shape_${position}_${terms[term_i]}`).value);
    }
    terms_and_shapes_associated.push(all_shapes);
    
    let shapes = [];
    //each trace will be treated one by one
    for(trace in GRAPHDIV.data){
        if(position === 2){
            for(element in GRAPHDIV.data[trace].z){
                if(GRAPHDIV.data[trace].z[element] === term){
                    shapes.push(valueShape);
                }
                else {
                    //If the term is not found, we want to keep the same shape as before 
                    let index_term = terms_and_shapes_associated[0].indexOf(GRAPHDIV.data[trace].z[element]);
                    let shape = terms_and_shapes_associated[1][index_term];
                    shapes.push(shape);
                }
            }
            var update = {
                'marker.symbol': [shapes]
            }
        }
        else {
            for(element in GRAPHDIV.data[trace].text){
                if(GRAPHDIV.data[trace].text[element] === term){
                    shapes.push(valueShape);
                }
                else {
                    //If the term is not found, we want to keep the same shape as before
                    let index_term = terms_and_shapes_associated[0].indexOf(GRAPHDIV.data[trace].text[element]);
                    let shape = terms_and_shapes_associated[1][index_term];
                    shapes.push(shape);
                }
            }
            var update = {
                'marker.symbol': [shapes]
            }
        }
        Plotly.restyle(GRAPHDIV, update, [trace]);
        //Re-initialization of the list for the next trace.
        shapes = [];
    }
}

/**
 * Changes the color of each point belonging to a specific value in qualitative layers
 * @param {number} position indicates the div number to modify the color (is it the first qualitative value or the second one ?) 
 * @param {string} different_terms A string with all the terms of the concerned layer is in, separated by a comma
 * @param {string} term indicates the style number to modify
 */
function change_legend_color (position, different_terms, term) {
    //Starting by looking at how many terms has been changed : 
    var terms = different_terms.split(",");

    //Creation of a correspondance table, where each term will be associated
    //to the color associated on the color picker
    for(trace in GRAPHDIV.data){
        var styles = [];

        //Look what div is concerned by the change
        if(position === 2){
            
            //A target by group will be added to the transform.
            for(term in terms){
                if(document.getElementById(`cp_${position}_${terms[term]}`).value != "#ffffff"){
                    styles.push({
                    target: terms[term],
                    value: {
                        marker: {
                            color: document.getElementById(`cp_${position}_${terms[term]}`).value
                        }
                    }
                    });
                }
            }

            //create the update for the second div
            var update = {
                transforms: [[{
                    type: 'groupby',
                    groups: GRAPHDIV.data[trace].z,
                    styles: styles
                }]]
            };
        }
        else {
            //A target by group will be added to the transform
            for(term in terms){
                if(document.getElementById(`cp_${position}_${terms[term]}`).value != "#ffffff"){
                    styles.push({
                    target: terms[term],
                    value: {
                        marker: {
                            color: document.getElementById(`cp_${position}_${terms[term]}`).value
                        }
                    }
                    });
                }
            }

            //Create the update for the first div
            var update = {
                transforms: [[{
                    type: 'groupby',
                    groups: GRAPHDIV.data[trace].text,
                    styles: styles
                }]]
            };
        }
        //Update on the graph
        Plotly.restyle(GRAPHDIV, update, [trace]);
    }
}

/**
 * Happens when the value inside the input range for "size" is changed.
 * Changes the size of the points wich belongs to the value selected.
 * If the selected size is bigger or equal to 6, then a black border is added to the point.  
 * 
 * Please don't judge the quality of that work. It tooks me ages to figure out a solution.
 * 
 * @param {number} position indicates the div number to modify the color (is it the first qualitative value or the second one ?) 
 * @param {string} different_terms A string with all the terms of the concerned layer is in, separated by a comma
 * @param {string} term the name of the term concerned by the size change
 * @param {string} valueSize the size selected in the range slider. Can go from O to 10. Default value = 3
 */
function change_size_legend (position, different_terms, term, valueSize) {
    //Starting by looking at how many terms has been changed :
    let terms = different_terms.split(",");

    //First step : Create a dictionnary of sizes and terms.
    let terms_and_sizes_associated = [terms];
    let all_sizes = [];
    for(let term_i in terms){
        //There is two differents size sliders : 1 for the shape, 1 for the color.
        //We want here to make sure we take the right appropriate one, depending on if 
        //we have changed dot size on the shape or the color.
        if(document.getElementsByName(`size_color_${position}_${terms[term_i]}`).length != 0){
            all_sizes.push(document.getElementsByName(`size_color_${position}_${terms[term_i]}`)[0].value);
        }
        else {
            all_sizes.push(document.getElementsByName(`size_shape_${position}_${terms[term_i]}`)[0].value);
        }
    }
    terms_and_sizes_associated.push(all_sizes);

    //If there is a second div, do an other correspondace table for this other div
    //Quick fonction to return unique values of an array
    function onlyUnique(value, index, self) { 
        return self.indexOf(value) === index;
    }

    //Searching for the list of terms in the other div
    let isThereASecondDiv = !document.getElementById('display_qual_color_2').hidden || !document.getElementById('display_shapes_2').hidden;

    if(position === 1){
        if(isThereASecondDiv){
            var terms_to_filter = GRAPHDIV.data[0].z;
            var inverted_position = 2;
        }
    }
    else {
        var terms_to_filter = GRAPHDIV.data[0].text;
        var inverted_position = 1;
    }
    
    //Filter those term to have only uniq one
    if(isThereASecondDiv){
        var terms_bis = terms_to_filter.filter(onlyUnique);
        terms_bis = terms_bis.sort();
        var terms_and_sizes_associated_bis = [terms_bis];
        var all_sizes_bis = [];

        for(let term_i in terms_bis){
            //There is two differents size sliders : 1 for the shape, 1 for the color.
            //We want here to make sure we take the right appropriate one, depending on if 
            //We have changed dot size on the shape or the color.
            if(document.getElementsByName(`size_color_${inverted_position}_${terms_bis[term_i]}`).length != 0){
                all_sizes_bis.push(document.getElementsByName(`size_color_${inverted_position}_${terms_bis[term_i]}`)[0].value);
            }
            else {
                all_sizes_bis.push(document.getElementsByName(`size_shape_${inverted_position}_${terms_bis[term_i]}`)[0].value);
            }
        }
        terms_and_sizes_associated_bis.push(all_sizes_bis);
    }
    let sizes = [];
    let widths = [];

    //Looking at all current sizes, and register them for each points
    for(trace in GRAPHDIV.data){
        if(position === 2){
            //It means there is two qualitative layers.
            for(element in GRAPHDIV.data[trace].z){
                //Add the size selected for each point with a corresponding term
                if(GRAPHDIV.data[trace].z[element] === term){
                    sizes.push(valueSize);
                    if(valueSize>=6){
                        widths.push(1);
                    }
                    else{
                        widths.push(0);
                    }
                }

                else {
                    //If the term is not found, we want to keep the same size as before
                    //But, we need to make sure that the point is not linked to an other term with a bigger size
                    var index_term = terms_and_sizes_associated[0].indexOf(GRAPHDIV.data[trace].z[element]);
                    var index_term_bis = terms_and_sizes_associated_bis[0].indexOf(GRAPHDIV.data[trace].text[element]);

                    //Searching for who has the biggest size, and add it to the size array
                    if(parseInt(terms_and_sizes_associated[1][index_term]) >= parseInt(terms_and_sizes_associated_bis[1][index_term_bis])){
                        var size = parseInt(terms_and_sizes_associated[1][index_term]);
                        sizes.push(size);
                    } else {
                        var size = parseInt(terms_and_sizes_associated_bis[1][index_term_bis]);
                        sizes.push(size);
                    }

                    if(size>=6){
                        widths.push(1);
                    } else{
                        widths.push(0);
                    }
                }
            }
            var update = {
                'marker.size': [sizes],
                'marker.opacity': 1,
                'marker.line.width': [widths],
                'marker.line.color': 'rgb(0,0,0)'
            }
        }

        else { // means Position == 1, so we are looking into text instead of "z".
            for(element in GRAPHDIV.data[trace].text){
                if(GRAPHDIV.data[trace].text[element] === term){
                    sizes.push(valueSize);
                    if(valueSize>=6){
                        widths.push(1);
                    }
                    else{
                        widths.push(0);
                    }
                }
                else {
                    //If the term is not found, we want to keep the same size as before
                    //If there is two div : 
                    if(isThereASecondDiv){
                        //But, we need to make sure that the point is not linked to an other term with a bigger size
                        //We are looking for change on the first div. So the opposite position is obviously 2.
                        let index_term = terms_and_sizes_associated[0].indexOf(GRAPHDIV.data[trace].text[element]);
                        let index_term_bis = terms_and_sizes_associated_bis[0].indexOf(GRAPHDIV.data[trace].z[element]);

                        //Looking for the biggest dot size between div1 and div2 on a precise point
                        if(parseInt(terms_and_sizes_associated[1][index_term]) >= parseInt(terms_and_sizes_associated_bis[1][index_term_bis])){
                            var size = parseInt(terms_and_sizes_associated[1][index_term]);
                            sizes.push(size);
                        }
                        else {
                            //If the biggest size is on div2, then add the div2 size on the term related to the point
                            var size = parseInt(terms_and_sizes_associated_bis[1][index_term_bis]);
                            sizes.push(size);
                        }
                        if(size>=6){
                            widths.push(1);
                        }
                        else{
                            widths.push(0);
                        }
                    } 
                    else {
                        let index_term = terms_and_sizes_associated[0].indexOf(GRAPHDIV.data[trace].text[element]);
                        let size = parseInt(terms_and_sizes_associated[1][index_term]);
                        sizes.push(size);
                        if(size>=6){
                            widths.push(1);
                        }
                        else{
                            widths.push(0);
                        }
                    }
                }
            }
            var update = {
                'marker.size': [sizes],
                'marker.opacity': 1,
                'marker.line.width': [widths],
                'marker.line.color': 'rgb(0,0,0)'
            }
        }
        Plotly.restyle(GRAPHDIV, update, [trace]);
        //Re-initialization of lists for the next trace
        sizes = [];
        widths = [];
    }
}