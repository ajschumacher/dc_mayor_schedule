# DC Mayor Schedule

The DC Mayor has a public schedule available online here:

[http://mayor.dc.gov/daily-schedule](http://mayor.dc.gov/daily-schedule)

Unfortunately there is no archive of said schedule. You can only see the current day - at least as of 2013-08-21.

So this will be a system, to be run as a cron job, to archive the DC mayor's schedule and also perhaps make it available in a tabular format.


The 'html' folder contains archived raw HTML from the mayor's site.
The 'data' folder will eventually contain the archived schedule in a tabular format.
The 'code' folder contains the code that does this stuff.


To install:
* pull your fork of the repo
* 'chmod a+x code/download_and_save_if_new.py'
* 'crontab -e'; 14 * * * * is the 14th minute of every hour
