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
 * Main function of the two-parameters mode.
 * Will determine how many quantitative and qualitative values are asked and
 * then draws the plot.
 * First case : Two qualitative parameters
 * 
 * Second case : One qualitative and one quantitative parameter
 * (Transparency variation sliders, the color of each point depend
 * on the quantitative data : colorscale).
 * 
 * Third case : Two quantitative parameters
 * (Variation on two colorscales, one for each value).
*/
function two_parameters () {

    /*If both columns have been selected, checked if we are
    in case 1 (two quantitative parameters)
    in case 2 (mixed between quantitative and qualitative)
    in case 3 (two qualitative parameters) */

    //Reset legend if already existing
    clearLegend();

    if(check_all_select_filled(2)){

        let n_quantitatives = is_quantitative([1, 2]);

        switch(n_quantitatives){
            case 0 : 
                //There is no quantitative variables, only qualitative
                two_quali();
            break;

            case 1 :
                //There is one quanti and one quali variables
                one_quanti_one_quali();
            break;

            case 2 :
                //There is two quantitative variables
                two_quanti();
            break
            
            default :
                //Because we never know
                alert("A problem as been encountered. \nPlease reload the application");
            break;
        }
    } 
    else {
        return;
    }
}

/**
 * Handles data if there is one quantitative column selected, and one qualitative column selected.
 * There will be one color selected for layer 1.
 * (see one_parameter() description for more details).
 * The legend will be displayed for both quantitative and qualitative values
 * 
 * The plot will be entirely redrawn in the one_parameter() function.
 */
function one_quanti_one_quali () {

    //Detect which columns contain quantitative values
    if(is_quantitative(1)){
        //Quantitative values are in selectLayer1
        color = document.getElementById('color_layer_1').value;
        document.getElementById('control_color_1').removeAttribute('hidden');
        document.getElementById('control_color_2').setAttribute('hidden', '');
        quanti_column_name = document.getElementById('selectLayer1').value;
        quali_column_name = document.getElementById('selectLayer2').value;
        document.getElementById('control_checkbox_2').removeAttribute('hidden');
        document.getElementById('control_checkbox_1').setAttribute('hidden', '');
        list_number = 1;
        list_quali = 2;
    } 
    else {
        //Quantitative values are in selectLayer2
        color = document.getElementById('color_layer_2').value;
        document.getElementById('control_color_2').removeAttribute('hidden');
        document.getElementById('control_color_1').setAttribute('hidden', '');
        quanti_column_name = document.getElementById('selectLayer2').value;
        quali_column_name = document.getElementById('selectLayer1').value;
        document.getElementById('control_checkbox_1').removeAttribute('hidden');
        document.getElementById('control_checkbox_2').setAttribute('hidden', '');
        list_number = 2;
        list_quali = 1;
    }

    //Redo traces (here, we only want <= 0 and > 0 values)
    //Let's set two traces : The one who are equals to 0, and the other.
    let quantitatives_values = [];
    for(let j = 0; j < TAB_LENGTH; j++){
        quantitatives_values.push(parseFloat(PARSED_RESULTS[j][quanti_column_name]));
    }

    //Trace computing
    var data = [];
    var palette = [[[0,'#e3e3e3'],[1,'#e3e3e3']]];

    //get the color palette
    palette.push(creating_palette_one_layer(hexToRgb(color)));

    //We want two traces here
    for (let j = 0; j <= 1; j++){
        var X = [];
        var Y = [];
        var text = [];
        var color = [];

        for (let point in quantitatives_values){
            if(j === 0 && quantitatives_values[point] <= VAL_MIN){
                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);
                text.push(PARSED_RESULTS[point][quali_column_name]);
                color.push(VAL_MIN);
            }
            else if(quantitatives_values[point] > VAL_MIN){
                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);
                text.push(PARSED_RESULTS[point][quali_column_name]);
                color.push(PARSED_RESULTS[point][quanti_column_name]);
            }
        }

        //Add a trace
        data.push({
            x: X,
            y: Y,
            text: text,
            mode: 'markers',
            marker: {
                size: DOT_SIZE,
                color: color,
                colorscale: palette[j],
                cmin: VAL_MIN
            },
            type: 'scattergl',
            hoverinfo:'none' //To hide labels on points
        }); 
    }
    
    //update the graph
    Plotly.purge(GRAPHDIV);
    Plotly.react(GRAPHDIV, data, layout={
        xaxis: {visible: false, showgrid: false, zeroline: false}, 
        yaxis: {visible: false, showgrid: false, zeroline: false},
        showlegend: false},
        config={responsive: true});

    add_legend_shapes(list_quali);
}

/**
 * Handles data if there is two qualitative columns selected
 */
