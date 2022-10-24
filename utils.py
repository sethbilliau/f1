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
from pprint import pprint
from pyergast_source.pyergast import pyergast as ergast
from dotenv import dotenv_values
from pymongo import MongoClient

# Import neo4j driver
from neo4j import GraphDatabase


def getMongoDB():

    # Get values from .env 
    config = dotenv_values('.env')

    db_uri = config['MONGO_URI']
    db_user = config['MONGO_USER']
    db_pw = config['MONGO_PW']
    db_name = config['MONGO_DB_NAME']

    # Connect to the database with the connection string
    client = MongoClient(f'mongodb+srv://{db_user}:{db_pw}@{db_uri}')
    
    # Get the data base name
    db = client.get_database(db_name)

    return db


def getneo4jDBMS():

    # Get values from .env 
    config = dotenv_values('.env')

    db_uri = config['NEO_URI']
    db_user = config['NEO_USER']
    db_pw = config['NEO_PW']

    # Connect to the DBMS DRIVER with the connection string
    graphDB_Driver  = GraphDatabase.driver(db_uri, auth=(db_user, db_pw))

    return graphDB_Driver


def execute_neo_commands(execution_commands, graphDB_driver):
    session = graphDB_driver.session()    
    for i in execution_commands:
        session.run(i)
    
    return


if __name__ == "__main__":
    pass