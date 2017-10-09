// variables
var settings;
var columnNames;

// returns the column heading as HTML content (icon or title)
function getColumnHeadingContent( iconArray, columnName, columnTitle ){

    for(var i = 0; i < iconArray.length; i++){
        if(iconArray[i][0] == columnName){
            return "<i class='fa fa-" + iconArray[i][1] + "'></i>";
        }
    }
    return columnTitle;
}

// returns an array with the indexes of the columns that are marked as not sortable in the settings
function getDisabledSortingColumnIndexesArray( columnNames, disabledColumnNames ){

    var indexesArray = [];
    for(var i = 0; i < columnNames.length; i++){
        for(var j = 0; j < disabledColumnNames.length; j++){
            if(disabledColumnNames[j] == columnNames[i]){
                indexesArray.push( i );
            }
        }
    }
    return indexesArray;
}

// returns the description for a specific code if found, otherwise the code itself
function getCodeDescription(columnName, code, codesCollection){
    
    for(var i = 0; i < codesCollection.length; i++){
        if(codesCollection[i].columnName === columnName){
            var mappings = codesCollection[i].mappings;
            for(var j = 0; j < mappings.length; j++){
                if(code === mappings[j][0]){
                    return mappings[j][1];
                }
            }
            break;
        }
    }
    return code;
}

// returns a formatted text for the column title
function getColumnTitle(columnName){

    var words = columnName.split( '_' );
    for(var i = 0; i < words.length; i++) {
        words[i] = words[i].charAt( 0 ).toUpperCase() + words[i].slice( 1 );
        words[i] = words[i].replace( 'Id', 'ID' ).replace( 'Url', 'URL' );
    }
    return words.join( ' ' );
}

// makes changes inside the HTML table to display info about the remote call
function displayCallMessage(row, status, iconCode, cssClass, message){

    row.find( ".spinner" ).hide();
    row.find( ".actions" ).append( "<span class='" + cssClass + 
        "'><i class='fa fa-" + iconCode + "'></i> " + message + "!</span>" );

    setTimeout(function () {
        row.find( ".actions ." + cssClass ).remove();
        row.find( ".actions a" ).html(status == 1 ? "Enable" : "Disable" );
        row.find( ".actions a" ).show();            
    }, 1500);
}

// adds css classes to the columns marked as hidden in the settings
function addCssHiddenClasses(){

    $(settings.columns.hiddenXl).each(function(){
        $( "." + this).addClass( "hidden-xl" );
    });
    $(settings.columns.hiddenL).each(function(){
        $( "." + this).addClass( "hidden-l" );
    });
    $(settings.columns.hiddenM).each(function(){
        $( "." + this).addClass( "hidden-m" );
    });
    $(settings.columns.hiddenS).each(function(){
        $( "." + this).addClass( "hidden-s" );
    });
}

