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
 * Main function of the three-parameters mode.
 * Will determine how many quantitatives and qualitatives values are asked, and
 * then draw the plot.
 * First case : Three quantitative parameters
 * 
 * Second case : One qualitative and two quantitative parameters
 * (Transparency variation sliders, the color of each point depend
 * on the quantitative data : colorscale).
 * 
 * Third case : Two qualitative and one quantitative parameters.
 * (Variation on two colorscales, one for each value).
*/
function three_parameters() {
    /*If the three columns have been selected, checks if we are
    in case 3 (three quantitative parameters)
    in case 2 (mixed between 1 quantitative and 2 qualitative parameters)
    in case 1 (mixed between 2 quantitative and 1 qualitative parameters) */

    //Reset legend if already existing
    clearLegend();

    if(check_all_select_filled(3)){
        let n_quantitatives = is_quantitative([1, 2, 3]);

        switch(n_quantitatives){
            case 0 :
                alert("You can't select more than 2 qualitatives layers !\nPlease select again");
                //TO DO : Reset the three parameters mode
            break;

            case 1 :
                //There is one quanti and two quali variables
                one_quanti_two_quali();
            break;

            case 2 :
                //There is two quanti and one quali variables
                two_quanti_one_quali();
            break;

            case 3 :
                //There is three quantitative variables
                three_quanti();
            break;

            default :
                //This shouldn't happens but we never know
                alert("A problem as been encountered. \nPlease reload the application");
            break;
        }
    }
}

function one_quanti_two_quali () {

    //Determine the position of qualitative attributes
    var list_quanti;
    var list_quali = [];

    //For each button, activate or hide the colors/shape controls
    for(let j = 1; j <= 3; j++){
        if(is_quantitative(j)){
            document.getElementById(`control_checkbox_${j}`).setAttribute('hidden', '');
            list_quanti = j;
        }
        else {
            document.getElementById(`control_color_${j}`).setAttribute('hidden', '');
            list_quali.push(j);
        }
    }
    one_parameter(list_quanti, list_quali[0], list_quali[1]);
    add_legend_shapes(list_quali);
}

/**
 * Handles data if there is four quantitative columns selected, and one qualitative column selected.
 * There will be two colors selected : 
 *      - One for layer 1
 *      - One for layer 2
 * And all their overlay (see two_parameters() description for more details).
 * The legend will be displayed for both quantitative and qualitative values
 * 
 * The plot will be entirely redrawn in the two_parameters() function.
 */
function two_quanti_one_quali () {
    //First, search for the position of quantitative values
    var list_quanti = [];
    var list_quali;
    for(let j = 1; j <= 3; j++){
        if(is_quantitative(j)){
            //Display color pickers
            document.getElementById(`control_color_${j}`).removeAttribute('hidden');
            //Hide unecessary buttons
            document.getElementById(`control_checkbox_${j}`).setAttribute('hidden', '');
            list_quanti.push(j);
        }
        else {
            //Display radio buttons for qualitative values
            document.getElementById(`control_checkbox_${j}`).removeAttribute('hidden');
            //Hide unecessary buttons
            document.getElementById(`control_color_${j}`).setAttribute('hidden', '');
            list_quali = j;
        }
    }

    //Retrieves colors values
    color1 = document.getElementById(`color_layer_${list_quanti[0]}`).value;
    color2 = document.getElementById(`color_layer_${list_quanti[1]}`).value;
    color = [color1, color2];

    //Retrieves names of columns
    quanti_column_name1 = document.getElementById(`selectLayer${list_quanti[0]}`).value;
    quanti_column_name2 = document.getElementById(`selectLayer${list_quanti[1]}`).value;
    quali_column_name = document.getElementById(`selectLayer${list_quali}`).value;

    //Display color for quantitatives values
    //As the same way that "two parameters" does
    two_quanti(color, quanti_column_name1, quanti_column_name2, quali_column_name);

    //Now, handles qualitative value.
    //Display the legend : 
    add_legend_shapes(list_quali);
}

/**
 * Handles data if there is three quantitatives colums selected.
 * There will be three colors selected : 
 *      - One for the layer 1
 *      - One for the layer 2
 *      - One for the layer 3
 * 
 * A quantitative colorscale will be calculated for points with a positive value for :
 *      - Both layers 1 and 2
 *      - Both layers 2 and 3
 *      - Both layers 1 and 3
 * 
 * For the layers combined 1, 2 and 3, the points will appears black if so.
 * 
 * @param {Array} color Array of strings : hexadecimal value of each color
 * @param {string} quanti_column_name1 Name of the first quantitative column
 * @param {string} quanti_column_name2 Name of the second quantitative column
 * @param {string} quanti_column_name3 Name of the third quantitative column
 * @param {string} quali_column_name Name of the first qualitative column
 * @param {string} quali_column_name2 Name of the second qualitative column
 */
