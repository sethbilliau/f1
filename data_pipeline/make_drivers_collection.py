#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Oct 20 11:23:11 2022

@author: sethbilliau
"""

# Import libraries
import json
from pyergast_source.pyergast import pyergast as ergast

# import functions from utils
from helpers import get_mongo_db


def main():
    '''
        Main function to execute upon script call
    '''
    mongo_db = get_mongo_db()

    # Get pandas df of all drivers from ergast, rename driverId to driverID
    all_drivers = ergast.get_drivers().rename(columns={"driverId": "driverID"})

    # initialize a list of all drivers
    all_drivers_list = []
    for _, driver in all_drivers.iterrows():

        # drop permanentNumber and code entries, convert to JSON
        driver_json = json.loads(json.dumps(driver.drop(
                ['permanentNumber', 'code']).to_dict())
            )

        # Append Driver to the list of all drivers
        all_drivers_list.append(driver_json)

    # Define the 'drivers' collection we will store this data in,
    # which is created dynamically like the database,
    # and insert the data into the collection.
    db_drivers = mongo_db.get_collection('drivers')
    inserted = db_drivers.insert_many(all_drivers_list)

    # Print a count of documents inserted.
    print(str(len(inserted.inserted_ids)) + " documents inserted")

    # Make the driverId a unique index in the data set
    db_drivers.create_index("driverID", unique=True)

    return


if __name__ == '__main__':
    main()