// gets the value of a given query string parameter
function getQueryStringParameterByName(name, url) {

    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function loadSettings(){
    var defaultSettingsFileName = "settings.json";
    var settingsFileName = defaultSettingsFileName;
    var param = getQueryStringParameterByName( "settings", $(location).attr('href') );

    if(param){
        settingsFileName = param + ".json";

        $.ajax({
            type: "GET",
            url: "/settings/" + settingsFileName,
            dataType: "json",
            success: function(json) { settings = json; },
            async: false
        });
    }
    
    if(!settings){     
        $.ajax({
            type: "GET",
            url: "/settings/" + defaultSettingsFileName,
            dataType: "json",
            success: function(json) { settings = json; },
            async: false
        });
    }
}

// makes the remote call when the user enables or disables a specific listing
function toggleStatus(rowId, externalId){

    var row = $( '#row-' + rowId );
    row.find( '.spinner' ).show();
    row.find( '.actions a' ).hide();
    row.removeClass( 'selected' );

    $.ajax({
        url: ' https://jsonplaceholder.typicode.com/posts/' + externalId ,
        method: 'PATCH',
        crossDomain: true,
        data:{
            'is_enabled'     : status
        },    
        beforeSend: function ( xhr ) {
            xhr.setRequestHeader( 'Authorization', 'Basic ' + btoa( "username:password" ) );
        },
        success: function( data, txtStatus, xhr ) {
            var isEnabledColumnIndex = columnNames.indexOf( "is_enabled" );
            var isEnabledCol = $( row.find( "td" )[isEnabledColumnIndex] );
            var status = isEnabledCol.data( "order" );
            if(status == 1){
                row.addClass( "disabled" );
            }
            else{
                row.removeClass( "disabled" );
            }
            isEnabledCol.data( "order", (status == 1 ? "0" : "1" ));
            isEnabledCol.html( "<i class='fa fa-" 
                + (status == 1 ? settings.falseValueIconCode : settings.trueValueIconCode) 
                + "'></a>" );

            displayCallMessage(row, status, settings.trueValueIconCode, "success-msg", "Success" );

        },
        error: function(txtStatus, errorThrown){
            displayCallMessage(row, status, settings.errorValueIconCode, "error-msg", "Error" );
        }
    });
}

// when dom is loaded
$( document ).ready(function() {

    loadSettings();

    $.get( "http://gustavoquevedo.com/assessments/airbnb/csv/listings.csv", function(data) {

        // start the table	
        var html = "";

        // split into rows
        var rows = data.split( "\n" );
            
        // split into columns
        columnNames = rows[0].split( "," );

        //add actions column
        columnNames.push( "actions" );

        var columnTitles = [];
        var headings = "";
        var columnHeadingHtml = "";
        for(var i = 0; i < columnNames.length; i++){			
            columnNames[i] = columnNames[i].trim();
            columnTitles.push(getColumnTitle(columnNames[i]));
            headings += "<th class='" + columnNames[i] + "' title='" + columnTitles[i] + "'>" +
                getColumnHeadingContent(settings.columns.icons, columnNames[i], columnTitles[i]) + "</th>";
        }
        var idColumnIndex = 0;//columnNames.indexOf( "# id" );
        var isEnabledColumnIndex = columnNames.indexOf( "is_enabled" );
        var actionsColumnIndex = columnNames.indexOf( "actions" );
        
        var listingEnabled = true;

        var emptyHeadings = "";
        for(var i = 0; i < columnNames.length; i++){
            emptyHeadings += "<th class='" + columnNames[i] + "'></th>";
        }
        html += "<thead><tr class='filter-row'>" + emptyHeadings + "</tr>";
        html += "<tr>" + headings + "</tr></thead>";
        html += "<tfoot><tr>" + emptyHeadings + "</tr></tfoot>";

        rows.splice(0,1);

        html += "<tbody>";
        
        var dataOrder = "";
        var value = "";

        // parse lines
        rows.forEach( function getvalues(row) {

            // split line into columns
            var dataColumns = row.split( "," );

            //avoid wrong rows
            if(dataColumns.length > 1)	{

                listingEnabled = dataColumns[isEnabledColumnIndex] == "1";
                // start a table row
                html += "<tr id='row-" + dataColumns[idColumnIndex] 
                    + (listingEnabled ? "'>" : "' class='disabled'>" );
            
                for(var i = 0; i < dataColumns.length; i++){

                    dataOrder = "";
                    value = getCodeDescription(columnNames[i], dataColumns[i].trim(), settings.columns.codes);

                    if(value === "" || value === "NULL" ){

                        //null or empty values
                        value = "<span class='null-value'>" + value + "</span>";
                    }
                    else if(settings.columns.date.indexOf(columnNames[i]) >= 0){

                        //date columns
                        dataOrder = value;
                        value = $.format.date(value, "dd/MM/yyyy HH:mm:ss" );
                    }
                    else if(settings.columns.boolean.indexOf(columnNames[i]) >= 0){

                        //boolean columns
                        dataOrder = value;
                        value = "<i class='fa fa-" + (value == 1 ? settings.trueValueIconCode : settings.falseValueIconCode) + "'></a>";
                    }
                    else if(settings.columns.image.indexOf(columnNames[i]) >= 0){

                        //image columns
                        if(settings.useSampleResources){

                            //sample image
                            value = settings.samples.imageUrl;
                        }
                        value = "<a href=" + value + " data-fancybox data-caption='" + dataColumns[0] + ": " + value +"'>Preview</a>";
                    }
                    else if(settings.columns.content.indexOf(columnNames[i]) >= 0){

                        //external content columns
                        switch(columnNames[i]){

                            case "airbnb_listing_id": 
                                value = "<a href='https://www.airbnb.ie/rooms/" + 
                                    (settings.useSampleResources ? 
                                        settings.samples.listingId : value) + 
                                    "' target='_blank'>" + value +" <i class='fa fa-external-link'></a></i>";
                                break;
                            case "file_name":
                                if(settings.useSampleResources){
                                    value = "<a href='" + settings.samples.xmlUrl + 
                                        "' target='_blank'><i class='fa fa-external-link'></a></i>"
                                }
                                break;
                        }
                            
                    }
                    html += "<td class='" + columnNames[i] + "' title='" + columnTitles[i] + "'" 
                        + (dataOrder !== '' ? "data-order='" + dataOrder + "'" : "" ) + ">" + value + "</td>";                
                }

                html += "<td class='actions' title='Actions'>"+
                    "<a href='javascript:toggleStatus( " + dataColumns[idColumnIndex] + ", " + 
                    (settings.useSampleResources ? "1" : dataColumns[idColumnIndex]) + " )'>" + 
                    (listingEnabled ? "Disable" : "Enable" ) + 
                    "</a> <img class='spinner' src='images/spinner.gif' title='Loading...' /></td>";

                // close row
                html += "</tr>";		
            }
        });

        html += "</tbody>";

        // insert into div
        $( "#data" ).html(html);
                
        addCssHiddenClasses();
        
        var table = $( "#data" ).DataTable({
            aoColumnDefs: [
                    { 'bSortable': false, 'aTargets': getDisabledSortingColumnIndexesArray(columnNames, settings.columns.disabledSorting) }
                ],

            initComplete: function () {
                var columnIndex = 0;
                this.api().columns().every( function () {
                    var column = this;

                    if( settings.columns.selectFilter.indexOf(columnNames[columnIndex]) >= 0){
                        
                        var select = $( "<select><option value=''></option></select>" )
                            .prependTo( $($( ".filter-row th" )[$(column)[0][0]]).empty() )
                            .on( "change", function () {
                                var val = $.fn.dataTable.util.escapeRegex(
                                    $(this).val()
                                );
        
                                column
                                    .search( val ? "^"+val+"$" : "", true, false )
                                    .draw();
                            } );
        
                        column.data().unique().sort().each( function ( d, j ) {
                            select.append( "<option value='"+d+"'>"+d+"</option>" )
                        } );
                    }
                    else if( settings.columns.boolean.indexOf(columnNames[columnIndex]) >= 0){
                        
                        var select = $( "<select><option value=''></option></select>" )
                            .prependTo( $($( ".filter-row th" )[$(column)[0][0]]).empty() )
                            .on( "change", function () {
                                var val = $.fn.dataTable.util.escapeRegex(
                                    $(this).val()
                                );
                                var regex = "";
                                if(val === "0" ){
                                    regex = "^.+"+settings.falseValueIconCode+".+$";
                                }
                                else if(val === "1" ){
                                    regex = "^.+"+settings.trueValueIconCode+".+$";
                                }
                                column
                                    .search( regex, true, false )
                                    .draw();
                            } );
                        select.append( "<option value='1'>True</option>" );
                        select.append( "<option value='0'>False</option>" );
                    }
                    columnIndex++;
                } );
            }
        });

        // mark row as selected on click
        $( "#data tbody" ).on( "click", "tr", function () {
            if ( $(this).hasClass( "selected" ) ) {
                $(this).removeClass( "selected" );
            }
            else {
                table.$( "tr.selected" ).removeClass( "selected" );
                $(this).addClass( "selected" );
            }
        } );    
    });

});

