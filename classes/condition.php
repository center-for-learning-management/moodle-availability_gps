<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Condition main class.
 *
 * @package availability_gps
 * @copyright 2014 The Open University
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace availability_gps;

defined('MOODLE_INTERNAL') || die();

/**
 * Condition main class.
 *
 * @package availability_gps
 * @copyright 2018 Digital Education Society
 * @author Robert Schrenk
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class condition extends \core_availability\condition {
    protected $accuracy; // Accuracy in m
    protected $longitude;
    protected $latitude;
    protected $persistent; // Stay visible when detected once.
    protected $reveal; // Whether or not to show coordinates to users.

    public function __construct($structure) {
        global $CFG, $COURSE, $OUTPUT, $PAGE;
        $this->accuracy = $structure->accuracy;
        $this->longitude = $structure->longitude;
        $this->latitude = $structure->latitude;
        $this->persistent = $structure->persistent;
        $this->reveal = $structure->reveal;
        $this->revealname = $structure->revealname;

        $bannerinjected = \block_gps\locallib::cache_get('request', 'bannerinjected');
        $initialized = \block_gps\locallib::cache_get('request', 'location_initialized');
        $askedonce = \block_gps\locallib::cache_get('session', 'asked_for_location_once');
        $setinterval = \block_gps\locallib::cache_get('session', 'setinterval');

        if (empty($initialized)) {
            $PAGE->requires->js_call_amd('block_gps/geoassist', 'locateInit', \block_gps\locallib::get_location());
            \block_gps\locallib::cache_set('request', 'location_initialized', true);
            if (!empty($setinterval)) {
                $PAGE->requires->js_call_amd('block_gps/geoassist', 'interval', [ 'ms' => $setinterval]);
            }
        }
        if (empty($bannerinjected) && (strpos($_SERVER["SCRIPT_FILENAME"], '/course/view.php') > 0 || $PAGE->bodyid == 'page-site-index')) {
            $courseid = optional_param('id', 1, PARAM_INT);
            if (!empty($courseid)) {
                $course = \get_course($courseid);
                if ($courseid == 1 || \can_access_course($course)) {
                    $PAGE->requires->js_call_amd('block_gps/geoassist', 'injectBanner', [ 'courseid' => $COURSE->id ]);
                }
            }
            \block_gps\locallib::cache_set('request', 'bannerinjected', true);
        }
        /*
         * it was reported that this feature could be unsettling for users. Therefore, it has been disabled for
         * the time being. Possible solutions in the future: activatable via admin setting or a banner above the
         * course page with a notice.
        if (empty($askedonce)) {
            $PAGE->requires->js_call_amd('block_gps/geoassist', 'locate', [ 'once' => 1 ]);
            \block_gps\locallib::cache_set('session', 'asked_for_location_once', true);
        }
        */
    }

    public function save() {
        // Save back the data into a plain array similar to $structure above.
        $entry = (object)array(
            'type' => 'gps',
            'accuracy' => $this->accuracy,
            'longitude' => $this->longitude,
            'latitude' => $this->latitude,
            'persistent' => $this->persistent,
            'reveal' => $this->reveal,
            'revealname' => $this->revealname,
        );
        return $entry;
    }


    public function is_available($not, \core_availability\info $info, $grabthelot, $userid) {
        // This function needs to check whether the condition is true
        // or not for the user specified in $userid.
        global $CFG, $DB;
        $cmid = 0; $sectionid = 0;
        if (method_exists($info, 'get_section')) {
            $section = $info->get_section();
            $sectionid = $section->id;
        }
        if (method_exists($info, 'get_course_module')) {
            $module = $info->get_course_module();
            $cmid = $module->id;
        }

        $userposition = (object)array(
            'longitude' => \block_gps\locallib::get_location('longitude'),
            'latitude' => \block_gps\locallib::get_location('latitude'),
        );
        $conditionposition = (object)array(
            'longitude' => $this->longitude,
            'latitude' => $this->latitude,
        );
        $distance = \block_gps\locallib::get_distance($userposition, $conditionposition);
        $chkdist = ($distance > -1 && $distance < $this->accuracy);

        $chkpersistent = false;
        if(!empty($this->persistent) && !isguestuser($userid) && (!empty($cmid) || !empty($sectionid))) {
            $entry = $DB->get_record('block_gps_reached', array('cmid' => $cmid, 'userid' => $userid, 'sectionid' => $sectionid));
            if (isset($entry->id) && $entry->id > 0) {
                $chkpersistent = true;
            } elseif ($chkdist && empty($this->warning_edit_required)) {
                $entry = (object) array(
                    'cmid' => $cmid,
                    'sectionid' => $sectionid,
                    'userid' => $userid,
                    'firstreach' => time(),
                );
                $DB->insert_record('block_gps_reached', $entry);
                $chkpersistent = true;
            }
        }

        $allow = ($chkdist || ($chkpersistent && !empty($this->persistent)));
        if ($not) {
            $allow = !$allow;
        }

        return $allow;
    }

    public function get_description($full, $not, \core_availability\info $info) {
        $userposition = (object)array(
            'longitude' => \block_gps\locallib::get_location('longitude'),
            'latitude' => \block_gps\locallib::get_location('latitude'),
        );
        $conditionposition = (object)array(
            'longitude' => $this->longitude,
            'latitude' => $this->latitude,
        );
        $distance = \block_gps\locallib::get_distance($userposition, $conditionposition);

        $params = (object)[
            'accuracy' => ($this->accuracy > 1000) ? $this->accuracy/1000 : $this->accuracy,
            'accuracylabel' => ($this->accuracy > 1000) ? get_string('kilometers', 'block_gps') : get_string('meters', 'block_gps'),
            'distance' => ($distance > 1000) ? round($distance / 1000,1) : $distance,
            'distanceerror' => ($distance == -1) ? 1 : 0,
            'distancelabel' => ($distance > 1000) ? get_string('kilometers', 'block_gps') : get_string('meters', 'block_gps'),
            'latitude' => round($this->latitude, 5),
            'longitude' => round($this->longitude, 5),
            'persistent' => $this->persistent,
            'reveal' => $this->reveal,
            'warning_edit_required' => isset($this->warning_edit_required) ? 1 : 0,
        ];

        return \availability_gps\button::render($params);
    }

    protected function get_debug_string() {
        // This function is only normally used for unit testing and
        // stuff like that. Just make a short string representation
        // of the values of the condition, suitable for developers.
        return $this->allow ? 'YES' : 'NO';
    }
}
