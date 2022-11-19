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
from utils import getneo4jDBMS

currentDrivers = [
    'Alexander Albon',
    'Fernando Alonso',
    'Valtteri Bottas',
    'Pierre Gasly',
    'Lewis Hamilton',
    'Nicholas Latifi',
    'Charles Leclerc',
    'Kevin Magnussen',
    'Lando Norris',
    'Esteban Ocon',
    'Sergio Perez',
    'Daniel Ricciardo',
    'George Russell',
    'Carlos Sainz',
    'Mick Schumacher',
    'Lance Stroll',
    'Yuki Tsunoda',
    'Max Verstappen',
    'Sebastian Vettel',
    'Guanyu Zhou',
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

]

LIMIT = 3


def main():
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
    db = getneo4jDBMS()
    db_session = db.session(database=db_name)

    pairingSet = set()
    driverSet = set()
    obscureDrivers = set()

    for driver in currentDrivers:
        paired_drivers = db_session.execute_read(work, driver)
        for pair in paired_drivers:
            # Don't add duplicates
            if pair not in driverSet:
                if pair in otherDrivers or pair in currentDrivers or pair in worldChamps:
                    pairingSet.add((driver, pair))
                else:
                    obscureDrivers.add(pair)
        driverSet.add(driver)

    pairingsList = []
    for driver1, driver2 in pairingSet:
        if driver1 != driver2:
            pairingsList.append({'driver1': driver1, 'driver2': driver2})

    pprint(pairingsList)
    print(f"Length: {len(pairingsList)}")
    print(obscureDrivers)

    pairingsDF = pd.DataFrame(pairingsList)
    pairingsDF.to_csv(f'../f1-app/app/data/pairings_limit{str(LIMIT)}.csv')
    return


if __name__ == '__main__':
    main()
