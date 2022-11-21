
# Import pandas and random to select the game randomly
import pandas as pd
import random
from typing import Optional
import boto3
import json

def get_random_starting_ending_drivers(seed: Optional[int] = None):
    if seed:
        random.seed(seed)
    gamesdf = pd.read_csv('app/data/pairings_limit3.csv')
    row_index = random.randint(0, gamesdf.shape[0])
    row = gamesdf.iloc[row_index]
    return {'driver1': row['driver1'], 'driver2': row['driver2']}


def get_starting_ending_drivers_from_s3(region, id, secretkey, bucket, key):
    s3 = boto3.resource(
        service_name='s3',
        region_name=region,
        aws_access_key_id=id,
        aws_secret_access_key=secretkey
    )
    obj = s3.Bucket(bucket).Object(key).get()
    file_content = obj['Body'].read().decode('utf-8')
    json_content = json.loads(file_content)
    return {
        'driver1': json_content[0]['driver1'],
        'driver2': json_content[0]['driver2']
    }


def getFullNamesList():
    namesdf = pd.read_csv('app/data/drivers.csv')
    namesListFull = list(namesdf.iloc[:,0])
    return namesListFull


namesListFull = getFullNamesList()


def add_node(newNode: dict, names_: list, nodes_: list,
             nodesSet_: set, _driverList: list, namesList: list = namesListFull):
    """
    Add a new driver's node to the list of nodes, names, and nodesSet
    """
    
    names_.append(newNode["fullName"])
    if newNode["fullName"] in _driverList:
        group = "path"
    else:
        group = "nonpath"
    nodes_.append({"id": namesList.index(newNode["fullName"]),
                   "label": newNode["fullName"],
                   "group": group})
    nodesSet_.add(newNode["fullName"])
    return (names_, nodes_, nodesSet_)
