#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Oct 20 11:23:11 2022

@author: sethbilliau
"""

# Import libraries
import requests
import json
from datetime import datetime
from datetime import date
import time
from pprint import pprint
from pyergast_source.pyergast import pyergast as ergast
from pymongo import MongoClient


def getMongoDB():

    # Get values from .env 
    config = dotenv_values('.env')

    db_uri = config['DB_URI']
    db_user = config['DB_USER']
    db_pw = config['DB_PW']
    db_name = config['DB_NAME']

    # Connect to the database with the connection string we got from Atlas, replacing user and password.
    client = MongoClient('mongodb+srv://{db_user}:{db_pw}@{db_uri}')
    
    # Next we define the database we are using.
    # It does not have to exist first, like with relational databases.
    db = client.get_database(db_name)

    return db


def main(): 

    # Get Mongo connection
    db = getMongoDB()

    # for each year since 1950,
    seasonCollection = [] 
    for year in range(1950, date.today().year + 1, 1):
        
        # Initialize a season document
        seasonDocument = {}
        
        # Get the season's year
        seasonDocument['year'] = year
        
        # Get df of the season schedule in the given year from the pyergast package
        while True: 
            try: 
                dfYear = ergast.get_schedule(year)
            except: 
                time.sleep(0.5)
            else:
                break
        
        # Get number of races in season
        seasonDocument['numRaces'] = dfYear.shape[0]
        
        # initialize list of races 
        seasonDocument['races'] = []
        for _, race in dfYear.iterrows():
            
            
            raceDict = {}
            # convert pandas series to json while dropping the season
            raceDict = json.loads(json.dumps(race.drop('season').to_dict()))
            
            # Add races list to dictionary
            seasonDocument['races'].append(raceDict)
        
        # Add season document to the collection 
        seasonCollection.append(seasonDocument)

    # Get the seasons collection and insert many 
    dbSeasons = db.get_collection('seasons')
    inserted = dbSeasons.insert_many(seasonCollection)

    # Print a count of documents inserted.
    print(str(len(inserted.inserted_ids)) + " documents inserted")


    # Make the driverId a unique index in the data set
    dbSeasons.create_index("year", unique=True)

    return


if __name__ == '__main__':
    main()