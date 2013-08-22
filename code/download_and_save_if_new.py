#/usr/bin/env python


# Change for local system
repo_dir = "/Users/aaron/dc_mayor_schedule"
target_url = "http://mayor.dc.gov/daily-schedule"
# This is not actually generalized for any target_url,
# because it checks for a date in the HTML that doesn't
# necessarily need to exist in general.


# And now I will proceed to continue writing a shell script in Python
# because I feel more comfortable in Python.

import os
os.chdir(repo_dir)

from subprocess import call
call("curl "+ target_url + " -o temp.html", shell=True)

with open('temp.html') as f:
  content = f.readlines()

# Horrible hack to find the first YYYY-MM-DD date
import re
for line in content:
  then = re.search("[0-9]{4}-[0-9]{2}-[0-9]{2}", line)
  if then is not None:
    then = then.group(0)
    break

import os.path
save_path = 'html/' + then + '.html'
if not os.path.exists(save_path):
  call("git pull", shell=True)
  call("mv temp.html " + save_path, shell=True)
  call("git add .", shell=True)
  call("git commit -m 'auto-update for " + then + "'", shell=True)
  call("git push", shell=True)
