#!/usr/local/bin/python

# Title: Incidents seperated by Neighborhoods
# Description: given a csv from the Seattle Fire Incidet Calls this will create a csv for each neighborhood

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

# we will need multiple csv files
fileNames = []

# we need to keep track of which hood each row belongs in
hoodRows = []


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
		someRows = []
		hoodRows.append(someRows)
		aFileName = hoodNames[index] + ".csv"
		aFileName = aFileName.replace("/", "")
		fileNames.append(aFileName)

# remove the junk names
while "OOO" in hoodNames:
     hoodNames.remove("OOO")

fields = ""

# now we will start checking the datapoints from a csv of firedata for neighborhood-ness
with open('firecalls_test.csv', 'rb') as f:
    reader = csv.reader(f)
    # get the header row out of the way
    fields = reader.next()
    fields.append("Neighborhood")

    # for each row we need to check its neighborhood
    for row in reader:

    	# sample row: ['6900 Sylvan Way Sw', 'Aid Response', '05/02/2015 07:08:00 AM +0000',
    	# 				'47.540954', '-122.369911', '(47.540954, -122.369911)', 'F150046749']

    	# check if lat/lon is in a neighborhoods
    	if is_float(row[3]) and is_float(row[4]):
	    	lat = float(row[3])
	    	lon = float(row[4])
	    	location = Point(lat,lon)

	    	hoodName = "unincorporated or out of City Limits"

	    	for index in range(len(hoodPolys)):

	    		# get the boundary
	    		poly = hoodPolys[index]

	    		# if it is inside update the name
	    		if poly.contains(location):
	    			hoodName = hoodNames[index]
	    			#add the neighborhood name and write the row
	    			row.append(hoodName)
	    			hoodRows[index].append(row)


for index in range(len(hoodRows)):

	thisHood = hoodRows[index]
	# Setup the CSV writer
	outputFile = open(fileNames[index], 'wt')
	writer = csv.writer(outputFile)
	writer.writerow(fields)

	for newRow in thisHood:
		writer.writerow(newRow)
