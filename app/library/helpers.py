#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Oct 20 11:23:11 2022

@author: sethbilliau
"""
# Import pandas and random to select the game randomly
import random
import json
from typing import Optional
import pandas as pd
import boto3


def get_random_starting_ending_drivers(seed: Optional[int] = None):
    """Get random starting/ending driver pairing from set of possible games"""
    if seed:
        random.seed(seed)
    gamesdf = pd.read_csv('app/data/pairings_limit3.csv')
    row_index = random.randint(0, gamesdf.shape[0])
    row = gamesdf.iloc[row_index]
    return {'driver1': row['driver1'], 'driver2': row['driver2']}


def get_starting_ending_drivers_from_s3(region, key_id, secretkey, bucket, key):
    """Get starting/ending driver pairing from S3"""
    s3_resource = boto3.resource(
        service_name='s3',
        region_name=region,
        aws_access_key_id=key_id,
        aws_secret_access_key=secretkey
    )
    obj = s3_resource.Bucket(bucket).Object(key).get()
    file_content = obj['Body'].read().decode('utf-8')
    json_content = json.loads(file_content)
    return {
        'driver1': json_content[0]['driver1'],
        'driver2': json_content[0]['driver2'],
        'gameID': json_content[0]['dayCounter']
    }


def get_full_names_list():
    """Get full names list from drivers.csv"""
    namesdf = pd.read_csv('app/data/drivers.csv')
    names_list_full = list(namesdf.iloc[:,0])
    return names_list_full


namesListFull = get_full_names_list()


def add_node(new_node: dict, names_: list, nodes_: list,
             nodes_set_: set, _driver_list: list,
             names_list: list = namesListFull):
    """
    Add a new driver's node to the list of nodes, names, and nodesSet
    """

    names_.append(new_node["fullName"])
    if new_node["fullName"] in _driver_list:
        group = "path"
    else:
        group = "nonpath"
    nodes_.append({"id": names_list.index(new_node["fullName"]),
                   "label": new_node["fullName"],
                   "group": group})
    nodes_set_.add(new_node["fullName"])
    return (names_, nodes_, nodes_set_)
