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
 * TO DO :
 * - Prevent selection of two same parameters. (ex : 2 parameters are selected : CD3E and CD3E)
 * - Add a button allowing user to choose the size of the point
 * - BUG : selecting "id" = fails
 **/

//Code Convention specify that global variables names should be written in upper case. 

//Counter used for reseting lists on listsDisplay()
var i = 1;

//Boolean to know if the current line is the first one of the file
var IS_FIRST_TIME = true;
//Boolean to know if the plot has already been created
var IS_CREATED = false;

//Headers of files need to remain accessible in the whole script
var HEADER;
var PARSED_RESULTS = [];
var TAB_LENGTH;
var RESAMPLE_SIZE;

//File name given by the user
var FILE;

//X and Y coordinates of the points to display
var X_name;
var Y_name;

var VAL_MIN = 0; //personal note (to remove !!) : 6.4 
var DOT_SIZE = 3;

const GRAPHDIV = document.getElementById('graphic');
var LAYOUT = {
    xaxis: {visible: false, showgrid: false, zeroline: false}, 
    yaxis: {visible: false, showgrid: false, zeroline: false},
    }

/**
 *  Dynamically creates lists depending on the number of parameters selected
 **/
function lists_of_layers_display () {

    //Collect the number of layers selected
    var number_layers_selected = parseInt(document.getElementById('numberOfLayers').value);
    
    clearLists();
    //Hide again all colors layers
    clearColorLists();
    clearLegend();

    //This condition should never happend but we never know
    if (number_layers_selected > 5) {
        number_layers_selected = 5;
    }

    //Call "x" times the function add() wich will creates the number of selective lists desired
    for (let k = 1; k <= number_layers_selected; k++){
        add_select_options();
    }
}

/**
 * Creates one list with an automatic id and name, and will add it into index.html 
 */
function add_select_options () {

    //Creates an input type dynamically
    var element = document.createElement("select");

    //Assign different attributes to the new element
    element.setAttribute("id", `selectLayer${i}`);
    element.setAttribute("name", `selectLayer${i}`);
    element.setAttribute("style", `width:219.267px`);
    element.setAttribute("onchange", `color_point(${i});`);
 
    //Displays on screen
    var myDiv = document.getElementById(`choosing_layer_${i}`);
    myDiv.appendChild(element);

    //Removes all hidden control to show icon
    document.getElementById(`control_for_layer${i}`).removeAttribute('hidden', '');

    //Name increment
    i ++;

    //Add dynamically as much options as the length of header
    let l = HEADER.length; //to speed up the algorithm 
    for (let k = 0; k < l ; k++) {
        
        var option = document.createElement("option");
        if (k === 0) {
            
            option.value = "";
            option.selected;
            option.hidden;
            option.text = "-- Select an option --";
            element.appendChild(option);

            option = document.createElement("option");
            option.value = HEADER[k];
            option.text = HEADER[k];
            element.appendChild(option);
        }
        else {
            option.value = HEADER[k];
            option.text = HEADER[k];
            element.appendChild(option);
        }
    }
}

/**
 * Add a select in the web page, asking for how many
 * selective layers lists to display. 
 */
function select_number_Layers () {

    //Creates a select type dynamically
    let element = document.createElement("select");

    //Assign different attributes to the new element
    element.setAttribute("id", `numberOfLayers`);
    element.setAttribute("name", `numberOfLayersName`);
    element.setAttribute("disabled", '');

    //Display on screen
    let myDiv = document.getElementById("layer_number_selection");
    myDiv.appendChild(element);

    //Add dynamically as much options as the length of header 
    if (HEADER.length > 5) {
        var x = 5;
    }
    else {
        var x = HEADER.length;
    }

    for (let k = 0; k <= x ; k++) {
        let option = document.createElement("option");

        if (k===0) {

            option.value = k;
            option.selected; 
            option.hidden;
            option.text = "How many layers ?";
            element.appendChild(option);
        }
        else {
            option.value = k;
            option.text = k;
            element.appendChild(option);
        }
    }
    document.getElementById('control_text').removeAttribute('hidden', '');
    document.getElementById(`control_for_number_layers`).removeAttribute('hidden', '');
}

/**
 * Indicates the maximum of parameters available. 
 * Displays lists with parameters names on it
 */
