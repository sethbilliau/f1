#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Oct 20 11:23:11 2022

@author: sethbilliau
"""

# Import libraries
from pyergast_source.pyergast import pyergast as ergast

# import functions from utils
from utils import getMongoDB


def update_teammateFeatures(driverID, newTeammateFeatures, db):
    db.update_one(
        {'driverID': driverID},
        {'$push': {'teammateFeatures': newTeammateFeatures}},
        upsert=True
    )


def update_teammateSet(driverID, newTeammate, db):
    db.update_one(
        {'driverID': driverID},
        {'$push': {'teammateSet': newTeammate}},
        upsert=True
    )


def main():
    # Get connected to the Mongo DB and connect to the collections
    db = getMongoDB()
    dbSeasons = db.get_collection('seasons')
    dbDrivers = db.get_collection('drivers')

    # Initialize an empty set of teammates for each driver in the drivers df
    dbDrivers.update_many({}, {"$set": {"teammateSet": []}})
    dbDrivers.update_many({}, {"$set": {"teammateFeatures": []}})

    # Get a list of all seasons
    year_races_list = list(dbSeasons.find({}, {'year': 1, 'numRaces': 1}))

    # iterate through the list of seasons
    for season_rec in year_races_list:
        year = season_rec['year']
        numRaces = season_rec['numRaces']

        print(f'Collecting results for {year} with {numRaces} races')

        for raceIdx in range(0, numRaces, 1):
            print(f"DEBUG: Year {year} race {raceIdx + 1}")
            # Get results for the race in question
            raceResults = ergast.get_race_result(year=year, race=raceIdx + 1)

            # Iterate through each constructor
            for constructor in raceResults['constructorID'].unique():

                constructordf = raceResults.loc[
                    raceResults['constructorID'] == constructor
                ]

                print("DEBUG: Adding Teammates for the " +
                      str(constructordf.shape[0]) + " drivers for "
                      + constructor + ")")

                # Get all the teammates in a lst of dicts for teammate features
                teammateEntry = [{
                                  'teammateID': teammateRow['driverID'],
                                  'team': constructor,
                                  'year': year,
                                  'race': raceIdx + 1
                                 } for _, teammateRow
                                 in constructordf.iterrows()]

                # Iterate through each driver for the constructor
                for driverIdx, driver in constructordf.iterrows():
                    # Iterate through each teammate
                    for teammateRecord in teammateEntry:
                        # If the teammate is not the driver themself
                        if teammateRecord['teammateID'] != driver['driverID']:

                            # Get the driver document
                            driverRecord = dbDrivers.find_one(
                                    {'driverID': driver['driverID']}
                                )

                            # If this is a new teammate, then
                            # add them to the teammate set and record
                            if teammateRecord['teammateID'] not in driverRecord['teammateSet']:
                                update_teammateSet(driver['driverID'], teammateRecord['teammateID'])
                                update_teammateFeatures(driver['driverID'], teammateRecord)

    return


if __name__ == '__main__':
    main()
