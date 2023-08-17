M.availability_gps = M.availability_gps || {};

M.availability_gps.vals = [ 'accuracy', 'longitude', 'latitude', 'persistent', 'reveal', 'revealname'];

M.availability_gps.form = Y.Object(M.core_availability.plugin);

M.availability_gps.form.initInner = function(longitude, latitude, accuracy, persistent, reveal, revealname) {
    /* eslint-disable no-console */
    console.log('initInner: ', longitude, latitude, accuracy, persistent, reveal, revealname);
    /* eslint-enable no-console */
    this.nodesSoFar = 0;
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

    var requiremap = 'require([\'block_gps/conditionassistant\'], function(helper) { helper.init(true);});';
    var requirehelper = 'require([\'block_gps/conditionassistant\'], function(helper) { helper.current(this); });';

    var checkedpersistent = (json.persistent == 1) ? ' checked="checked"' : '';
    var checkedreveal = (json.reveal == 1) ? ' checked="checked"' : '';
    var checkedrevealname = (json.revealname == 1) ? ' checked="checked"' : '';

    this.nodesSoFar++;
    html = [];
    html.push('<div class="availability_gps">');
    html.push('    <div class="alert alert-info">' + strings.notify_block + '</div>');
    html.push('    <div class="row">');
    html.push('        <div class="col-md-2">');
    html.push('            <a href="#" onclick="' + requiremap + '; return false;"
              class="btn btn-secondary" style="text-align: center;">');
    html.push('                <i class="fa fa-map" style="font-size: 30px; vertical-align: middle;"></i><br />');
    html.push(                 strings.selectfrommap);
    html.push('            </a>');
    html.push('        </div>');
    html.push('        <div class="col-md-5" style="display: flex;">');
    html.push('            <table>');
    html.push('                <tr>');
    html.push('                    <td>' + strings.latitude + '</td>');
    html.push('                    <td><input type="text" name="latitude" value="' + json.latitude + '"
              size="18" style="width: 100%; max-width: 160px;"/></td>');
    html.push('                </tr>');
    html.push('                <tr>');
    html.push('                    <td>' + strings.longitude + '</td>');
    html.push('                    <td><input type="text" name="longitude" value="' + json.longitude + '" 
              size="18" style="width: 100%; max-width: 160px;"/></td>');
    html.push('                </tr>');
    html.push('                <tr>');
    html.push('                    <td>' + strings.accuracy + '</td>');
    html.push('                    <td><select name="accuracy" style="width: 100%; max-width: 160px;">');
    var options = [5, 10, 50, 100, 500, 1000, 5000, 10000, 20000];
    var sm = ' ' + strings.meters;
    var sk = ' ' + strings.kilometers;
    var captions = ['5'+sm, '10'+sm, '50'+sm, '100'+sm, '500'+sm, '1'+sk, '5'+sk, '10'+sk, '20'+sk];
    for (a = 0; a < options.length; a++) {
        selected = ((json.accuracy == options[a])?' selected':'');
        html.push('       <option value="' + options[a] + '"' + selected + '> ' + captions[a] + '</option>');
    }
    html.push('                    </select></td>');
    html.push('                </tr>');
    html.push('            </table>');
    html.push('        </div>');
    html.push('        <div class="col-md-5">');
    html.push('            <input name="persistent" type="checkbox"' + checkedpersistent + ' /> ' + strings.persistent + '<br />');
    html.push('            <input name="reveal" type="checkbox"' + checkedreveal + ' /> ' + strings.reveal + '<br />');
    html.push('            <input name="revealname" type="checkbox"' + checkedrevealname + ' /> ' + strings.revealname);
    html.push('        </div>');
    html.push('    </div>');

    html.push('    <div class="hidden" id="availability_gps_map" style="height: 440px; border: 1px solid #AAA;">');
    html.push('        <div style="position: absolute; z-index: 999; right: 15px; top: 15px;">');

    //html.push(             strings.selectfrommapdrag);
    html.push('            <a href="#" onclick="' + requirehelper + '; return false;" class="btn btn-secondary" style="color: unset;">');
    html.push('                <i class="fa fa-map-marker"></i>&nbsp;' + strings.current_location_set);
    html.push('            </a>');
    html.push('        </div>');
    html.push('    </div>');
    html.push('</div>');

    var node = Y.Node.create(html.join(''));

    if (!M.availability_gps.form.addedEvents) {
        M.availability_gps.form.addedEvents = true;
        var root = Y.one('#fitem_id_availabilityconditionsjson');
        root.delegate('change', function() {
            // For the grade item, just update the form fields.
            M.core_availability.form.update();
            require(['block_gps/conditionassistant'], function(helper) { helper.initIfShown();});
        }, '.availability_gps select');

        root.delegate('click', function() {
            M.core_availability.form.update();
            require(['block_gps/conditionassistant'], function(helper) { helper.initIfShown();});
        }, '.availability_gps input[type=checkbox]');

        root.delegate('valuechange', function() {
            // For grade values, just update the form fields.
            M.core_availability.form.update();
            require(['block_gps/conditionassistant'], function(helper) { helper.initIfShown();});
        }, '.availability_gps input');
    }
    M.availability_gps.node = node;

    return node;
};

M.availability_gps.form.fillValue = function(value, node) {
    // This function gets passed the node (from above) and a value
    // object. Within that object, it must set up the correct values
    // to use within the JSON data in the form. Should be compatible
    // with the structure used in the __construct and save functions
    // within condition.php.
    var tmp, a;
    for(a = 0; a < M.availability_gps.vals.length; a++) {
        var field = M.availability_gps.vals[a];
        tmp = node.one('*[name=' + field + ']');
        if (['persistent', 'reveal', 'revealname'].indexOf(field) > -1) {
            value[field] = (tmp.get('checked') ? 1 : 0);
        } else if (tmp) {
            value[field] = tmp.get('value');
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
