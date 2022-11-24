#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Oct 20 11:23:11 2022

@author: sethbilliau
"""
# import functions from utils
from helpers import (
    get_mongo_db, get_neo4j_dbms, execute_neo_commands, switcher
)


def main():
    '''
        Main function to execute upon script call
    '''
    # Get connected to the Mongo DB and connect to the collections
    mongo_db = get_mongo_db()
    db_drivers = mongo_db.get_collection('drivers')

    # initialize list of execution commands
    execution_commands = []

    # Create all of the driver nodes in the data set from the MongoDB
    for doc in db_drivers.find({}):
        neo4j_create_node_statemenet = 'CREATE (t:Driver {driverID: "'\
            + str(doc['driverID']) + '", fullName:"'\
            + switcher(str(doc['givenName']) + ' ' + str(doc['familyName']))\
            + '", givenName: "' + str(doc['givenName']) + '", familyName: "'\
            + str(doc['familyName']) + '", url: "' + str(doc['url'])\
            + '", dateOfBirth: "' + str(doc['dateOfBirth'])\
            + '", nationality: "' + str(doc['nationality']) + '"})'
        execution_commands.append(neo4j_create_node_statemenet)

    # teammate set to not duplicate relationships
    teammates_set = set()

    # Create all of the teammate relationships between
    # nodes in the data set from the MongoDB
    for doc in db_drivers.find({}):
        for teammate in doc['teammateSet']:
            if teammate not in teammates_set:
                neo4j_create_teammate_statemenet = 'MATCH (a:Driver),' +\
                    '(b:Driver) WHERE a.driverID = "' + str(doc['driverID'])\
                    + '" AND b.driverID = "' + teammate\
                    + '" CREATE (a)-[r:Teammate]->(b)'
                execution_commands.append(neo4j_create_teammate_statemenet)
        teammates_set.add(doc['driverID'])

    # Connect to the DB and Execute the commands
    graph_db_driver = get_neo4j_dbms()
    execute_neo_commands(execution_commands, graph_db_driver)


if __name__ == "__main__":
    main()
