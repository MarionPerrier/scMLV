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
 *  - Find an other name for "j" var line 132
 *  - div 'control_text', 'control_for_number_layers', 'control_for_x' and 'control_for_y'
 *    should be under the control of one unique div (to hide/display more easily)
 */

/** 
 * Reads the csv or tsv file provided by the user.
 * Cleans the interface by removing all existing lists and plots
 * Then collects a file (FILE) and launches the parse function 
**/
function reading_tsv_file(){

    //Cleaning already existing lists
    clearLists();
    clearLegend();

    //Removes a plot if already existing
    if(IS_CREATED){
        Plotly.purge(document.getElementById('graphic'));
        IS_CREATED = false;
    }

    //Deletes all selective lists (number of layers) already displayed if there is an other file given
    document.getElementById('layer_number_selection').innerHTML = "";

    document.getElementById('control_text').hidden = true;
    document.getElementById('explanatory_text').hidden = true;
    document.getElementById('control_for_number_layers').hidden = true;
    document.getElementById('control_for_x').hidden = true;
    document.getElementById('control_for_y').hidden = true;

    document.getElementById('x_axis_selection').innerHTML = "";
    document.getElementById('y_axis_selection').innerHTML = "";

    FILE = document.getElementById('tsv_file').files[0];
    //file name added to html
    document.getElementById('tsv-file-name').innerHTML = FILE.name;

    parse_csv_to_json();
}

/**
 * Parses a csv file into an array of object (JSON).
 * This function is called after a new file is provided
 * or after a resampling (done or undone).
 * 
 *  -> In case of a new file : 
 * The file is parsed normally. The header is collected
 * and each line of the file is stored into an object.
 * The framework of parsing called : Papaparse
 * 
 *  -> In case of resampling :
 * All buttons are disabled (to avoid any bugs 
 * if the user clicks everywhere).
 * Checks the number of total lines in the file, and by a
 * rule of three determines how many line to skip and to take
 * for the resampling.
 */
function parse_csv_to_json(){

    //Parsed_results needs to be reset if already existing.
    PARSED_RESULTS = [];
    TAB_LENGTH = -1;

    //Disables all buttons when a resampling or when a 'un'resampling is asked
    if (IS_CREATED) {
        if (document.getElementById('x_axis_select_id') 
            || document.getElementById('y_axis_select_id')) {
            document.getElementById('x_axis_select_id').setAttribute('disabled', '');
            document.getElementById('y_axis_select_id').setAttribute('disabled', '');
            document.getElementById('numberOfLayers').setAttribute('disabled', '');

            for(let j = 0; j <= 5; j++){
                if(document.getElementById(`selectLayer${j}`) != null){
                    document.getElementById(`selectLayer${j}`).setAttribute('disabled', '');
                }
            }
        }
    }

    //if there is no need to resample, then parse the file normally
    if (RESAMPLE_SIZE === undefined) {
        Papa.parse(FILE, {
            //The first line constitutes the header.
            //all the other ones are data to insert.
            header: true,
            step: function(line) {

                if (IS_FIRST_TIME) {
                    HEADER=line.meta.fields;
                    IS_FIRST_TIME = false;
                }
                PARSED_RESULTS.push(line.data);
            },
            complete: function() {
                TAB_LENGTH = PARSED_RESULTS.length -1;
                if (IS_CREATED){
                    //The last line is empty, and we want to remove it.
                    PARSED_RESULTS.pop();
                    check_both();
                }
                else {
                    //The last line is empty, and we want to remove it.
                    PARSED_RESULTS.pop();
                    select_number_Layers();
                    axes_name_diplay();
                }

                IS_FIRST_TIME = true;
            }
        });
    }

    //if there is a resample needed, then only read the number of lines asked.
    else {
        //First parse to know the number of lines
        let total_number_lines = 0;

        Papa.parse(FILE, {
            header: true,
            step: function(line) {
                total_number_lines++;
            },
            complete: function() {
                //If the resample size asked is bigger than the total number of lines, then parse it normaly
                if (RESAMPLE_SIZE >= total_number_lines) {
                    alert('The number given is bigger than the number of cells !');
                    document.getElementById('resampling').checked = false;

                    RESAMPLE_SIZE = undefined;
                    parse_csv_to_json();
                    return;
                }

                //Rule of three to know how many lines to skip (ex : I want to keep 1 line every 10 lines)
                var lines_to_skip = Math.round(total_number_lines/RESAMPLE_SIZE);

                let j = 0;
                Papa.parse(FILE, {
                    header: true,
                    step: function(line) 
                    {
                        //Header is saved
                        if (IS_FIRST_TIME) {
                            HEADER=line.meta.fields;
                            IS_FIRST_TIME = false;
                        }

                        //add wanted lines into parsed_results
                        if (j === lines_to_skip -1 ) {
                            PARSED_RESULTS.push(line.data);
                            j = -1;
                        }
                        j++;
                    },
                    complete: function () {
                        TAB_LENGTH = PARSED_RESULTS.length -1;
                        if (IS_CREATED){
                            //The last line is empty, and we want to remove it.
                            PARSED_RESULTS.pop();
                            check_both();
                        }
                        else {
                            //The last line is empty, and we want to remove it.
                            PARSED_RESULTS.pop();
                            select_number_Layers();
                            axes_name_diplay();
                        }

                        IS_FIRST_TIME = true;
                    }
                });
            }
        });
    }
}

/**
 * Reads an image file given by the user
 */
function reading_img_file () {
    const input_file = document.getElementById("image_file").files[0];

    //file name add to html
    document.getElementById('img-file-name').innerHTML = input_file.name;

    //Warning
    alert("This function is not implemented yet !\n Sorry.");
}
