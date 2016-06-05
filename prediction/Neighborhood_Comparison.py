#!/usr/local/bin/python

# Title: Compare incidents accross Neighborhoods
# Description: Checks and outputs differences accross neighborhoods

# Import all the packages we need
import csv
import pykml
import lxml
import shapely

from shapely.geometry import Point
from shapely.geometry import Polygon
from shapely.geometry import MultiPoint
from pykml import parser
from lxml import etree
from scipy import stats
import matplotlib.pyplot as plt

# method for checking if strings are floats
def is_float(str):
    try:
        float(str)
        return True
    except ValueError:
        return False

# place to keep the rows
# name -> counts
hoodNames = []
hoodCounts = []

# Get the neighborhood Incident data
with open('incidents_by_hood.csv', 'rb') as f:
    reader = csv.reader(f)
    # skip over header
    reader.next()
    # for each row we need to check its neighborhood
    for row in reader:

    	hoodNames.append(row[0])
    	row.pop(0)

        # if we leave in Aid Response all the distributions will test
        # as the same

        # comment out the next line to test with all Inc Types
        row.pop(1)

    	# convert from strings
    	floats = []
    	for count in row:
    		floats.append(float(count))
    		
    	# keep track of the values
    	hoodCounts.append(floats)

for index in range(len(hoodCounts)):
	# get the current Neighborhood
	compareHood = hoodNames[index]
	compareSet = hoodCounts[index]
	for next in range(len(hoodCounts)):
		# compare to each
		if index != next:
			testHood = hoodNames[next]
			testSet = hoodCounts[next]
			
			# Run a t test on the incident distributions
			pVals = stats.ttest_ind(compareSet, testSet, equal_var = False)
			if pVals[1] < 0.05:
				print testHood
				print compareHood
				print pVals






