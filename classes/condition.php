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

require_once($CFG->dirroot . '/blocks/gps/block_gps.php');
require_once($CFG->dirroot . '/blocks/gps/lib.php');

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
        global $CFG;
        $this->accuracy = $structure->accuracy;
        $this->longitude = $structure->longitude;
        $this->latitude = $structure->latitude;
        $this->persistent = $structure->persistent;
        $this->reveal = $structure->reveal;
        $this->revealname = $structure->revealname;

        if (!$this->accuracy) { $this->accuracy = 50; }
        if (!$this->reveal) { $this->reveal = 1; }
        if (!$this->revealname) { $this->revealname = 1; }
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


    public function is_available($not,
            \core_availability\info $info, $grabthelot, $userid) {
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
            'longitude' => \block_gps::get_location('longitude'),
            'latitude' => \block_gps::get_location('latitude'),
        );
        $conditionposition = (object)array(
            'longitude' => $this->longitude,
            'latitude' => $this->latitude,
        );
        $distance = \availability_gps\block_gps_lib::get_distance($userposition, $conditionposition);
        $chkdist = ($distance > -1 && $distance < $this->accuracy);

        $chkpersistent = false;
        if($userid > 0 && ($cmid > 0 || $sectionid > 0)) {
            $entry = $DB->get_record('block_gps_reached', array('cmid' => $cmid, 'userid' => $userid, 'sectionid' => $sectionid));
            if (isset($entry->id) && $entry->id > 0) {
                $chkpersistent = true;
            } elseif ($chkdist && (!isset($this->warning_edit_required) || !$this->warning_edit_required)) {
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

        $allow = ($chkdist || $chkpersistent && $this->persistent == 1);
        if ($not) {
            $allow = !$allow;
        }
        return $allow;
    }

    public function get_description($full, $not, \core_availability\info $info) {
        global $CFG;
        // This function just returns the information that shows about
        // the condition on editing screens. Usually it is similar to
        // the information shown if the user doesn't meet the
        // condition (it does not depend on the current user).

        $hints = array();
        $hints[] = get_string('geolocation', 'block_gps');
        if (isset($this->warning_edit_required) && $this->warning_edit_required) {
            $hints[] = '<strong>' . get_string('warning_edit_required', 'block_gps') . '</strong>';
        }

        if ($this->reveal == 1) {
            $hints[] = get_string('longitude', 'block_gps') . ' ' . $this->longitude . ', ' .
                       get_string('latitude', 'block_gps') . ' ' . $this->latitude;
        }
        $hints[] = get_string('accuracy', 'block_gps') . " " . $this->accuracy . " " . get_string('meters', 'block_gps');
        $hints[] = get_string(($this->persistent)?'reached_once':'reached_current', 'block_gps');

        $userposition = (object)array(
            'longitude' => \block_gps::get_location('longitude'),
            'latitude' => \block_gps::get_location('latitude'),
        );
        $conditionposition = (object)array(
            'longitude' => $this->longitude,
            'latitude' => $this->latitude,
        );
        $distance = \availability_gps\block_gps_lib::get_distance($userposition, $conditionposition);
        if ($distance > -1) {
            $hints[] = get_string('distance', 'block_gps') . ' ' . number_format($distance, 0, ',', ' ') . ' ' . get_string('meters', 'block_gps');
        }

        return implode(", ", $hints);
    }

    protected function get_debug_string() {
        // This function is only normally used for unit testing and
        // stuff like that. Just make a short string representation
        // of the values of the condition, suitable for developers.
        return '';
    }
}
