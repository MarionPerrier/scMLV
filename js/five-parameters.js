 /**
 * Main function of the five-parameters mode.
 * Will determine how many quantitative and qualitative values were asked, and
 * then draws the plot.
 * 
 * First case : Five quantitative parameters
 * 
 * Second case : One qualitative and four quantitative parameters
 * (Transparency variation sliders, the color of each point depend
 * on the quantitative data : colorscale).
 * 
 * Third case : Two qualitative and three quantitative parameters.
 * (Variation on two colorscales, one for each value).
*/
function five_parameters () {

    //Reset legend if already existing
    clearLegend();

    list_number = [];

    if(check_all_select_filled(5)){

        for(let j = 1; j<=5; j++){
            list_number.push(document.getElementById(`selectLayer${j}`).value);
        }
        //Look for how many quantitative values are given
        n_quantitative = is_quantitative(list_number);

        switch(n_quantitative){
            //If 5 quantitative values
            case 5 :
                five_quanti();
            break;

            //If 4 quantitative values and 1 qualitative value
            case 4 : 
                four_quanti_one_quali();
            break;

            //If 3 quantitative values quand 2 qualitative values
            case 3 :
                three_quanti_two_quali();
            break;

            //Otherwise, throw an error and reset the app (the reset is not implemented yet)
            default:
                console.log("Sorry, not implemented yet");
            break;
        }
    }
}

/**
 * Handles data if there is five quantitative colums selected.
 * There will be four colors selected : 
 *      - One for the layer 1
 *      - One for the layer 2
 *      - One for the layer 3
 *      - One for the layer 4
 *      - One for the layer 5
 * A quantitative colorscale will be calculated for the points with a positive value for :
 *      - Both layers 1 and 2
 *      - Both layers 1 and 3
 *      - Both layers 1 and 4
 *      - Both layers 1 and 5
 *      - Both layers 2 and 3
 *      - Both layers 2 and 4
 *      - Both layers 2 and 5
 *      - Both layers 3 and 4
 *      - Both layers 3 and 5
 *      - Both layers 4 and 5
 *      - Layers 1, 2 and 3
 *      - Layers 1, 2 and 4
 *      - Layers 1, 2 and 5
 *      - Layers 1, 3 and 4
 *      - Layers 1, 3 and 5
 *      - Layers 1, 4 and 5
 *      - Layers 2, 3 and 4
 *      - Layers 2, 3 and 5
 *      - Layers 2, 4 and 5
 *      - Layers 3, 4 and 5
 *      - Layers 1, 2, 3, 4
 *      - Layers 1, 2, 3, 5
 *      - Layers 1, 2, 4, 5
 *      - Layers 1, 3, 4, 5
 *      - Layers 2, 3, 4, 5
 *      
 * And all the layers combined 1, 2, 3, 4 and 5 (the points will appears black if so.)
 */
