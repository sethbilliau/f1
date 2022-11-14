#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Oct 20 11:23:11 2022

@author: sethbilliau
"""

# Import libraries
from dotenv import dotenv_values
from pymongo import MongoClient

# Import neo4j driver
from neo4j import (
    GraphDatabase,
    basic_auth
)


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

    db_uri = config['NEO4J_URI']
    db_user = config['NEO4J_USER']
    db_pw = config['NEO4J_PW']

    # Connect to the DBMS DRIVER with the connection string
    graphDB_Driver = GraphDatabase.driver(db_uri,
                                          auth=basic_auth(db_user, db_pw))

    return graphDB_Driver


def execute_neo_commands(execution_commands, graphDB_driver):
    # Get values from .env
    config = dotenv_values('.env')

    db_name = config['NEO4J_DATABASE']

    session = graphDB_driver.session(database=db_name)
    for i in execution_commands:
        session.run(i)

    return


if __name__ == "__main__":
    pass
