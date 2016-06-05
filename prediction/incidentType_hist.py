#!/usr/local/bin/python

# Description: This will output a histogram of the types across all incidents

import csv
from scipy import stats
import matplotlib.pyplot as plt


# method for checking if strings are floats
def is_float(str):
    try:
        float(str)
        return True
    except ValueError:
        return False

counts = []

with open('incidents_by_hood.csv', 'rb') as f:
    reader = csv.reader(f)
    for row in reader:
    	for index in range(len(row)):
    		if is_float(row[index]):
    			if len(counts) < len(row):
    				counts.append(float(row[index]))
    			else:
    				counts[index] = float(counts[index]) + float(row[index])

print counts
print len(counts)
plt.bar(range(0, len(counts)), counts)
plt.show()