function five_quanti () {
    //Makes the color pickers appear
    for (let j = 1; j <= 5; j++) {
        document.getElementById(`control_color_${j}`).removeAttribute('hidden');
    }

    //First step : Separate points into traces
    let values_layer1 = [];
    let values_layer2 = [];
    let values_layer3 = [];
    let values_layer4 = [];
    let values_layer5 = [];

    quanti_column_name1 = document.getElementById('selectLayer1').value;
    quanti_column_name2 = document.getElementById('selectLayer2').value;
    quanti_column_name3 = document.getElementById('selectLayer3').value;
    quanti_column_name4 = document.getElementById('selectLayer4').value;
    quanti_column_name5 = document.getElementById('selectLayer5').value;

    //Second step : Retrieve the list of quantitative values
    for(let j = 0; j < TAB_LENGTH; j++){
        values_layer1.push(parseFloat(PARSED_RESULTS[j][quanti_column_name1]));
        values_layer2.push(parseFloat(PARSED_RESULTS[j][quanti_column_name2]));
        values_layer3.push(parseFloat(PARSED_RESULTS[j][quanti_column_name3]));
        values_layer4.push(parseFloat(PARSED_RESULTS[j][quanti_column_name4]));
        values_layer5.push(parseFloat(PARSED_RESULTS[j][quanti_column_name5]));
    }

    var cmax1 = Math.max.apply(null, values_layer1);
    var cmax2 = Math.max.apply(null, values_layer2);
    var cmax3 = Math.max.apply(null, values_layer3);
    var cmax4 = Math.max.apply(null, values_layer4);
    var cmax5 = Math.max.apply(null, values_layer5);

    //Trace computing
    var data = [];

    //Determination of colorscales
    var colorscale = [[[0,'#e3e3e3'], [1,'#e3e3e3']]]; //The first colorscale (for all "0" values) is already set
    var color = [];
    var title;
    var legend = [];

    for(let j = 1; j <= 5; j++){
        color.push(document.getElementById(`color_layer_${j}`).value);
        colorscale.push(creating_palette_several_layers(hexToRgb(color[j-1])));
    }

    //Third palette related to two colors overlay
    rgb_interm_color = calculation_middle_color(color);

    for(let color_max in rgb_interm_color) {
        interm_palette = [[0, '#e3e3e3'], [1, rgb_interm_color[color_max]]];
        colorscale.push(interm_palette);
    }

    //Deletes last element in colorscale array
    colorscale.pop();
    //Add custom colorscale from white to black for a total overlay
    colorscale.push([[0, '#e3e3e3'], [1, '#000000']]);

    //We want 32 different traces here
    for (let j = 0; j <= 31; j++) {
        var X = [];
        var Y = [];
        var color = [];
        title = '';

        for(let point in values_layer1){
            if (j === 0
                && values_layer1[point] <= VAL_MIN
                && values_layer2[point] <= VAL_MIN
                && values_layer3[point] <= VAL_MIN
                && values_layer4[point] <= VAL_MIN
                && values_layer5[point] <= VAL_MIN){

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);
                color.push(VAL_MIN);
                title = j + ' = No layer detected';
            }

            //Looking at the values which contain only L1
            else if (j === 1
                && values_layer1[point] > VAL_MIN 
                && values_layer2[point] <= VAL_MIN
                && values_layer3[point] <= VAL_MIN
                && values_layer4[point] <= VAL_MIN
                && values_layer5[point] <= VAL_MIN){

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);
                color.push(PARSED_RESULTS[point][quanti_column_name1]);
                title = j + ' = Only '+quanti_column_name1;
            }

            //Looking at the values which contain only L2
            else if (j === 2
                && values_layer1[point] <= VAL_MIN
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] <= VAL_MIN
                && values_layer4[point] <= VAL_MIN
                && values_layer5[point] <= VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);
                color.push(PARSED_RESULTS[point][quanti_column_name2]);
                title = j + ' = Only '+quanti_column_name2;
            }

            //Looking at the values which contain only L3
            else if (j === 3
                && values_layer1[point] <= VAL_MIN
                && values_layer2[point] <= VAL_MIN
                && values_layer3[point] > VAL_MIN
                && values_layer4[point] <= VAL_MIN
                && values_layer5[point] <= VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);
                color.push(PARSED_RESULTS[point][quanti_column_name3]);
                title = j + ' = Only '+quanti_column_name3;
            }

            //Looking at the values which contain only L4
            else if (j === 4
                && values_layer1[point] <= VAL_MIN
                && values_layer2[point] <= VAL_MIN
                && values_layer3[point] <= VAL_MIN
                && values_layer4[point] > VAL_MIN
                && values_layer5[point] <= VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);
                color.push(PARSED_RESULTS[point][quanti_column_name4]);
                title = j + ' = Only '+quanti_column_name4;
            }

            //Looking at the values which contain only L5
            else if (j === 5
                && values_layer1[point] <= VAL_MIN
                && values_layer2[point] <= VAL_MIN
                && values_layer3[point] <= VAL_MIN
                && values_layer4[point] <= VAL_MIN
                && values_layer5[point] > VAL_MIN){

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);
                color.push(PARSED_RESULTS[point][quanti_column_name5]);
                title = j + ' = Only '+quanti_column_name5;               
            }

            //Looking at the values which contain L1 and L2
            else if (j === 6
                && values_layer1[point] > VAL_MIN
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] <= VAL_MIN
                && values_layer4[point] <= VAL_MIN
                && values_layer5[point] <= VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer1[point]*100)/cmax1;
                let exp_percent2 = (values_layer2[point]*100)/cmax2;
                let exp_percent = (exp_percent1+exp_percent2)/2;
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name1 +
                        ' + ' +
                        quanti_column_name2;
            }

            //Looking at the values which contain L1 and L3
            else if (j === 7
                && values_layer1[point] > VAL_MIN
                && values_layer2[point] <= VAL_MIN
                && values_layer3[point] > VAL_MIN
                && values_layer4[point] <= VAL_MIN
                && values_layer5[point] <= VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer1[point]*100)/cmax1;
                let exp_percent2 = (values_layer3[point]*100)/cmax3;
                let exp_percent = (exp_percent1+exp_percent2)/2;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name1 +
                        ' + ' +
                        quanti_column_name3;
            }

            //Looking at the values which contain L1 and L4
            else if (j === 8
                && values_layer1[point] > VAL_MIN
                && values_layer2[point] <= VAL_MIN
                && values_layer3[point] <= VAL_MIN
                && values_layer4[point] > VAL_MIN
                && values_layer5[point] <= VAL_MIN) {
                    
                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer1[point]*100)/cmax1;
                let exp_percent2 = (values_layer4[point]*100)/cmax4;
                let exp_percent = (exp_percent1+exp_percent2)/2;
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name1 +
                        ' + ' +
                        quanti_column_name4;
            }

            //Looking at the values which contain L1 and L5
            else if (j === 9
                && values_layer1[point] > VAL_MIN
                && values_layer2[point] <= VAL_MIN
                && values_layer3[point] <= VAL_MIN
                && values_layer4[point] <= VAL_MIN
                && values_layer5[point] > VAL_MIN) {
                    
                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer1[point]*100)/cmax1;
                let exp_percent2 = (values_layer5[point]*100)/cmax5;
                let exp_percent = (exp_percent1+exp_percent2)/2;
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name1 +
                        ' + ' +
                        quanti_column_name5;
            }

            //Looking at the values which contain L2 and L3
            else if (j === 10
                && values_layer1[point] <= VAL_MIN
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] > VAL_MIN
                && values_layer4[point] <= VAL_MIN
                && values_layer5[point] <= VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer2[point]*100)/cmax2;
                let exp_percent2 = (values_layer3[point]*100)/cmax3;
                let exp_percent = (exp_percent1+exp_percent2)/2;
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name2 +
                        ' + ' +
                        quanti_column_name3;
            }

            //Looking at the values which contain L2 and L4
            else if (j === 11
                && values_layer1[point] <= VAL_MIN
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] <= VAL_MIN
                && values_layer4[point] > VAL_MIN
                && values_layer5[point] <= VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer2[point]*100)/cmax2;
                let exp_percent2 = (values_layer4[point]*100)/cmax4;
                let exp_percent = (exp_percent1+exp_percent2)/2;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name2 +
                        ' + ' +
                        quanti_column_name4;
            }

            //Looking at the values which contain L2 and L5
            else if (j === 12
                && values_layer1[point] <= VAL_MIN
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] <= VAL_MIN
                && values_layer4[point] <= VAL_MIN
                && values_layer5[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer2[point]*100)/cmax2;
                let exp_percent2 = (values_layer5[point]*100)/cmax5;
                let exp_percent = (exp_percent1+exp_percent2)/2;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name2 +
                        ' + ' +
                        quanti_column_name5;
            }

            //Looking at the values which contain L3 and L4
            else if (j === 13
                && values_layer1[point] <= VAL_MIN
                && values_layer2[point] <= VAL_MIN
                && values_layer3[point] > VAL_MIN
                && values_layer4[point] > VAL_MIN
                && values_layer5[point] <= VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer3[point]*100)/cmax3;
                let exp_percent2 = (values_layer4[point]*100)/cmax4;
                let exp_percent = (exp_percent1+exp_percent2)/2;
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name3 +
                        ' + ' +
                        quanti_column_name4;
            }

            //Looking at the values which contain L3 and L5
            else if (j === 14
                && values_layer1[point] <= VAL_MIN
                && values_layer2[point] <= VAL_MIN
                && values_layer3[point] > VAL_MIN
                && values_layer4[point] <= VAL_MIN
                && values_layer5[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer3[point]*100)/cmax3;
                let exp_percent2 = (values_layer5[point]*100)/cmax5;
                let exp_percent = (exp_percent1+exp_percent2)/2;
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name3 +
                        ' + ' +
                        quanti_column_name5;
            }

            //Looking at the values which contain L4 and L5
            else if (j === 15
                && values_layer1[point] <= VAL_MIN
                && values_layer2[point] <= VAL_MIN
                && values_layer3[point] <= VAL_MIN
                && values_layer4[point] > VAL_MIN
                && values_layer5[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer4[point]*100)/cmax4;
                let exp_percent2 = (values_layer5[point]*100)/cmax5;
                let exp_percent = (exp_percent1+exp_percent2)/2;
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name4 +
                        ' + ' +
                        quanti_column_name5;     
            }

            //Looking at the values which contain L1, L2 and L3 together
            else if (j === 16
                && values_layer1[point] > VAL_MIN 
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] > VAL_MIN
                && values_layer4[point] <= VAL_MIN
                && values_layer5[point] <= VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer1[point]*100)/cmax1;
                let exp_percent2 = (values_layer2[point]*100)/cmax2;
                let exp_percent3 = (values_layer3[point]*100)/cmax3;
                let exp_percent = (exp_percent1+exp_percent2+exp_percent3)/3;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name1 +
                        ' + ' +
                        quanti_column_name2 +
                        ' + ' +
                        quanti_column_name3;
            }

            //Looking at the values which contain L1, L2 and L4 together
            else if (j === 17
                && values_layer1[point] > VAL_MIN
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] <= VAL_MIN
                && values_layer4[point] > VAL_MIN
                && values_layer5[point] <= VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer1[point]*100)/cmax1;
                let exp_percent2 = (values_layer2[point]*100)/cmax2;
                let exp_percent3 = (values_layer4[point]*100)/cmax4;
                let exp_percent = (exp_percent1+exp_percent2+exp_percent3)/3;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name1 +
                        ' + ' +
                        quanti_column_name2 +
                        ' + ' +
                        quanti_column_name4;
            }

            //Looking at the values which contain L1, L2 and L5 together
            else if (j === 18
                && values_layer1[point] > VAL_MIN
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] <= VAL_MIN
                && values_layer4[point] <= VAL_MIN
                && values_layer5[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer1[point]*100)/cmax1;
                let exp_percent2 = (values_layer2[point]*100)/cmax2;
                let exp_percent3 = (values_layer5[point]*100)/cmax5;
                let exp_percent = (exp_percent1+exp_percent2+exp_percent3)/3;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name1 +
                        ' + ' +
                        quanti_column_name2 +
                        ' + ' +
                        quanti_column_name5;
            }

            //Looking at the values which contain L1, L3 and L4 together
            else if (j === 19
                && values_layer1[point] > VAL_MIN
                && values_layer2[point] <= VAL_MIN
                && values_layer3[point] > VAL_MIN
                && values_layer4[point] > VAL_MIN
                && values_layer5[point] <= VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer1[point]*100)/cmax1;
                let exp_percent2 = (values_layer3[point]*100)/cmax3;
                let exp_percent3 = (values_layer4[point]*100)/cmax4;
                let exp_percent = (exp_percent1+exp_percent2+exp_percent3)/3;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name1 +
                        ' + ' +
                        quanti_column_name2 +
                        ' + ' +
                        quanti_column_name4;
            }

            //Looking at the values which contain L1, L3 and L5 together
            else if (j === 20
                && values_layer1[point] > VAL_MIN
                && values_layer2[point] <= VAL_MIN
                && values_layer3[point] > VAL_MIN
                && values_layer4[point] <= VAL_MIN
                && values_layer5[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer1[point]*100)/cmax1;
                let exp_percent2 = (values_layer3[point]*100)/cmax3;
                let exp_percent3 = (values_layer5[point]*100)/cmax5;
                let exp_percent = (exp_percent1+exp_percent2+exp_percent3)/3;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name1 +
                        ' + ' +
                        quanti_column_name3 +
                        ' + ' +
                        quanti_column_name5;
            }
            
            //Looking at the values which contain L1, L4 and L5 together
            else if (j === 21
                && values_layer1[point] > VAL_MIN
                && values_layer2[point] <= VAL_MIN
                && values_layer3[point] <= VAL_MIN
                && values_layer4[point] > VAL_MIN
                && values_layer5[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer1[point]*100)/cmax1;
                let exp_percent2 = (values_layer4[point]*100)/cmax4;
                let exp_percent3 = (values_layer5[point]*100)/cmax5;
                let exp_percent = (exp_percent1+exp_percent2+exp_percent3)/3;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name1 +
                        ' + ' +
                        quanti_column_name4 +
                        ' + ' +
                        quanti_column_name5;
            }

            //Looking at the values which contain L2, L3 and L4 together
            else if (j === 22
                && values_layer1[point] <= VAL_MIN
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] > VAL_MIN
                && values_layer4[point] > VAL_MIN
                && values_layer5[point] <= VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer2[point]*100)/cmax2;
                let exp_percent2 = (values_layer3[point]*100)/cmax3;
                let exp_percent3 = (values_layer4[point]*100)/cmax4;
                let exp_percent = (exp_percent1+exp_percent2+exp_percent3)/3;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name2 +
                        ' + ' +
                        quanti_column_name3 +
                        ' + ' +
                        quanti_column_name4;
            }

            //Looking at the values which contain L2, L3 and L5 together
            else if (j === 23
                && values_layer1[point] <= VAL_MIN
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] > VAL_MIN
                && values_layer4[point] <= VAL_MIN
                && values_layer5[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer2[point]*100)/cmax2;
                let exp_percent2 = (values_layer3[point]*100)/cmax3;
                let exp_percent3 = (values_layer4[point]*100)/cmax4;
                let exp_percent = (exp_percent1+exp_percent2+exp_percent3)/3;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name2 +
                        ' + ' +
                        quanti_column_name3 +
                        ' + ' +
                        quanti_column_name5;
            }

            //Looking at the values which contain L2, L4 and L5 together
            else if (j === 24
                && values_layer1[point] <= VAL_MIN
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] <= VAL_MIN
                && values_layer4[point] > VAL_MIN
                && values_layer5[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer2[point]*100)/cmax2;
                let exp_percent2 = (values_layer4[point]*100)/cmax4;
                let exp_percent3 = (values_layer5[point]*100)/cmax5;
                let exp_percent = (exp_percent1+exp_percent2+exp_percent3)/3;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name2 +
                        ' + ' +
                        quanti_column_name4 +
                        ' + ' +
                        quanti_column_name5;
            }

            //Looking at the values which contain L3, L4 and L5 together
            else if (j === 25
                && values_layer1[point] <= VAL_MIN
                && values_layer2[point] <= VAL_MIN
                && values_layer3[point] > VAL_MIN
                && values_layer4[point] > VAL_MIN
                && values_layer5[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer3[point]*100)/cmax3;
                let exp_percent2 = (values_layer4[point]*100)/cmax4;
                let exp_percent3 = (values_layer5[point]*100)/cmax5;
                let exp_percent = (exp_percent1+exp_percent2+exp_percent3)/3;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name3 +
                        ' + ' +
                        quanti_column_name4 +
                        ' + ' +
                        quanti_column_name5;
            }

            //Looking at the values which contain layers 1, 2, 3 and 4 together
            else if (j === 26
                && values_layer1[point] > VAL_MIN
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] > VAL_MIN
                && values_layer4[point] > VAL_MIN
                && values_layer5[point] <= VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer1[point]*100)/cmax1;
                let exp_percent2 = (values_layer2[point]*100)/cmax2;
                let exp_percent3 = (values_layer3[point]*100)/cmax3;
                let exp_percent4 = (values_layer4[point]*100)/cmax4;
                let exp_percent = (exp_percent1+exp_percent2+exp_percent3+exp_percent4)/4;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name1 +
                        ' + ' +
                        quanti_column_name2 +
                        ' + ' +
                        quanti_column_name3 +
                        ' + ' +
                        quanti_column_name4;
            }

            //Looking at the values which contain layers 1, 2, 3 and 5 together
            else if (j === 27
                && values_layer1[point] > VAL_MIN
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] > VAL_MIN
                && values_layer4[point] <= VAL_MIN
                && values_layer5[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer1[point]*100)/cmax1;
                let exp_percent2 = (values_layer2[point]*100)/cmax2;
                let exp_percent3 = (values_layer3[point]*100)/cmax3;
                let exp_percent4 = (values_layer5[point]*100)/cmax5;
                let exp_percent = (exp_percent1+exp_percent2+exp_percent3+exp_percent4)/4;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name1 +
                        ' + ' +
                        quanti_column_name2 +
                        ' + ' +
                        quanti_column_name3 +
                        ' + ' +
                        quanti_column_name5;
            }

            //Looking at the values which contain layers 1, 2, 4 and 5 together
            else if (j === 28
                && values_layer1[point] > VAL_MIN
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] <= VAL_MIN
                && values_layer4[point] > VAL_MIN
                && values_layer5[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer1[point]*100)/cmax1;
                let exp_percent2 = (values_layer2[point]*100)/cmax2;
                let exp_percent3 = (values_layer4[point]*100)/cmax4;
                let exp_percent4 = (values_layer5[point]*100)/cmax5;
                let exp_percent = (exp_percent1+exp_percent2+exp_percent3+exp_percent4)/4;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name1 +
                        ' + ' +
                        quanti_column_name2 +
                        ' + ' +
                        quanti_column_name4 +
                        ' + ' +
                        quanti_column_name5;
            }

            //Looking at the values which contain layers 1, 3, 4 and 5 together
            else if (j === 29
                && values_layer1[point] > VAL_MIN
                && values_layer2[point] <= VAL_MIN
                && values_layer3[point] > VAL_MIN
                && values_layer4[point] > VAL_MIN
                && values_layer5[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer1[point]*100)/cmax1;
                let exp_percent2 = (values_layer3[point]*100)/cmax3;
                let exp_percent3 = (values_layer4[point]*100)/cmax4;
                let exp_percent4 = (values_layer5[point]*100)/cmax5;
                let exp_percent = (exp_percent1+exp_percent2+exp_percent3+exp_percent4)/4;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name1 +
                        ' + ' +
                        quanti_column_name3 +
                        ' + ' +
                        quanti_column_name4 +
                        ' + ' +
                        quanti_column_name5;
            }

            //Looking at the values which contain layers 2, 3, 4 and 5 together
            else if (j === 30
                && values_layer1[point] <= VAL_MIN
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] > VAL_MIN
                && values_layer4[point] > VAL_MIN
                && values_layer5[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer2[point]*100)/cmax2;
                let exp_percent2 = (values_layer3[point]*100)/cmax3;
                let exp_percent3 = (values_layer4[point]*100)/cmax4;
                let exp_percent4 = (values_layer5[point]*100)/cmax5;
                let exp_percent = (exp_percent1+exp_percent2+exp_percent3+exp_percent4)/4;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name2 +
                        ' + ' +
                        quanti_column_name3 +
                        ' + ' +
                        quanti_column_name4 +
                        ' + ' +
                        quanti_column_name5;
            }

            //Looking at the values which contain all layers 1, 2, 3, 4 and 5 together
            else if (j === 31
                && values_layer1[point] > VAL_MIN
                && values_layer2[point] > VAL_MIN
                && values_layer3[point] > VAL_MIN
                && values_layer4[point] > VAL_MIN
                && values_layer5[point] > VAL_MIN) {

                X.push(PARSED_RESULTS[point][X_name]);
                Y.push(PARSED_RESULTS[point][Y_name]);

                //Percent of expression calculated
                let exp_percent1 = (values_layer1[point]*100)/cmax1;
                let exp_percent2 = (values_layer2[point]*100)/cmax2;
                let exp_percent3 = (values_layer3[point]*100)/cmax3;
                let exp_percent4 = (values_layer4[point]*100)/cmax4;
                let exp_percent5 = (values_layer5[point]*100)/cmax5;
                let exp_percent = (exp_percent1+exp_percent2+exp_percent3+exp_percent4+exp_percent5)/5;                     
                color.push(exp_percent);
                title = j + ' = ' + quanti_column_name1 +
                        ' + ' +
                        quanti_column_name2 +
                        ' + ' +
                        quanti_column_name3 +
                        ' + ' +
                        quanti_column_name4 +
                        ' + ' +
                        quanti_column_name5;
            }
        }

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
            name: j,
            type: 'scattergl',
            hoverinfo: 'none' //to hide labels on points
        });

        if(title != ''){
            legend.push(title);
        }
    }

    //Display the legend
    display_legend(legend);

    //update the graph
    Plotly.purge(GRAPHDIV);
    Plotly.react(GRAPHDIV, data, LAYOUT, {responsive: true});
}

