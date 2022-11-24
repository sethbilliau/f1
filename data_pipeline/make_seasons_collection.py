#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Oct 20 11:23:11 2022

@author: sethbilliau
"""

# Import libraries
import json
from datetime import date
import time
from pyergast_source.pyergast import pyergast as ergast


# import functions from utils
from helpers import get_mongo_db


def main():
    '''
        Main function to execute upon script call
    '''
    # Get Mongo connection
    mongo_db = get_mongo_db()

    # for each year since 1950,
    season_collection = []
    for year in range(1950, date.today().year + 1, 1):

        # Initialize a season document
        season_doc = {}

        # Get the season's year
        season_doc['year'] = year

        # Get df of the season schedule in the given year from pyergast
        while True:
            try:
                df_year = ergast.get_schedule(year)
            except Exception:
                time.sleep(0.5)
            else:
                break

        # Get number of races in season
        season_doc['numRaces'] = df_year.shape[0]

        # initialize list of races
        season_doc['races'] = []
        for _, race in df_year.iterrows():

            # convert pandas series to json while dropping the season
            race_dict = {}
            race_dict = json.loads(json.dumps(race.drop('season').to_dict()))

            # Add races list to dictionary
            season_doc['races'].append(race_dict)

        # Add season document to the collection
        season_collection.append(season_doc)

    # Get the seasons collection and insert many
    db_seasons = mongo_db.get_collection('seasons')
    inserted = db_seasons.insert_many(season_collection)

    # Print a count of documents inserted.
    print(str(len(inserted.inserted_ids)) + " documents inserted")

    # Make the driverId a unique index in the data set
    db_seasons.create_index("year", unique=True)

    return


if __name__ == '__main__':
    main()