function three_quanti (color = undefined, 
    quanti_column_name1 = undefined, 
    quanti_column_name2 = undefined, 
    quanti_column_name3 = undefined, 
    quali_column_name = undefined, 
    quali_column_name2 = undefined) {
    
    var colorscale = [[[0,'#e3e3e3'], [1,'#e3e3e3']]]; //The first colorscale (for all "0" values) is already sets

    if(quanti_column_name1 === undefined 
        && quanti_column_name2 === undefined 
        && quanti_column_name3 === undefined
        && color === undefined){

        //Make the color pickers appears
        for(let j = 1; j <= 3 ; j++){
            document.getElementById(`control_color_${j}`).removeAttribute('hidden');
        }

        quanti_column_name1 = document.getElementById('selectLayer1').value;
        quanti_column_name2 = document.getElementById('selectLayer2').value;
        quanti_column_name3 = document.getElementById('selectLayer3').value;

        var color = [];
        for(let j = 1; j <= 3 ; j++){
            color.push(document.getElementById(`color_layer_${j}`).value);
            colorscale.push(creating_palette_several_layers(hexToRgb(color[j-1])));
        }
    }
    else {
        for(let j = 0; j<3; j++){
            colorscale.push(creating_palette_several_layers(hexToRgb(color[j])));
        }
    }

    //First step : separate points into traces
    var values_layer1 = [];
    var values_layer2 = [];
    var values_layer3 = [];

    //Second step : Retrieve the list of quantitative values
    for(let j = 0; j < TAB_LENGTH; j++){
        values_layer1.push(parseFloat(PARSED_RESULTS[j][quanti_column_name1]));
        values_layer2.push(parseFloat(PARSED_RESULTS[j][quanti_column_name2]));
        values_layer3.push(parseFloat(PARSED_RESULTS[j][quanti_column_name3]));
    }

    var cmax1 = Math.max.apply(null, values_layer1);
    var cmax2 = Math.max.apply(null, values_layer2);
    var cmax3 = Math.max.apply(null, values_layer3);

    //Trace computing
    var data = [];
    var title;
    var legend = [];

    //Third palette corresponding to the L1 and L2 overlay
    rgb_interm_color = calculation_middle_color(color);

    for(let color_max in rgb_interm_color) {
        interm_palette = [[0, '#e3e3e3'], [1, rgb_interm_color[color_max]]];
        colorscale.push(interm_palette);
    }

    //Deletes last element in colorscale array
    colorscale.pop();
    //Add custom colorscale from white to black for a total overlay
    colorscale.push([[0, '#e3e3e3'], [1, '#000000']]);

    //We want 8 different traces here
    for (let j = 0; j <= 7; j++) {
        var X = [];
        var Y = [];
        var Z = [];
        var text = [];
        var color = [];
        title='';

        for(let point in values_layer1){
            if (j === 0 
                && values_layer2[point] <= VAL_MIN  
                && values_layer1[point] <= VAL_MIN 
                && values_layer3[point] <= VAL_MIN){

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);
                if(quali_column_name != undefined){
                    text.push(PARSED_RESULTS[point][quali_column_name]);
                    if(quali_column_name2 != undefined){
                        Z.push(PARSED_RESULTS[point][quali_column_name2]);
                    }
                }
                color.push(VAL_MIN);
                title = 'LC ' + j +  ` = No layer detected (${X.length} cells)\n`;
            }

            //Looking at the values which contain only L1
            else if (j === 1  
                && values_layer2[point] <= VAL_MIN 
                && values_layer3[point] <= VAL_MIN 
                && values_layer1[point] > VAL_MIN){

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);
                if(quali_column_name != undefined){
                    text.push(PARSED_RESULTS[point][quali_column_name]);
                    if(quali_column_name2 != undefined){
                        Z.push(PARSED_RESULTS[point][quali_column_name2]);
                    }
                }
                color.push(PARSED_RESULTS[point][quanti_column_name1]);
                title = 'LC ' + j + ' = Only '+quanti_column_name1+` (${X.length} cells)\n`;
            }

            //Looking at the values which contain only L2
            else if (j === 2 
                && values_layer1[point] <= VAL_MIN
                && values_layer3[point] <= VAL_MIN
                && values_layer2[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);
                if(quali_column_name != undefined){
                    text.push(PARSED_RESULTS[point][quali_column_name]);
                    if(quali_column_name2 != undefined){
                        Z.push(PARSED_RESULTS[point][quali_column_name2]);
                    }
                }
                color.push(PARSED_RESULTS[point][quanti_column_name2]);
                title = 'LC ' + j + ' = Only '+quanti_column_name2+` (${X.length} cells)\n`;
            }

            //Looking at the values which contain only L3
            else if (j === 3
                && values_layer1[point] <= VAL_MIN 
                && values_layer2[point] <= VAL_MIN
                && values_layer3[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);
                if(quali_column_name != undefined){
                    text.push(PARSED_RESULTS[point][quali_column_name]);
                    if(quali_column_name2 != undefined){
                        Z.push(PARSED_RESULTS[point][quali_column_name2]);
                    }
                }
                color.push(PARSED_RESULTS[point][quanti_column_name3]);
                title = 'LC ' + j + ' =  Only '+quanti_column_name3+` (${X.length} cells)\n`;
            }

            //Looking at the values which contain L1 and L2
            else if (j === 4
                && values_layer1[point] > VAL_MIN
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] <= VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);
                if(quali_column_name != undefined){
                    text.push(PARSED_RESULTS[point][quali_column_name]);
                    if(quali_column_name2 != undefined){
                        Z.push(PARSED_RESULTS[point][quali_column_name2]);
                    }
                }

                //Percent of expression calculated
                let exp_percent1 = (values_layer1[point]*100)/cmax1;
                let exp_percent2 = (values_layer2[point]*100)/cmax2;
                let exp_percent = (exp_percent1+exp_percent2)/2;
                color.push(exp_percent);
                title = 'LC ' + j + ' = ' 
                        + quanti_column_name1 + ' + ' 
                        + quanti_column_name2+` (${X.length} cells)\n`;
            }

            //Looking at the values which contain L1 and L3
            else if (j === 5
                && values_layer1[point] > VAL_MIN
                && values_layer2[point] <= VAL_MIN
                && values_layer3[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);
                if(quali_column_name != undefined){
                    text.push(PARSED_RESULTS[point][quali_column_name]);
                    if(quali_column_name2 != undefined){
                        Z.push(PARSED_RESULTS[point][quali_column_name2]);
                    }
                }

                //Percent of expression calculated
                let exp_percent1 = (values_layer1[point]*100)/cmax1;
                let exp_percent2 = (values_layer3[point]*100)/cmax3;
                let exp_percent = (exp_percent1+exp_percent2)/2;                     
                color.push(exp_percent);
                title = 'LC ' + j + ' = ' 
                        + quanti_column_name1 + ' + ' 
                        + quanti_column_name3+` (${X.length} cells)\n`;
            }

            //Looking at the values which contain L2 and L3
            else if (j === 6
                && values_layer1[point] <= VAL_MIN
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);
                if(quali_column_name != undefined){
                    text.push(PARSED_RESULTS[point][quali_column_name]);
                    if(quali_column_name2 != undefined){
                        Z.push(PARSED_RESULTS[point][quali_column_name2]);
                    }
                }

                //Percent of expression calculated
                let exp_percent1 = (values_layer2[point]*100)/cmax2;
                let exp_percent2 = (values_layer3[point]*100)/cmax3;
                let exp_percent = (exp_percent1+exp_percent2)/2;                     
                color.push(exp_percent);
                title = 'LC ' + j + ' = ' 
                        + quanti_column_name2 + ' + ' 
                        + quanti_column_name3+` (${X.length} cells)\n`;
            }

            //Looking at the values which contain L1, L2 and L3 together
            else if(j === 7
                && values_layer1[point] > VAL_MIN
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);
                if(quali_column_name != undefined){
                    text.push(PARSED_RESULTS[point][quali_column_name]);
                    if(quali_column_name2 != undefined){
                        Z.push(PARSED_RESULTS[point][quali_column_name2]);
                    }
                }
                
                //Percent of expression calculated
                let exp_percent1 = (values_layer1[point]*100)/cmax1;
                let exp_percent2 = (values_layer2[point]*100)/cmax2;
                let exp_percent3 = (values_layer3[point]*100)/cmax3;
                let exp_percent = (exp_percent1+exp_percent2+exp_percent3)/3;                     
                color.push(exp_percent);
                title = 'LC ' + j + ' = ' 
                        + quanti_column_name1 + ' + ' 
                        + quanti_column_name2 + ' + ' 
                        + quanti_column_name3+` (${X.length} cells)\n`;
            }
        }

        //Add a trace
        if(quali_column_name != undefined){
            if(quali_column_name2 != undefined) {
                data.push({
                    x: X,
                    y: Y,
                    z: Z,
                    text: text,
                    mode: 'markers',
                    marker: {
                        size: DOT_SIZE,
                        color: color,
                        colorscale: colorscale[j],
                        cmin: VAL_MIN
                    },
                    name: 'LC ' + j,
                    type: 'scattergl',
                    hoverinfo: 'none' //to hide labels on points
                });  
            }
            else {
                data.push({
                    x: X,
                    y: Y,
                    text: text,
                    mode: 'markers',
                    marker: {
                        size: DOT_SIZE,
                        color: color,
                        colorscale: colorscale[j],
                        cmin: VAL_MIN
                    },
                    name: 'LC ' + j,
                    type: 'scattergl',
                    hoverinfo: 'none' //to hide labels on points
                });
            }
        }
        else {
            //Add a trace
            data.push({
                x: X,
                y: Y,
                mode: 'markers',
                marker: {
                    size: DOT_SIZE,
                    color: color,
                    colorscale: colorscale[j],
                    cmin: VAL_MIN
                },
                name: 'LC ' + j,
                type: 'scattergl',
                hoverinfo: 'none' //to hide labels on points
            });
        }

        if(title != ''){
            legend.push(title);
        }
    }

    //Display the legend
    display_legend(legend);

    //update the graph
    Plotly.purge(GRAPHDIV);
    Plotly.react(GRAPHDIV, data, LAYOUT, {responsive: true});
    Plotly.relayout(GRAPHDIV, 'showlegend', true);
}