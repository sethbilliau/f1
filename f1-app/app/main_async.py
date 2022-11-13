#!/usr/bin/env python
from contextlib import asynccontextmanager
import logging
import os
from typing import Optional
from dotenv import load_dotenv
import random
import pandas as pd

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
from neo4j import (
    basic_auth,
    AsyncGraphDatabase,
)
from starlette.responses import FileResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

PATH = os.path.dirname(os.path.abspath(__file__))

app = FastAPI()

# Mount templates 
templates = Jinja2Templates(directory="templates")

# Mount static
app.mount(
    "/static",
    StaticFiles(directory=Path(__file__).parent.parent.absolute() / "static"),
    name="static",
)

load_dotenv()
url = os.getenv("NEO4J_URI", "neo4j+s://demo.neo4jlabs.com")
username = os.getenv("NEO4J_USER", "movies")
password = os.getenv("NEO4J_PW", "movies")
neo4j_version = os.getenv("NEO4J_VERSION", "4")
database = os.getenv("NEO4J_DATABASE", "movies")
port = os.getenv("PORT", 8080)

driver = AsyncGraphDatabase.driver(url, auth=basic_auth(username, password))

def get_random_starting_ending_drivers(seed: Optional[int] = None):
    if seed: 
        random.seed(seed)
    row_index = random.randint(0, 811)
    gamesdf = pd.read_csv('app/data/pairings_limit3.csv')    
    row = gamesdf.iloc[row_index]
    return {'driver1': row['driver1'], 'driver2':row['driver2']}

@asynccontextmanager
async def get_db():
    if neo4j_version >= "4":
        async with driver.session(database=database) as session_:
            yield session_
    else:
        async with driver.session() as session_:
            yield session_


@app.get("/")
async def root(request: Request):
    data = get_random_starting_ending_drivers(42)
    return templates.TemplateResponse(
        "index.html", {"request": request, "data": data}
    )

@app.get("/unlimited")
async def root(request: Request):
    data = get_random_starting_ending_drivers()
    return templates.TemplateResponse(
        "unlimited.html", {"request": request, "data": data}
    )


@app.get("/search")
async def get_search(q: Optional[str] = None):
    async def work(tx, q_):
        result = await tx.run(
            "MATCH (a:Driver {fullName: '" + q_ + "'} )"
            "-[r:Teammate*1]-(b) RETURN b.fullName"
        )
        return [record[0] async for record in result]
    
    if q is None:
        return []
    async with get_db() as db:
        results = await db.execute_read(work, q)
        logging.info("Teammates for search string %s", q)
        return results


@app.get("/solve")
async def solve(start: Optional[str] = None, final: Optional[str] = None):
    async def work(tx, start_, final_):
        result = await tx.run(
            "MATCH (p1:Driver { fullName: '" + start_ +"' }),"
            "(p2:Driver { fullName: '" + final_ + "' }),"
            "path = shortestPath((p1)-[*..15]-(p2)) RETURN [x in nodes(path) | x.fullName]"
        )
        return [record[0] async for record in result]

    if start is None or final is None:
        return []
    async with get_db() as db:
        results = await db.execute_read(work, start, final)
        logging.info("Finding shortest path from %s to %s", start, final)
        return results[0]


@app.get("/graph")
async def get_graph(
        driver1: Optional[str] = None, 
        driver2: Optional[str] = None,
        driver3: Optional[str] = None,
        driver4: Optional[str] = None,
        driver5: Optional[str] = None):
    async def work(tx, driver_):
        result = await tx.run(
            "MATCH (a:Driver {fullName: '" + driver_ +
            "'}) -[r:Teammate*1]-(b) RETURN a, r, b "
            "LIMIT 300"
        )
        return [record_ async for record_ in result]

    def add_node(newNode: dict, names_: list, nodes_: list, nodesSet_: set, _driverList: list):
        """
        Add a new driver's node to the list of nodes, names, and nodesSet
        """
        names_.append(newNode["fullName"])
        if newNode["fullName"] in _driverList:
            group = "path"
        else: 
            group = "nonpath"
        nodes_.append({"id": names_.index(newNode["fullName"]), "label": newNode["fullName"], "group": group})
        nodesSet_.add(newNode["fullName"])
        return (names_, nodes_, nodesSet_)


    async with get_db() as db:
        driverList = [driver1, driver2, driver3, driver4, driver5]
        nodesSet = set()
        nodes = []
        names = []
        relsSet = set()
        for driver in driverList: 
            if driver: 
                results = await db.execute_read(work, driver)
                for starting_node, _, ending_node in results:
                    if starting_node["fullName"] not in nodesSet:
                        names, nodes, nodesSet = add_node(starting_node, names, nodes, nodesSet, driverList)

                    if ending_node["fullName"] not in nodesSet:
                        names, nodes, nodesSet = add_node(ending_node, names, nodes, nodesSet, driverList)

                    relsSet.add(frozenset([names.index(starting_node["fullName"]), names.index(ending_node['fullName'])]))
        
        rels = [{"from": list(item)[0], "to": list(item)[1]} for item in list(relsSet)]


        return {"nodes": nodes, "links": rels}


@app.get("/explore")
async def root(request: Request):
    return "TODO"


@app.exception_handler(StarletteHTTPException)
async def my_custom_exception_handler(request: Request, exc: StarletteHTTPException):
    # Handle HTTPExceptions here
    return apology(request, exc)


def apology(request: Request, exc: StarletteHTTPException):
    """Render message as an apology to user."""
    def escape(s):
        """
        Escape special characters.

        https://github.com/jacebrowning/memegen#special-characters
        """
        for old, new in [("-", "--"), (" ", "-"), ("_", "__"), ("?", "~q"),
                         ("%", "~p"), ("#", "~h"), ("/", "~s"), ("\"", "''")]:
            s = s.replace(old, new)
        return s
    return templates.TemplateResponse(
        "apology.html", {"request": request, "top": exc.status_code, "bottom": escape(exc.detail)}
    )


if __name__ == "__main__":
    import uvicorn

    logging.root.setLevel(logging.INFO)
    logging.info("Starting on port %d, database is at %s", port, url)

    uvicorn.run(app, port=port, host="0.0.0.0")
