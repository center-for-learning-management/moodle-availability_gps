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

require_once($CFG->dirroot . '/blocks/gps/lib.php');

 class frontend extends \core_availability\frontend {
     protected function get_javascript_strings() {
         // You can return a list of names within your language file and the
         // system will include them here. (Should you need strings from another
         // language file, you can also call $PAGE->requires->strings_for_js
         // manually from here.)
         return array(
            "accuracy", "current_location", "geolocation_not_supported",
            "latitude", "loading", "longitude", "meters", "no", "notify_block",
            "persistent", "reveal", "revealname", "selectfrommap", "selectfrommapdrag", "yes"
        );
     }

     protected function get_javascript_init_params($course, \cm_info $cm = null,
             \section_info $section = null) {
         global $CFG;

         return array(0, 0, 50, 0, 1, 1, $CFG->wwwroot);
     }

     protected function allow_add($course, \cm_info $cm = null,
             \section_info $section = null) {
         global $CFG;

         if (substr($CFG->wwwroot, 0, 6) != 'https:') {
            return false;
         } else {
            $positions = array();
            $o = (object)array();
            $idtype = '';
            if ($section != null) {
                $o = $section;
                $idtype = 'sectionid';
            }
            if ($cm != null) {
                $o = $cm;
                $idtype = 'cmid';
            }
            $positions = \availability_gps\block_gps_lib::load_position_condition($o, $idtype);
            return count($positions) == 0;
         }
     }
 }
