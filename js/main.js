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

var VAL_MIN = 0;
var DOT_SIZE = 3;

const GRAPHDIV = document.getElementById('graphic');

//Creation of buttons to hide/show axis
const UPDATEMENUS = [
    {
    buttons: [
            {
                args: [{'xaxis.showline':false,
                    'yaxis.showline':false, 
                    'xaxis.visible':false, 
                    'yaxis.visible':false
                }],
                label: 'Hide axis',
                method: 'relayout'
            },
            {
                args: [{'xaxis.showline':true, 
                    'yaxis.showline':true,
                    'xaxis.visible':true, 
                    'yaxis.visible':true,
                    'xaxis.ticks':'outside',
                    'yaxis.ticks':'outside'
                }],
                label:'Show axis',
                method:'relayout'
            }
        ],
        direction: 'down',
        showactive: true,
        type: 'dropdown',
        x: 1.02,
        xanchor: 'left',
        y: 1.1,
        yanchor: 'bottom'
    }
];

var LAYOUT = {
    xaxis: {visible: false, showgrid: false, zeroline: false}, 
    yaxis: {visible: false, showgrid: false, zeroline: false},
    updatemenus: UPDATEMENUS
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

    //disable saving parameters buttons
    document.getElementById('save_param_button').setAttribute('disable', '');
    document.getElementById('load_param_button').setAttribute('disable', '');

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
        document.getElementById('save_param_button').setAttribute('disabled', '');
        document.getElementById('load_param_button').setAttribute('disabled', '');

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
                //update axis titles
                var update = {
                    'xaxis.title.text':document.getElementById('x_axis_select_id').value,
                    'yaxis.title.text':document.getElementById('y_axis_select_id').value
                }
                Plotly.relayout(GRAPHDIV, update);
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

                //update axis titles
                var update = {
                    'xaxis.title.text':document.getElementById('x_axis_select_id').value,
                    'yaxis.title.text':document.getElementById('y_axis_select_id').value
                }
                Plotly.relayout(GRAPHDIV, update);

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
                parse_csv_to_json();
            }
            //If there is no file already loaded, wait for the user to load a file.
        }
    }
    else {
        RESAMPLE_SIZE = undefined;
        if(FILE != undefined){
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


/**
 * Export a .txt file with the parameters sets for qualitative variables.
 * The format look like that : 
 * #1 : Legend of [...]
 * NAME     SHAPE   SIZE    COLOR(hex)
 * [...]
 * #2 : Legend of [...]
 * NAME     SHAPE   SIZE    COLOR(hex)
 * [...]
 */
function save_parameters () {

    //Ask for name
    let filename = prompt('Name of the file : ', 'save_parameters.txt');
    
    //create the text to save
    //First add the header
    let text = `#1 : ${document.getElementById('shapes_title_1').innerHTML}\n`;

    //We take care of the first div
    //First step : getting the names
    let different_terms = GRAPHDIV.data[0].text;
    let terms_list = [];
    for(intermediate_term in different_terms){
        if(!terms_list.includes(different_terms[intermediate_term])){
            terms_list.push(different_terms[intermediate_term]);
        }
    }
    terms_list.sort();

    //Each term will be a new line added.
    for(term in terms_list){
        let shape = document.getElementById(`shape_1_${terms_list[term]}`).value;
        let size = document.getElementsByName(`size_shape_1_${term}`)[0].value;
        if(document.getElementById(`cp_1_${terms_list[term]}`) === null){
            var color = null;
        } 
        else if(document.getElementById(`cp_1_${terms_list[term]}`).value === '#ffffff'){
            var color = null;
        }
        else {
            var color = document.getElementById(`cp_1_${terms_list[term]}`).value;
        }
        
        text = text + `${terms_list[term]}\t${shape}\t${size}\t${color}\n`;
    }

    //If there is a second div
    if(!document.getElementById('display_qual_color_2').hidden || !document.getElementById('display_shapes_2').hidden){
        //There is two qualitative layers
        text = text + `#2 : ${document.getElementById('shapes_title_2').innerHTML}\n`;
        
        //getting the names
        let different_terms = GRAPHDIV.data[0].z;
        let terms_list = [];
        for(intermediate_term in different_terms){
            if(!terms_list.includes(different_terms[intermediate_term])){
                terms_list.push(different_terms[intermediate_term]);
            }
        }
        terms_list.sort();

        //Each term will be a new line added.
        for(term in terms_list){
            let shape = document.getElementById(`shape_2_${terms_list[term]}`).value;
            let size = document.getElementsByName(`size_shape_2_${term}`)[0].value;
            if(document.getElementById(`cp_2_${terms_list[term]}`) === null){
                var color = null;
            } 
            else if(document.getElementById(`cp_2_${terms_list[term]}`).value === '#ffffff'){
                var color = null;
            }
            else {
                var color = document.getElementById(`cp_2_${terms_list[term]}`).value;
            }
            
            text = text + `${terms_list[term]}\t${shape}\t${size}\t${color}\n`;
        }
    }

    /*Create a hyperlink for the download without server
    For that, a fake element is created, and simulate a download click, 
    then will be destroyed from the real document.
    */
    var element = document.createElement('a');
    element.setAttribute('href', 'data:/text/plain,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

/**
 * This function has for only purpose to simulate a click
 * on the "load_param_file" button, to allow user to give a file.
 */
function reading_parameters_file (){
    //simulate a click on the load_param_file button
    document.getElementById('load_param_file').click();
}

/**
 * Parse a .txt file, containing parameters on qualitative values.
 * This function will change all buttons on the qualitative legend.
 * Then, it will upload the graph with the appropriate parameters.
 * 
 * If the file entered doesn't correspond to the buttons given,
 * then the programm stops, and an error message is displayed.
 * 
 * PROBLEM TO FIX : If a name start by "#1" or "#2", it can be interpreted
 * as and header
 */
function load_parameters() {
    /////////////////////////
    //  1 : Load the file  //
    /////////////////////////
    let load_file = undefined;
    load_file = document.getElementById('load_param_file').files[0];
    
    let complete_file = [[],[]];
    
    let div_change;
    let re_div1 = RegExp('#1 : Legend of');
    let re_div2 = RegExp('#2 : Legend of');

    //////////////////////////////////
    //  2 : Parse the file loaded   //
    //////////////////////////////////
    Papa.parse(load_file, {
        //We can have one or two header, depending on the number of div
        step: function(line) {
            if(re_div1.test(line.data)){
                div_change = 0;
            }
            //If it's the header, then we want to save a div.
            //When the header we will be hit again, we will save the other div
            else if(re_div2.test(line.data)){
                div_change = 1;
            }
            else{
                if(line.data[0] !== ""){
                    complete_file[div_change].push(line.data);   
                }
            }
        },
        complete: function(){    
            //////////////////////////////////
            //  3 : Look if the parameters  //
            //      fits the variables      //
            //////////////////////////////////

            //Case 1 : There is 2 div
            if(!document.getElementById('display_qual_color_2').hidden || !document.getElementById('display_shapes_2').hidden){
                //Case 1.1 : If there is a second div on the layer change, but the given file contain only one, it will raise an exception
                if(complete_file[1].length === 0){
                    alert('The file contain only 1 layer of qualitative information.\nAre you sure you have given the right file?');
                    return //Early return
                }
                //Case 1.2 : the terms don't correspond to anything regarding the variables
                for(let div = 0; div <= 1; div ++){
                    let ensemble_term = "";
                    for (term in complete_file[div]){
                        if(document.getElementsByName(`${complete_file[div][term][0]}`).length === 0){
                            alert(`The parameters in the file don't correspond to the parameters in the layer!\nAre you sure you have given the right file?`);
                            return; //Early return
                        }
                        if(term !== 0){
                            ensemble_term = ensemble_term + "," + complete_file[0][term][0];
                        }
                        else {
                            ensemble_term = ensemble_term + complete_file[0][term][0];
                        }
                    }
                }
            }
            //Case 2 : There is 1 div
            else {
                //Case 2.1 : If there is no second div on the layer change, but the given file contain information, it will raise an expetion.
                if(complete_file[1].length !== 0){
                    alert('The file contain 2 layers of qualitative information.\nAre you sure you have given the right file?');
                    return; //Early return
                }
                //Case 2.2 : the terms don't correspond to anything regarding the variables
                let ensemble_term = "";
                for(let term in complete_file[0]){
                    if(document.getElementsByName(`${complete_file[0][term][0]}`).length === 0){
                        alert("The parameters in the file don't correspond to the parameters in the layer!\nAre you sure you have given the right file?");
                        return; //Early return
                    }
                    if(term == 0){
                        ensemble_term = ensemble_term + complete_file[0][term][0];
                    }
                    else {
                        ensemble_term = ensemble_term + "," + complete_file[0][term][0];
                    }
                }
                //Now, we can change the right term with the corresponding parameter
                for (let term in complete_file[0]){
                    let term_name_div1 = complete_file[0][term][0];
                    //First parameter to change : shape
                    for(let node = 0; node < document.getElementsByName(`${term_name_div1}`).length; node ++){
                        if(document.getElementsByName(`${term_name_div1}`)[node].id.includes("shape")){
                            document.getElementsByName(`${term_name_div1}`)[node].value = complete_file[0][term][1];
                            change_shape_legend(1, ensemble_term, term_name_div1, complete_file[0][term][1]);
                        }
                    }
                    //Second parameter to change : size
                }
            }
        }
    });
}