M.availability_gps = M.availability_gps || {};

M.availability_gps.vals = [ 'accuracy', 'longitude', 'latitude', 'persistent', 'reveal', 'revealname'];

M.availability_gps.form = Y.Object(M.core_availability.plugin);

M.availability_gps.form.initInner = function(longitude, latitude, accuracy, persistent, reveal, revealname) {
    console.log('initInner: ', longitude, latitude, accuracy, persistent, reveal, revealname);
    require(['core/url'], function(url) {
        var l1, l2;
        l1 = document.createElement('link');
        l1.href = url.relativeUrl('/blocks/gps/css/leaflet.css');
        l1.type = "text/css";
        l1.rel = "stylesheet";
        l1.media = "screen,print";

        l2 = document.createElement('link');
        l2.href = url.relativeUrl('/blocks/gps/css/main.css');
        l2.type = "text/css";
        l2.rel = "stylesheet";
        l2.media = "screen,print";

        document.getElementsByTagName( "head" )[0].appendChild( l1 );
        document.getElementsByTagName( "head" )[0].appendChild( l2 );
    });
};

M.availability_gps.form.getNode = function(json) {
    var a, html, options, labels, selected, strings;
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
    html += '    require([\'block_gps/geoassist\'], function(helper) {';
    html += '        helper.init(' + json.latitude + ',' + json.longitude + ');';
    html += '    });">';
    html += '<div>';
    html += '<label>' + strings.latitude + ' <input type="text" name="latitude" value="' + json.latitude + '"/></label>';
    html += '<label>' + strings.longitude + ' <input type="text" name="longitude" value="' + json.longitude + '"/></label>';
    html += '<label>' + strings.accuracy + ' <select name="accuracy">';
    var options = [5, 10, 50, 100, 500, 1000, 5000, 10000, 20000];
    var sm = ' ' + strings.meters;
    var sk = ' ' + strings.kilometers;
    var captions = ['5'+sm, '10'+sm, '50'+sm, '100'+sm, '500'+sm, '1'+sk, '5'+sk, '10'+sk, '20'+sk];
    for (a = 0; a < options.length; a++) {
        selected = ((json.accuracy == options[a])?' selected':'');
        html += '   <option value="' + options[a] + '"' + selected + '>' + captions[a] + '</option>';
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
    html += '<input type="button" value="' + strings.current_location + '" onclick="';
    html += '    require([\'block_gps/geoassist\'], function(helper) {';
    html += '        helper.current(this);';
    html += '    });"';
    html += '    class="ui-btn btn" />';
    html += '</div>';
    html += '<div id="availability_gps_map" class="closed" style="height: 440px; border: 1px solid #AAA;">';
    html += '</div>';
    html += '</div>';
    M.availability_gps.node = Y.Node.create(html);

    if (!M.availability_gps.form.addedEvents) {
        M.availability_gps.form.addedEvents = true;
        M.availability_gps.node.delegate('change', function() {
            M.core_availability.form.update();
        }, '*[name]');
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
        if (tmp) {
            value[M.availability_gps.vals[a]] = tmp.get('value');
        }
    }
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