function axes_name_diplay () {

    var letters_axis = ["x", "y"];

    let l = letters_axis.length; //to speed up the algorithm
    for(j = 0; j < l; j++){

        //Disable saving buttons (PNG/SVG)
        document.getElementById('svg_button').setAttribute('disabled', '');
        document.getElementById('png_button').setAttribute('disabled', '');

        //Creates a select type dynamically
        var element = document.createElement("select");
    
        //Assign differents attributes to the new element
        element.setAttribute("id", `${letters_axis[j]}_axis_select_id`);
        element.setAttribute("name", `${letters_axis[j]}_axis_select_name`);
        element.setAttribute('disabled', '');
        element.setAttribute("style", 'width:219.267px');
        
        //Displays on screen
        var myDiv = document.getElementById(`${letters_axis[j]}_axis_selection`);
        myDiv.appendChild(element);

        //Add dynamically as much options as the length of header 
        if (HEADER.length < 2) {
            alert("ERROR : There less than two columns in your file. \n Please, provide an other file with at least a X and a Y axis");
        }

        let l = HEADER.length; //to speed up the algorithm
        for (var k = 0; k < l ; k++) {
            var option = document.createElement("option");

            if (k===0) {
                option.value = "";
                option.selected; 
                option.disabled;
                option.hidden;
                option.text = `-- Select ${letters_axis[j]} axis --`;
                element.appendChild(option);

                option = document.createElement("option");
                option.value = HEADER[k];
                option.text = HEADER[k];
                element.appendChild(option);
            }
            else {
                option.value = HEADER[k];
                option.text = HEADER[k];
                element.appendChild(option);

            }
        }
        element.removeAttribute('disabled');
        document.getElementById(`control_for_${letters_axis[j]}`).removeAttribute('hidden', '');
    }
}

/**
 * Check if both axes (X and Y) are selected to initiate the drawing.
 */
function check_both () {
    X_name = document.getElementById('x_axis_select_id').value;
    Y_name = document.getElementById('y_axis_select_id').value;

    //Check that both buttons are selected
    if (X_name != "" && Y_name != "") {
        //Check that quantitatives values are selected for both
        const re = /^(-)?[0-9]+(\.)?([0-9])*$/;
        if(re.test(PARSED_RESULTS[1][X_name]) && re.test(PARSED_RESULTS[1][Y_name])){
            //checking if a plot already exists : 
            if(GRAPHDIV.data === undefined){
                clearLegend();
                draw_on_axes(X_name, Y_name);
            }
            //Otherwise we just rewrite coordinates
            else {
                var X = [];
                var Y = [];
                for (element in PARSED_RESULTS){
                    X.push(PARSED_RESULTS[element][X_name]);
                    Y.push(PARSED_RESULTS[element][Y_name]);
                }
                Plotly.restyle(GRAPHDIV, {'x':[X], 'y':[Y]});
 
                //Enable save PNG/SVG buttons when the plot is shown 
                if(document.getElementById('svg_button').disabled){
                    document.getElementById('svg_button').removeAttribute('disabled');
                    document.getElementById('png_button').removeAttribute('disabled');
                }

                //Eable button for parameters and axes selection
                document.getElementById('numberOfLayers').removeAttribute('disabled');
                if(document.getElementById('x_axis_select_id').disabled){
                    //Axes selection
                    document.getElementById('x_axis_select_id').removeAttribute('disabled');
                    document.getElementById('y_axis_select_id').removeAttribute('disabled');

                    //parameters selection

                    for(let j = 0; j <= 5; j++){
                        if(document.getElementById(`selectLayer${j}`) != null){
                            document.getElementById(`selectLayer${j}`).removeAttribute('disabled');
                        }
                    }
                }

                switch(parseInt(document.getElementById(`numberOfLayers`).value)){
                    case 1:
                        one_parameter(1);
                    break;
                    case 2:
                        two_parameters();
                    break;
                    case 3:
                        three_parameters();
                    break;
                    case 4:
                        four_parameters();
                    break;
                    case 5:
                        five_parameters();
                    break;
                }
            }
        }
        else{
            alert("Sorry, you can't use qualitative parameters to display axes.\nPlease try again");
            document.getElementById('x_axis_select_id').value = "";
            document.getElementById('y_axis_select_id').value = "";
        }
    }
}

/**
 * Checks if all of the select dropdowns are selected
 * @param {number} number_of_dropdown total number of dropdown buttons
 * 
 * @returns {boolean} true if they are all selected, false otherwise.
 */
function check_all_select_filled (number_of_dropdown) {
    for(let j = 1; j <= number_of_dropdown; j++){
        if(document.getElementById(`selectLayer${j}`).value === ""){
            return false;
        }
    }
    document.getElementById('explanatory_text').removeAttribute('hidden');
    return true;
}

/**
 * Ask for a number of lines to keep
 * This will constitute the number of cells to display
 */
