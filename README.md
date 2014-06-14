# DC Mayor Schedule

The DC Mayor has a public schedule available online here:

[http://mayor.dc.gov/daily-schedule](http://mayor.dc.gov/daily-schedule)

Unfortunately there is no archive of said schedule. You can only see the current day - at least as of 2013-08-21.

So this is a system, to be run as a cron job, to archive the DC mayor's schedule and make it available in a tabular format.

* The 'data' folder contains the archived schedule in UTF-8 CSV format.
* The 'html' folder contains archived raw HTML from the mayor's site, from which the above is culled.
* The 'code' folder contains the code that does this stuff.

To install:
* pull your fork of the repo
* 'crontab -e'; '14 * * * * full_path' runs 'full_path' on the 14th minute of every hour

Shouts to [Code for DC](http://codefordc.org/)! This is an [award-winning](http://farm6.staticflickr.com/5535/9571453964_0e12dcf940_o.jpg) project!

There is a simple web interface for browsing the archive [here](http://ajschumacher.github.io/dc_mayor_schedule/).
