#!/usr/bin/env python

import glob # to find files
import lxml.html
import csv # to write file

repo_dir = "/home/aaron/dc_mayor_schedule"

rows = list()
rows.append(["datetime", "event", "venue", "comment"])

for filename in sorted(glob.glob(repo_dir + "/html/*.html")):
  tree = lxml.html.parse(filename)
  html = tree.iter().next()
  table = html.find_class('views-table')[0]
  for tr in table.iter('tr'):
    tds = list()
    for td in tr.iter('td'):
      tds.append(td)
    span = tds[0].iter('span').next()
    datetime = span.values()[3].encode("utf-8")
    strong = tds[1].iter('strong').next()
    event = strong.text_content().encode("utf-8")
    div = tds[1].iter('div').next()
    venue = div.text_content().encode("utf-8")
    p = tds[1].iter('p').next()
    comment = p.text_content().encode("utf-8")
    rows.append([datetime, event, venue, comment])

outfile = open(repo_dir + '/data/mayor_events.csv', 'w')
writer = csv.writer(outfile)
for row in rows[::-1]:
  writer.writerow(row)
outfile.close()
