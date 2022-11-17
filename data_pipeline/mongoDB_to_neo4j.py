# import functions from utils
from utils import (
    getMongoDB, getneo4jDBMS, execute_neo_commands, switcher
)

def main():

    # Get connected to the Mongo DB and connect to the collections
    db = getMongoDB()
    dbDrivers = db.get_collection('drivers')

    # initialize list of execution commands
    execution_commands = []

    # Create all of the driver nodes in the data set from the MongoDB
    for doc in dbDrivers.find({}):
        neo4j_create_node_statemenet = 'CREATE (t:Driver {driverID: "'\
            + str(doc['driverID']) + '", fullName:"'\
            + switcher(str(doc['givenName'])\
            + ' ' + str(doc['familyName'])) + '", givenName: "'\
            + str(doc['givenName']) + '", familyName: "'\
            + str(doc['familyName']) + '", url: "' + str(doc['url'])\
            + '", dateOfBirth: "' + str(doc['dateOfBirth'])\
            + '", nationality: "' + str(doc['nationality']) + '"})'
        execution_commands.append(neo4j_create_node_statemenet)

    # teammate set to not duplicate relationships
    teammatesSet = set()

    # Create all of the teammate relationships between
    # nodes in the data set from the MongoDB
    for doc in dbDrivers.find({}):
        for teammate in doc['teammateSet']:
            if teammate not in teammatesSet:
                neo4j_create_teammate_statemenet = 'MATCH (a:Driver),' +\
                    '(b:Driver) WHERE a.driverID = "' + str(doc['driverID'])\
                    + '" AND b.driverID = "' + teammate\
                    + '" CREATE (a)-[r:Teammate]->(b)'
                execution_commands.append(neo4j_create_teammate_statemenet)
        teammatesSet.add(doc['driverID'])

    # Connect to the DB and Execute the commands
    graphDB_Driver = getneo4jDBMS()
    execute_neo_commands(execution_commands, graphDB_Driver)

    return


if __name__ == "__main__":
    main()
