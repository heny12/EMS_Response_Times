# Title: prepare data for KNN prediciton modeling
# description: we will trim the data of all the unecessary/redundant characteristics

# Import all the packages we need
import csv


# Setup the CSV writer
outputFile = open("full_firecalls_knn.csv", 'wt')
writer = csv.writer(outputFile)
fields = ["lat","lon","month","day","time","incType"]
writer.writerow(fields)

with open('full_firecalls_dates.csv', 'rb') as f:
    reader = csv.reader(f)

    # for each row we want to format the date
    for row in reader:
    	newRow = []

    	# get only the KNN relevant data

    	# the type (what we will predict)
    	incType = row[1]
    	# the location
    	lat = row[3]
    	lon = row[4]

    	# the date & time
    	month = row[8]
    	day = row[9]
    	time = row[10]
        if lat != "" and lon != "":
        	# construct our new row
        	newRow.append(lat)
        	newRow.append(lon)
        	newRow.append(month)
        	newRow.append(day)
        	newRow.append(time)
        	newRow.append(incType)

        	writer.writerow(newRow)