function two_quali () {
    for(let j = 1; j<=2; j++){
        document.getElementById(`control_color_${j}`).setAttribute('hidden', '');
        document.getElementById(`control_checkbox_${j}`).removeAttribute('hidden', '');
    }

    //Creates text attribute for data. One variable will be in "text", one in "z" coordinate.
    let text = [];
    let z = [];
    for(let j = 0; j < TAB_LENGTH; j++){
        text.push(PARSED_RESULTS[j][document.getElementById('selectLayer1').value]);
        z.push(PARSED_RESULTS[j][document.getElementById('selectLayer2').value]);
    }

    update = {
        text: [text]
    };

    Plotly.restyle(GRAPHDIV, update);
    Plotly.restyle(GRAPHDIV, 'z', [z]);

    add_legend_shapes([1,2], 2);
}

/**
 * Handles data if there is two quantitative colums selected.
 * There will be two colors seleted : 
 *      - One for the layer 1
 *      - One for the layer 2
 * A quantitative colorscale will be calculated for the points with a positive value for
 * both layer 1 and 2. (So, 3 colorscale in total) 
 * 
 * @param {Array} color Array of strings : hexadecimal value of each color
 * @param {string} quanti_column_name1 Name of the first quantitative column
 * @param {string} quanti_column_name2 Name of the second quantitative column
 * @param {string} quali_column_name Name of the first qualitative column
 * @param {string} quali_column_name2 Name of the second qualitative column
 */
function two_quanti (color = undefined, 
    quanti_column_name1 = undefined, 
    quanti_column_name2 = undefined, 
    quali_column_name = undefined, 
    quali_column_name2 = undefined) {

    var colorscale = [[[0,'#e3e3e3'], [1,'#e3e3e3']]]; //The first colorscale (for all "0" values) is already sets

    if(quanti_column_name1 === undefined 
        && quanti_column_name2 === undefined 
        && color === undefined){

        //Make the color pickers appears
        for(let j = 1; j<=2 ; j++){
            document.getElementById(`control_color_${j}`).removeAttribute('hidden');
        }
        quanti_column_name1 = document.getElementById('selectLayer1').value;
        quanti_column_name2 = document.getElementById('selectLayer2').value;

        var color = [];
        for(let j = 1; j <= 2 ; j++){
            color.push(document.getElementById(`color_layer_${j}`).value);
            colorscale.push(creating_palette_several_layers(hexToRgb(color[j-1])));
        }
    }
    else {
        colorscale.push(creating_palette_several_layers(hexToRgb(color[0])));
        colorscale.push(creating_palette_several_layers(hexToRgb(color[1])));
    }

    //First step : separate points into traces
    let values_layer1 = [];
    let values_layer2 = [];

    //Second step : Retreive the list of quantitative values
    for(let j = 0; j < TAB_LENGTH; j++){
        values_layer1.push(parseFloat(PARSED_RESULTS[j][quanti_column_name1]));
        values_layer2.push(parseFloat(PARSED_RESULTS[j][quanti_column_name2]));
    }

    var cmax1 = Math.max.apply(null, values_layer1);
    var cmax2 = Math.max.apply(null, values_layer2);

    //Trace computing
    var data = [];
    var title;
    var legend = [];

    //Third palette related to the two first overlay
    rgb_interm_color = calculation_middle_color(color);

    interm_palette = [[0, '#e3e3e3'], [1, rgb_interm_color[0]]];
    colorscale.push(interm_palette);

    //We want 4 different traces here
    for (let j = 0; j <= 3; j ++){
        var X = [];
        var Y = [];
        var Z = [];
        var text = [];
        var color = [];
        title='';

        for (let point in values_layer1){
            if (j === 0 
                && values_layer2[point] <= VAL_MIN
                && values_layer1[point] <= VAL_MIN){

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);
                if(quali_column_name != undefined){
                    text.push(PARSED_RESULTS[point][quali_column_name]);
                    if(quali_column_name2 != undefined){
                        Z.push(PARSED_RESULTS[point][quali_column_name2]);
                    }
                }
                color.push(VAL_MIN);
                title = 'LC ' + j + ' = ' + ' No layer detected\n';
            }

            //Looking at the values which contain only L1
            else if (j === 1
                && values_layer2[point] <= VAL_MIN
                && values_layer1[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);
                if(quali_column_name != undefined){
                    text.push(PARSED_RESULTS[point][quali_column_name]);
                    if(quali_column_name2 != undefined){
                        Z.push(PARSED_RESULTS[point][quali_column_name2]);
                    }
                }
                color.push(PARSED_RESULTS[point][quanti_column_name1]);
                title = 'LC ' + j + ' = Only '+quanti_column_name1+'\n';
            }

            //Looking at the values which contain only L2
            else if (j === 2
                && values_layer1[point] <= VAL_MIN
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
                title = 'LC ' + j + ' = Only '+quanti_column_name2+'\n';
            }

            //Looking at the values which contain both L1 and L2
            else if(j === 3
                && values_layer1[point] > VAL_MIN 
                && values_layer2[point] > VAL_MIN){

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
                title = 'LC ' + j + ' = ' +quanti_column_name1+' + '+quanti_column_name2+'\n';
            }
        }

        if(quali_column_name != undefined){
            if(quali_column_name2 === undefined){
                //Add a trace
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
            else {
                //Add a trace
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