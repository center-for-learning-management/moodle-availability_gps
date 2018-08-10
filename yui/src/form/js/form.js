M.availability_gps = M.availability_gps || {};

M.availability_gps.vals = [ 'accuracy', 'longitude', 'latitude', 'persistent', 'reveal', 'revealname'];

M.availability_gps.form = Y.Object(M.core_availability.plugin);

M.availability_gps.form.initInner = function(longitude, latitude, accuracy, persistent, reveal, revealname) {
    console.log('initInner: ', longitude, latitude, accuracy, persistent, reveal, revealname);
};

M.availability_gps.form.getNode = function(json) {
    var a, html, onclick, options, labels, root, selected, strings, url;
    // This function does the main work. It gets called after the user
    // chooses to add an availability restriction of this type. You have
    // to return a YUI node representing the HTML for the plugin controls.

    // Example controls contain only one tickbox.
    strings = M.str.availability_gps;
    for (a = 0; a < M.availability_gps.vals.length; a++) {
        if (!json[M.availability_gps.vals[a]]) {
            json[M.availability_gps.vals[a]] = 0;
        }
    }

    html = '<div class="availability_gps">';
    html += '<div>' + strings.notify_block + '</div>';
    html += '<input type="button" value="' + strings.selectfrommap + '" class="ui-btn btn" onclick="';
    html += '    availability_gps_helper.init(' + json.latitude + ',' + json.longitude + ');">';
    html += '<div>';
    html += '<label>' + strings.longitude + ' <input type="text" name="longitude" value="' + json.longitude + '"/></label>';
    html += '<label>' + strings.latitude + ' <input type="text" name="latitude" value="' + json.latitude + '"/></label>';
    html += '<label>' + strings.accuracy + ' <select name="accuracy">';
    options = [5, 10, 50, 100, 500, 1000];
    for (a = 0; a < options.length; a++) {
        selected = ((json.accuracy == options[a])?' selected':'');
        html += '   <option value="' + options[a] + '"' + selected + '>' + options[a] + ' ' + strings.meters + '</option>';
    }
    html += '</select></label>';
    html += '</div>';
    html += '<div>';
    html += '<label>' + strings.persistent + ' <select name="persistent">';
    options = [0, 1];
    labels = [strings.no, strings.yes];
    for (a = 0; a < options.length; a++) {
        selected = ((json.persistent == options[a])?' selected':'');
        html += '   <option value="' + options[a] + '"' + selected + '>' + labels[a] + '</option>';
    }
    html += '</select></label>';
    html += '<label>' + strings.reveal + '<select name="reveal">';
    options = [0, 1];
    labels = [strings.no, strings.yes];
    for (a = 0; a < options.length; a++) {
        selected = ((json.reveal == options[a])?' selected':'');
        html += '   <option value="' + options[a] + '"' + selected + '>' + labels[a] + '</option>';
    }
    html += '</select></label>';
    html += '<label>' + strings.revealname + '<select name="revealname">';
    options = [0, 1];
    labels = [strings.no, strings.yes];
    for (a = 0; a < options.length; a++) {
        selected = ((json.revealname == options[a])?' selected':'');
        html += '   <option value="' + options[a] + '"' + selected + '>' + labels[a] + '</option>';
    }
    html += '</select></label>';
    html += '</div>';
    html += '<div id="availability_gps_map_info" class="closed">';
    html += strings.selectfrommapdrag;
    html += '<input type="button" value="' + strings.current_location + '" onclick="availability_gps_helper.current();" class="ui-btn btn" />';
    html += '</div>';
    html += '<div id="availability_gps_map" class="closed" style="height: 440px; border: 1px solid #AAA;">';
    html += '</div>';
    html += '</div>';
    M.availability_gps.node = Y.Node.create(html);

    // Add event handlers (first time only). You can do this any way you
    // like, but this pattern is used by the existing code.
    if (!M.availability_gps.form.addedEvents) {
        M.availability_gps.form.addedEvents = true;
        root = Y.one('#fitem_id_availabilityconditionsjson');
        console.log('root #fitem_id_availabilityconditionsjson is', typeof root);
        if (typeof root == 'undefined') {
            root = Y.one('.availability_gps');
            console.log('root .availability_gps is', typeof root);
        }
        console.log('Delegating Actions on', root);
        if (root) {
            root.delegate('change', function() {
                console.log('UPDATING!!!');
                M.core_availability.form.update();
            }, '.availability_gps *');
        } else {
            console.error('Could not delegate change events for availability_gps');
        }
    }

    return M.availability_gps.node;
};

M.availability_gps.form.fillValue = function(value, node) {
    // This function gets passed the node (from above) and a value
    // object. Within that object, it must set up the correct values
    // to use within the JSON data in the form. Should be compatible
    // with the structure used in the __construct and save functions
    // within condition.php.
    var tmp, a;
    for(a = 0; a < M.availability_gps.vals.length; a++) {
        tmp = node.one('*[name=' + M.availability_gps.vals[a] + ']');
        console.log('Item for ', M.availability_gps.vals[a], tmp);
        if (tmp) {
            value[M.availability_gps.vals[a]] = tmp.get('value');
        }
    }
    console.log('Values to fill', value);
};
/*
M.availability_gps.form.fillErrors = function(errors, node) {
    var value = {};
    this.fillValue(value, node);
    if (false) {
        // Dummy entry here.
        errors.push('availability_gps:error_message');
    }
};
*/
