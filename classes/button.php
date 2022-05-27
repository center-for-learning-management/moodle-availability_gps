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
 * @copyright 2022 Digital Education Society
 * @author Robert Schrenk
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class button  {
    public static function render($params) {
        $lines = [];
        $lines[] = "<span class=\"availability_gps_condition_button\">";
        if (!empty($params->warning_edit_required)) {
            $lines[] = "    <strong>" . get_string('warning_edit_required', 'block_gps') . "</strong>;";
        }
        $lines[] = get_string('position', 'block_gps');
        if (!empty($params->reveal)) {
            $lines[] = "    <span class=\"latitude\">" . $params->latitude . "</span>, ";
            $lines[] = "    <span class=\"longitude\">" . $params->longitude . "</span>, ";
        }
        $lines[] = get_string('within', 'block_gps');
        $lines[] = $params->accuracy . " " . $params->accuracylabel;
        $lines[] = "    <span class=\"distanceok" . (!empty($params->distanceerror) ? ' hidden' : '') . "\">";
        $lines[] = get_string('distance_your', 'block_gps');
        $lines[] = "        <span class=\"distance\">" . $params->distance . "</span>";
        $lines[] = "        <span class=\"distancelabel\">" . $params->distancelabel . "</span>.";
        $lines[] = "    </span>";
        $lines[] = "    <span class=\"distanceerror" . (empty($params->distanceerror) ? ' hidden' : '') . "\">";
        $lines[] = get_string('distance_error', 'block_gps') . ".";
        $lines[] = "    </span>";
        $lines[] = "</span>";

        return implode("\n", $lines);
    }
}
