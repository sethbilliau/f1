#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Oct 20 11:23:11 2022

@author: sethbilliau
"""

# Import libraries
from pyergast_source.pyergast import pyergast as ergast

# import functions from utils
from helpers import get_mongo_db


def update_teammate_features(driver_id, new_teammate_features, mongo_db):
    '''
        update the teammate features with driver_id
        and give it new_teammate_features
    '''
    mongo_db.update_one(
        {'driverID': driver_id},
        {'$push': {'teammateFeatures': new_teammate_features}},
        upsert=True
    )


def update_teammate_set(driver_id, new_teammate, mongo_db):
    '''
        update the teammate set with driver_id and give it new_teammate
    '''
    mongo_db.update_one(
        {'driverID': driver_id},
        {'$push': {'teammateSet': new_teammate}},
        upsert=True
    )


def main():
    '''
        Main function to execute upon script call
    '''
    # Get connected to the Mongo DB and connect to the collections
    mongo_db = get_mongo_db()
    db_seasons = mongo_db.get_collection('seasons')
    db_drivers = mongo_db.get_collection('drivers')

    # Initialize an empty set of teammates for each driver in the drivers df
    # db_drivers.update_many({}, {"$set": {"teammateSet": []}})
    # db_drivers.update_many({}, {"$set": {"teammateFeatures": []}})

    # Get a list of all seasons
    year_races_list = list(db_seasons.find({}, {'year': 1, 'numRaces': 1}))

    # iterate through the list of seasons
    for season_rec in year_races_list:
        year = season_rec['year']
        num_races = season_rec['numRaces']

        print(f'DEBUG: Collecting results for {year} with {num_races} races')

        for race_idx in range(0, num_races, 1):
            print(f"DEBUG: Year {year} race {race_idx + 1}")
            # Get results for the race in question
            race_results = ergast.get_race_result(year=year, race=race_idx + 1)

            # Iterate through each constructor
            for constructor in race_results['constructorID'].unique():

                constructordf = race_results.loc[
                    race_results['constructorID'] == constructor
                ]

                print("DEBUG: Adding Teammates for the " +
                      str(constructordf.shape[0]) + " drivers for "
                      + constructor)

                # Get all the teammates in a lst of dicts for teammate features
                teammate_entry = [{
                                    'teammateID': teammateRow['driverID'],
                                    'team': constructor,
                                    'year': year,
                                    'race': race_idx + 1
                                  } for _, teammateRow
                                  in constructordf.iterrows()]

                # Iterate through each driver for the constructor
                for _, driver in constructordf.iterrows():
                    # Iterate through each teammate
                    for teammate_record in teammate_entry:
                        # If the teammate is not the driver themself
                        if teammate_record['teammateID'] == driver['driverID']:
                            continue
                        # Get the driver document
                        driver_record = db_drivers.find_one(
                                {'driverID': driver['driverID']}
                            )

                        # If this is a new teammate, then
                        # add them to the teammate set and record
                        if teammate_record['teammateID'] not in driver_record['teammateSet']:
                            update_teammate_set(
                                    driver['driverID'],
                                    teammate_record['teammateID'],
                                    db_drivers
                                )
                            update_teammate_features(
                                    driver['driverID'],
                                    teammate_record,
                                    db_drivers
                                )


if __name__ == '__main__':
    main()
