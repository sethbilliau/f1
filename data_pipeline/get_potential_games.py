#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Oct 20 11:23:11 2022

@author: sethbilliau
"""

# Import libraries
from pprint import pprint
import pandas as pd
from dotenv import dotenv_values

# import functions from utils
from helpers import get_neo4j_dbms

currentDrivers = [
    'Max Verstappen',
    'Sergio Perez',
    'Lewis Hamilton',
    'George Russell',
    'Charles Leclerc',
    'Carlos Sainz',
    'Fernando Alonso',
    'Lance Stroll',
    'Pierre Gasly',
    'Esteban Ocon',
    'Lando Norris',
    'Oscar Piastri',
    'Alexander Albon',
    'Logan Sargeant'
    'Kevin Magnussen',
    'Nico Hulkenberg',
    'Daniel Ricciardo',
    'Yuki Tsunoda',
    'Guanyu Zhou',
    'Valtteri Bottas',
]

worldChamps = [
    'Nino Farina',
    'Alberto Ascari',
    'Juan Fangio',
    'Mike Hawthorn',
    'Jack Brabham',
    'Phil Hill',
    'Graham Hill',
    'Jim Clark',
    'John Surtees',
    'Denny Hulme',
    'Jackie Stewart',
    'Jochen Rindt',
    'Emerson Fittipaldi',
    'Niki Lauda',
    'James Hunt',
    'Mario Andretti',
    'Jody Scheckter',
    'Alan Jones',
    'Nelson Piquet',
    'Keke Rosberg',
    'Alain Prost',
    'Ayrton Senna',
    'Nigel Mansell',
    'Michael Schumacher',
    'Damon Hill',
    'Jacques Villeneuve',
    'Mika Hakkinen',
    'Fernando Alonso',
    'Kimi Raikkonen',
    'Lewis Hamilton',
    'Jenson Button',
    'Sebastian Vettel',
    'Nico Rosberg',
    'Max Verstappen',
]

otherDrivers = [
    'Jack Aitken',
    'Michele Alboreto',
    'Jean Alesi',
    'Michael Andretti',
    'Mario Andretti',
    'Alberto Ascari',
    'Rubens Barrichello',
    'Jules Bianchi',
    'Jack Brabham',
    'Martin Brundle',
    'Sebastien Buemi',
    'Jenson Button',
    'Karun Chandhok',
    'Jim Clark',
    'David Coulthard',
    'Anthony Davidson',
    'Andrea de Cesaris',
    'Pedro de la Rosa',
    'Nyck de Vries',
    'Jean-Denis Deletraz',
    'Lucas di Grassi',
    'Paul di Resta',
    "Jerome d'Ambrosio",
    'Marcus Ericsson',
    'Juan Fangio',
    'Nino Farina',
    'Giancarlo Fisichella',
    'Christian Fittipaldi',
    'Emerson Fittipaldi',
    'Wilson Fittipaldi',
    'Pietro Fittipaldi',
    'Antonio Giovinazzi',
    'Timo Glock',
    'Romain Grosjean',
    'Esteban Gutierrez',
    'Brendon Hartley',
    'Nick Heidfeld',
    'Johnny Herbert',
    'Damon Hill',
    'Graham Hill',
    'Nico Hulkenberg',
    'Eddie Irvine',
    'Alan Jones',
    'Christian Klien',
    'Kamui Kobayashi',
    'Heikki Kovalainen',
    'Robert Kubica',
    'Daniil Kvyat',
    'Niki Lauda',
    'Vitantonio Liuzzi',
    'Jan Magnussen',
    'Pastor Maldonado',
    'Nigel Mansell',
    'Helmut Marko',
    'Felipe Massa',
    'Nikita Mazepin',
    'Bruce McLaren',
    'Juan Pablo Montoya',
    'Jolyon Palmer',
    'Olivier Panis',
    'Riccardo Patrese',
    'Nelson Piquet',
    'Nelson Piquet Jr.',
    'Alain Prost',
    'Nico Rosberg',
    'Keke Rosberg',
    'Alexander Rossi',
    'Takuma Sato',
    'Ralf Schumacher',
    'Michael Schumacher',
    'Ayrton Senna',
    'Bruno Senna',
    'Sergey Sirotkin',
    'Scott Speed',
    'Jackie Stewart',
    'Jarno Trulli',
    'Stoffel Vandoorne',
    'Jean-Eric Vergne',
    'Jos Verstappen',
    'Jacques Villeneuve',
    'Gilles Villeneuve',
    'Mark Webber',
    'Pascal Wehrlein',
    'Narain Karthikeyan',
    'Adrian Sutil',
    'Alexander Wurz',
    'Heinz-Harald Frentzen',
    'Vitaly Petrov',
    'Mike Hawthorn',
    'Phil Hill',
    'John Surtees',
    'Jochen Rindt',
    'James Hunt',
    'Jody Scheckter',
    'Gerhard Berger',
    'Sebastien Bourdais',
    'Felipe Nasr',
    'Roberto Merhi',
    'Will Stevens',
    'Mick Schumacher',
    'Nicholas Latifi',
    'Sebastian Vettel',
    'Nyck de Vries',
]

LIMIT = 3


def main():
    '''Main function to execute upon script call'''
    def work(tx, driver_):
        result = tx.run(
            "MATCH (a:Driver {fullName: '" + driver_ +
            "'}) -[r:Teammate*2.." + str(LIMIT) + "]-(b) RETURN b.fullName"
        )
        return [record[0] for record in result]

    # Get values from .env
    config = dotenv_values('.env')

    db_name = config['NEO4J_DATABASE']
    # Get Neo4j connection
    neo4j_db = get_neo4j_dbms()
    db_session = neo4j_db.session(database=db_name)

    pairing_set = set()
    driver_set = set()
    obscure_drivers = set()

    for driver in currentDrivers:
        paired_drivers = db_session.execute_read(work, driver)
        for pair in paired_drivers:
            # Don't add duplicates
            if pair not in driver_set:
                if pair in otherDrivers or pair in currentDrivers or pair in worldChamps:
                    pairing_set.add((driver, pair))
                else:
                    obscure_drivers.add(pair)
        driver_set.add(driver)

    def work_sp(tx, start_, final_):
        result = tx.run(
            'MATCH (p1:Driver { fullName: "' + start_ + '" }),'
            '(p2:Driver { fullName: "' + final_ + '" }),'
            "path = shortestPath((p1)-[*..15]-(p2))"
            "RETURN length(path)"
        )
        return [record[0] for record in result][0]

    pairings_list = []
    for driver1, driver2 in pairing_set:
        if driver1 == driver2:
            continue
        length_sp = db_session.execute_read(work_sp, driver1, driver2)
        if length_sp == 1:
            continue

        pairings_list.append({'driver1': driver1, 'driver2': driver2})

    pprint(pairings_list)
    print(f"Length: {len(pairings_list)}")
    print(obscure_drivers)

    pairings_df = pd.DataFrame(pairings_list).sample(frac=1)
    pairings_df = pairings_df.reset_index(drop=True)
    pairings_df.to_csv(f'../f1-app/app/data/pairings_limit{str(LIMIT)}.csv')


if __name__ == '__main__':
    main()