/**
 * Handles data if there is four quantitative columns selected, and one qualitative column selected.
 * There will be four colors selected : 
 *      - One for layer 1
 *      - One for layer 2
 *      - One for layer 3
 *      - One for layer 4
 * And all their overlay (see four_parameters() description for more details).
 * The legend will be displayed for both quantitative and qualitative values
 * 
 * The plot will be entirely redrawn in the four_parameters() function.
 */
function four_quanti_one_quali () {
    var list_quanti = [];
    var list_quali;

    //Looking for the position of quantitative values
    for(let j = 1; j <= 5; j++){
        if(is_quantitative(j)){
            list_quanti.push(j);
        }
        else {
            list_quali = j;
        }
    }

    var color = [];
    /**
     * for each position of quantitative values,
     * the color of this value is added, the "color panel" is displayed
     * and the "checkbox panel" for qualitative value is hidden. 
     */
    for (let j in list_quanti) {
        //Retrieve values of the colors
        color.push(document.getElementById(`color_layer_${list_quanti[j]}`).value);

        //Display color pickers
        document.getElementById(`control_color_${list_quanti[j]}`).removeAttribute('hidden');

        //Hide unecessary buttons
        document.getElementById(`control_checkbox_${list_quanti[j]}`).setAttribute('hidden', '');
    }
    //Display checkbox for quali
    document.getElementById(`control_checkbox_${list_quali}`).removeAttribute('hidden');
    document.getElementById(`control_color_${list_quali}`).setAttribute('hidden', '');

    //Retrieve names of columns
    quanti_column_name1 = document.getElementById(`selectLayer${list_quanti[0]}`).value;
    quanti_column_name2 = document.getElementById(`selectLayer${list_quanti[1]}`).value;
    quanti_column_name3 = document.getElementById(`selectLayer${list_quanti[2]}`).value;
    quanti_column_name4 = document.getElementById(`selectLayer${list_quanti[3]}`).value;
    quali_column_name = document.getElementById(`selectLayer${list_quali}`).value;
    
    //As the same way that "four parameters" does
    four_quanti(color, 
        quanti_column_name1, 
        quanti_column_name2, 
        quanti_column_name3,
        quanti_column_name4, 
        quali_column_name);

    //Now handles qualitative value.
    //Display the legend : 
    add_legend_shapes(list_quali);
}

