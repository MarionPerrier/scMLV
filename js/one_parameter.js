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
 * Check for qualitative or quantitative value.
 *
 * -> If quantitative value : Display points on a color scale pre-defined
 * -> If qualitative value : Display a slider to control opacity of each point.
 *  
 * @param {number} list_number The select button id. 
 * @param {number} text_id The button id of the first qualitative variable
 * @param {number} z_id The button id of the second qualitative variable 
 */
function one_parameter(list_number, text_id = undefined, z_id = undefined){
    let quantitatives_values = [];
    let column_name = document.getElementById(`selectLayer${list_number}`).value;

    //if it's true : Then will computes color values 
    //for each point based on a pre-defined color palette
    if(is_quantitative(list_number)){

        document.getElementById(`control_color_${list_number}`).removeAttribute('hidden');

        //Let's set two traces : The one where values are equals to the minimal value, and the other.
        for(let j = 0; j < TAB_LENGTH; j++){
            quantitatives_values.push(parseFloat(PARSED_RESULTS[j][column_name]));
        }

        //Trace computing
        var data = [];
        var palette = [[[0,'#e3e3e3'],[1,'#e3e3e3']]];

        //Get the color palette
        color = document.getElementById(`color_layer_${list_number}`).value;
        palette.push(creating_palette_one_layer(hexToRgb(color)));

        if(text_id != undefined){
            text_name = document.getElementById(`selectLayer${text_id}`).value;
            Z_name = document.getElementById(`selectLayer${z_id}`).value;
        }

        //We want two traces here
        for (let j = 0; j <= 1; j++){
            var X = [];
            var Y = [];
            var Z = [];
            var text = [];
            var color = [];

            for (let point in quantitatives_values){
                if(j === 0 
                    && quantitatives_values[point] <= VAL_MIN){
                    
                    X.push(PARSED_RESULTS[point][X_name]);
                    Y.push(PARSED_RESULTS[point][Y_name]);
                    color.push(VAL_MIN);
                    if(document.getElementById('numberOfLayers').value == 3){
                        text.push(PARSED_RESULTS[point][text_name]);
                        Z.push(PARSED_RESULTS[point][Z_name]);
                    }
                }
                else if(j === 1
                    && quantitatives_values[point] > VAL_MIN){

                    X.push(PARSED_RESULTS[point][X_name]);
                    Y.push(PARSED_RESULTS[point][Y_name]);
                    color.push(PARSED_RESULTS[point][column_name]);
                    if(document.getElementById('numberOfLayers').value == 3){
                        text.push(PARSED_RESULTS[point][text_name]);
                        Z.push(PARSED_RESULTS[point][Z_name]);
                    }
                }
            }

            //Add a trace
            if(document.getElementById('numberOfLayers').value == 3){
                data.push({
                    x: X,
                    y: Y,
                    z: Z,
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
            else {
                data.push({
                    x: X,
                    y: Y,
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
        }
        
        //update the graph
        Plotly.purge(GRAPHDIV);
        Plotly.react(GRAPHDIV, data, layout=LAYOUT,{showlegend: false},
            config={responsive: true});
    }
    else {
        //It's a qualitative value
        //retrieve the column name
        quali_column_name = document.getElementById('selectLayer1').value;

        //Bring up the checkbox for legend
        document.getElementById('control_color_1').setAttribute('hidden', '');
        document.getElementById('control_checkbox_1').removeAttribute('hidden');
        
        //Add text values to each point
        let data = [];
        let text = [];
        let X = [];
        let Y = [];
        for (let j = 0; j < TAB_LENGTH; j++){
            text.push(PARSED_RESULTS[j][quali_column_name]);
            X.push(PARSED_RESULTS[j][X_name]);
            Y.push(PARSED_RESULTS[j][Y_name]);
        }

        data.push({
            x: X,
            y: Y,
            text: text,
            mode: 'markers',
            marker: {
                size: DOT_SIZE
            },
            type: 'scattergl',
            hoverinfo: 'none' //To hide labels on points
        });

        //Update graph : 
        Plotly.purge(GRAPHDIV);
        Plotly.react(GRAPHDIV, data, LAYOUT, {responsive: true});

        //We need to bring up the legend
        add_legend_shapes(1);
    }
}