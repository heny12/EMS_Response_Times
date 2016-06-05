#!/usr/local/bin/python

# Title: Incident Types by Neighborhood
# Description: given a csv from the Seattle Fire Incidet Calls this will aggregate the type of
# fire calls recieved in each neighborhood

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


# method for checking if strings are floats
def is_float(str):
    try:
        float(str)
        return True
    except ValueError:
        return False


# Get the neighborhood names and coordinate groups
doc = etree.parse("data.kml")
hoodNames = doc.xpath("//SimpleData[@name='S_HOOD']/text()")
hoodCoords = doc.xpath("//coordinates/text()")

# list of our finalized polygon objects from shapely
hoodPolys = []

# we need to keep track of which hood each row belongs in
incTypes = []
# add a neighborhood column field to our eventual csv header
incTypes.append("Neighborhood")

# the counts of each type
typeCounts = []


for index in range(len(hoodNames)):

	# avoid reading in the unincorporated/junkData? neighborhoods
	if hoodNames[index] != "OOO":

		# split the coord string into multiple
		rawCoords = hoodCoords[index].split(" ")
		# need a list of shapely point latLons
		latLons = []

		# create a shapely point object for each coord
		for coord in rawCoords:
			latLonStr = coord.split(",")
			point = Point(float(latLonStr[1]), float(latLonStr[0]))
			latLons.append(point)

		# create the polygon of the neighborhood
		hoodPoly = MultiPoint(latLons).convex_hull
		hoodPolys.append(hoodPoly)
		# initialize a dictionary of all types in a neighborhood
		hoodCount = dict()
		typeCounts.append(hoodCount)

# remove the junk names
while "OOO" in hoodNames:
     hoodNames.remove("OOO")

fields = ""

# now we will start checking the datapoints from a csv of firedata for neighborhood-ness
with open('full_firecalls.csv', 'rb') as f:
    reader = csv.reader(f)

    # for each row we need to check its neighborhood
    for row in reader:

    	# sample row: ['6900 Sylvan Way Sw', 'Aid Response', '05/02/2015 07:08:00 AM +0000',
    	# 				'47.540954', '-122.369911', '(47.540954, -122.369911)', 'F150046749']

    	# check if lat/lon is in a neighborhoods
    	if is_float(row[3]) and is_float(row[4]):
	    	lat = float(row[3])
	    	lon = float(row[4])
	    	location = Point(lat,lon)

	    	for index in range(len(hoodPolys)):

	    		# get the boundary
	    		poly = hoodPolys[index]
	    		count = typeCounts[index]

	    		#get the type
	    		incidentType = row[1]

	    		#check if its new and add it if it is
	    		if incidentType not in incTypes:
	    			incTypes.append(incidentType)

	    		thisCounts = typeCounts[index]

	    		# if it is inside update the name
	    		if poly.contains(location):
	    			if incidentType not in thisCounts.keys():
	    				thisCounts[incidentType] = 1
	    			else:
	    				thisCounts[incidentType] = thisCounts[incidentType] + 1


# Setup the CSV writer
outputFile = open("incidents_by_hood.csv", 'wt')
writer = csv.writer(outputFile)
writer.writerow(incTypes)

for index in range(len(typeCounts)):
	newRow = []
	inCcounts = typeCounts[index]
	for j in range(len(incTypes)):
		if j == 0:
			newRow.append(hoodNames[index])
		elif incTypes[j] in inCcounts:
			newRow.append(inCcounts[incTypes[j]])
		else:
			newRow.append("0")

	writer.writerow(newRow)
