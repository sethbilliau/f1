#!/bin/sh

### MONGO SECTION ###
# Put all races in each season in the seasons db
python make_seasons_collection.py

# Put all drivers in the drivers db
python make_drivers_collection.py

# Put all teammates for each driver in the mongo db
python get_teammates.py

### MONGO TO NEO4J ###
# Put the information in the mongodb in to a neo4j db
python mongo_db_to_neo4j.py

# get all potential games given the current set of drivers
python get_potential_games.py