function ask_resampling () {
    console.log("Ask_resampling a été demandé");
    isChecked = document.getElementById('resampling').checked;
    
    if (isChecked) {
        RESAMPLE_SIZE = parseInt(prompt("How many cells do you want to display ?\nPlease provide integer only.\nIf you provide a floating point number, it will be interpreted as a integer."));
        
        if(isNaN(RESAMPLE_SIZE)){
            alert(`This is not a number. \n Please, provide a valid number (integer)`);
            RESAMPLE_SIZE = undefined;
            document.getElementById('resampling').checked = false;
        }
        else {
            //If there is already a file provided, we reload the reading_tsv_file() function
            if(FILE != undefined){
                console.log("Je lance le SVG. 311");
                parse_csv_to_json();
            }
            //If there is no file already loaded, wait for the user to load a file.
        }
    }
    else {
        RESAMPLE_SIZE = undefined;
        if(FILE != undefined){
            console.log("Je lance le SVG. 320");
            parse_csv_to_json();
        }
    }
}

/**
 * Check if the data linked to these columns are quantitatives (int or float)
 * or qualitatives (string), by using a REGEX.
 * 
 * @param {Object} values list of dropdown names selected.
 */
function is_quantitative (values) {
    const re = /^(-)?[0-9]+(\.)?([0-9])*$/;

    //If we have only one layer to check
    if(typeof values === 'number'){

        let column_name = document.getElementById(`selectLayer${values}`).value;
        //Checking if it's a qualitative or a quantitative value.
        return re.test(PARSED_RESULTS[1][column_name]);
    }
    else {
        var n_quantitative = 0;

        for(let j=1; j <= values.length; j++){
            column_name = document.getElementById(`selectLayer${j}`).value;

            if(re.test(PARSED_RESULTS[1][column_name])){
                n_quantitative ++;
            }
        }
        return n_quantitative;
    }
}

/**
 * Supress all sublists of parameter names displayed on screen
 */
function clearLists () {
    //Delete all selective lists already existing
    i = 1; //ID counter is reseted

    for (let j=1; j<=5;j++) {
        document.getElementById(`choosing_layer_${j}`).innerHTML = "";
        //hide controls again
        document.getElementById(`control_for_layer${j}`).setAttribute('hidden','');
    }
}

/**
 * Hide again all color pickers displayed
 */
function clearColorLists () {
    number_of_layers = document.getElementById('numberOfLayers').value;
    for(let j = 1; j<=number_of_layers; j++){
        document.getElementById(`control_color_${j}`).setAttribute('hidden', '');
        document.getElementById(`control_checkbox_${j}`).setAttribute('hidden', '');
    }

    //Remove the color of each trace
    if(GRAPHDIV.data[0].transforms === undefined){
        var update = {
            'marker.color':'#1f77b4',
            'marker.line.width': '0',
            'marker.size': '3',
        };        
    }
    else {
        var update = {
            'marker.color':'#1f77b4',
            'marker.line.width': '0',
            'marker.size': '3',
            'transforms': {}
        }
    }

    //Set slider values to 3 again
    for(j = 1; j <= 5; j++){
        document.getElementById(`dot_size_${j}`).value = 3;
    }

    Plotly.restyle(GRAPHDIV, update);
    Plotly.relayout(GRAPHDIV, {showlegend: false});
}

/**
 * Clears all legend :
 *      - Reset legend
 *      - Hide again all div
 * @param {boolean} is_two_legends_needed Indicates if there is one or two legend to clear.
 */
function clearLegend (is_two_legends_needed = false) {
    for(let j = 1; j <= 2; j++){
        if(!is_two_legends_needed){
            document.getElementById(`shapes_${j}`).innerHTML = "";
            document.getElementById(`shapes_title_${j}`).innerHTML = "";
            document.getElementById(`display_shapes_${j}`).setAttribute('hidden', '');
        
            document.getElementById(`qual_color_${j}`).innerHTML = "";
            document.getElementById(`qual_color_title_${j}`).innerHTML = "";
            document.getElementById(`display_qual_color_${j}`).setAttribute('hidden', '');
        
            document.getElementById('legend').innerHTML = "";
            document.getElementById('legend_title').innerHTML = "";
            document.getElementById('display_legend').setAttribute('hidden', '');
        }
        else {
            document.getElementById(`shapes_${j}`).innerHTML = "";
            document.getElementById(`shapes_title_${j}`).innerHTML = "";
            document.getElementById(`display_shapes_${j}`).setAttribute('hidden', '');
        
            document.getElementById(`qual_color_${j}`).innerHTML = "";
            document.getElementById(`qual_color_title_${j}`).innerHTML = "";
            document.getElementById(`display_qual_color_${j}`).setAttribute('hidden', '');
        }
    }
}