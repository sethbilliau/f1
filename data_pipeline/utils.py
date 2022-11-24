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


def get_mongo_db():
    """Get the mongo db"""
    # Get values from .env
    config = dotenv_values('.env')

    db_uri = config['MONGO_URI']
    db_user = config['MONGO_USER']
    db_pw = config['MONGO_PW']
    db_name = config['MONGO_DB_NAME']

    # Connect to the database with the connection string
    client = MongoClient(f'mongodb+srv://{db_user}:{db_pw}@{db_uri}')

    # Get the data base name
    mongo_db = client.get_database(db_name)

    return mongo_db


def get_neo4j_dbms():
    """Get Neo4j DBMS"""
    # Get values from .env
    config = dotenv_values('.env')

    db_uri = config['NEO4J_URI']
    db_user = config['NEO4J_USER']
    db_pw = config['NEO4J_PW']

    # Connect to the DBMS DRIVER with the connection string
    graph_db_driver = GraphDatabase.driver(db_uri,
                                           auth=basic_auth(db_user, db_pw))

    return graph_db_driver


def execute_neo_commands(execution_commands, graph_db_driver):
    """Execute command in neo4j dbms"""
    # Get values from .env
    config = dotenv_values('.env')

    db_name = config['NEO4J_DATABASE']

    session = graph_db_driver.session(database=db_name)
    for i in execution_commands:
        session.run(i)

    return


def switcher(argument):
    '''
    Remove special characters from a series of names
    :param series: Pandas series of player names
    :return: List of unique names
    '''
    _switcher = {
        'René Arnoux': 'Rene Arnoux',
        'Élie Bayol': 'Elie Bayol',
        'Éric Bernard': 'Eric Bernard',
        'Sébastien Bourdais': 'Sebastien Bourdais',
        'Sébastien Buemi': 'Sebastien Buemi',
        'Mário de Araújo Cabral': 'Mario de Araujo Cabral',
        'Adrián Campos': 'Adrian Campos',
        'François Cevert': 'Francois Cevert',
        'Eugène Chaboud': 'Eugene Chaboud',
        'Érik Comas': 'Erik Comas',
        "Jérôme d'Ambrosio": "Jerome d'Ambrosio",
        'Jean-Denis Délétraz': 'Jean-Denis Deletraz',
        'José Dolhem': 'Jose Dolhem',
        'Tomáš Enge': 'Tomas Enge',
        'Nasif Estéfano': 'Nasif Estefano',
        'Philippe Étancelin': 'Philippe Etancelin',
        'Paul Frère': 'Paul Frere',
        'Oscar Gálvez': 'Oscar Galvez',
        'Marc Gené': 'Marc Gene',
        'José Froilán González': 'Jose Froilan Gonzalez',
        'Óscar González': 'Oscar Gonzalez',
        'André Guelfi': 'Andre Guelfi',
        'Miguel Ángel Guerra': "Miguel Angel Guerra",
        'Esteban Gutiérrez': "Esteban Gutierrez",
        'Mika Häkkinen': 'Mika Hakkinen',
        'François Hesnault': 'Francois Hesnault',
        'Nico Hülkenberg': 'Nico Hulkenberg',
        'Jesús Iglesias': 'Jesus Iglesias,',
        'Jyrki Järvilehto': 'Jyrki Jarvilehto',
        'Gérard Larrousse': 'Gerard Larrousse',
        'Michel Leclère': 'Michel Leclere',
        'Ricardo Londoño': 'Ricardo Londono',
        'André Lotterer': 'Andre Lotterer',
        'Onofre Marimón': 'Onofre Marimon',
        'Eugène Martin': 'Eugene Martin',
        'François Mazet': 'François Mazet,',
        'Gastón Mazzacane': 'Gaston Mazzacane',
        'François Migault': 'Francois Migault',
        'André Milhoux': 'Andre Milhoux',
        'Patrick Nève': 'Patrick Neve',
        'Sergio Pérez': 'Sergio Perez',
        'Luis Pérez-Sala': 'Luis Perez-Sala',
        'Alfredo Pián': 'Alfredo Pian',
        'François Picard': 'Francois Picard',
        'André Pilette': 'Andre Pilette',
        'Antônio Pizzonia': 'Antonio Pizzonia',
        'Kimi Räikkönen': 'Kimi Raikkonen',
        'Stéphane Sarrazin': 'Stephane Sarrazin',
        'André Simon': 'Andre Simon',
        'Moisés Solana': 'Moises Solana',
        'André Testut': 'Andre Testut',
        'Jean-Éric Vergne': 'Jean-Eric Vergne',
        'Desiré Wilson': 'Desire Wilson',
    }

    # get() method of dictionary data type returns
    # value of passed argument if it is present
    # in dictionary otherwise second argument will
    # be assigned as default value of passed argument
    val = _switcher.get(argument, "nothing")
    if val == "nothing":
        return argument
    else:
        return val


if __name__ == "__main__":
    pass