function three_quanti_two_quali () {
    //Determine the position of qualitative attributes
    var list_quali = [];
    var list_quanti = [];

    //For each button, activate or hide the colors/shape controls
    for(let j = 1; j <= 5; j++) {
        if(is_quantitative(j)){
            document.getElementById(`control_color_${j}`).removeAttribute('hidden');
            document.getElementById(`control_checkbox_${j}`).setAttribute('hidden', '');
            list_quanti.push(j);
        }
        else {
            document.getElementById(`control_color_${j}`).setAttribute('hidden', '');
            document.getElementById(`control_checkbox_${j}`).removeAttribute('hidden');
            list_quali.push(j);
        }
    }
    
    //Retrieve colors values
    color1 = document.getElementById(`color_layer_${list_quanti[0]}`).value;
    color2 = document.getElementById(`color_layer_${list_quanti[1]}`).value;
    color3 = document.getElementById(`color_layer_${list_quanti[2]}`).value;
    color = [color1, color2, color3];

    //Retrieve names of columns
    quanti_column_name1 = document.getElementById(`selectLayer${list_quanti[0]}`).value;
    quanti_column_name2 = document.getElementById(`selectLayer${list_quanti[1]}`).value;
    quanti_column_name3 = document.getElementById(`selectLayer${list_quanti[2]}`).value;
    quali_column_name1 = document.getElementById(`selectLayer${list_quali[0]}`).value;
    quali_column_name2 = document.getElementById(`selectLayer${list_quali[1]}`).value;

    three_quanti(color, quanti_column_name1, quanti_column_name2, quanti_column_name3, quali_column_name1, quali_column_name2);
    add_legend_shapes(list_quali);
}