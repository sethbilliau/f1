#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Oct 20 11:23:11 2022

@author: sethbilliau
"""
from contextlib import asynccontextmanager
import logging
import os
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Import neo4j functions to access the data base
from neo4j import (
    basic_auth,
    AsyncGraphDatabase,
)

# Import starlette function to handle exceptions
from starlette.exceptions import HTTPException as StarletteHTTPException

# Import dotenv functions to load environment variables
from dotenv import load_dotenv

# Include Routers
from app.routers import explore

# Import all helper functions
from app.library.helpers import (
    get_random_starting_ending_drivers,
    add_node,
    namesListFull,
    get_starting_ending_drivers_from_s3
)

# Create FastAPI app
app = FastAPI()

# Mount templates
templates = Jinja2Templates(directory="templates")

# Mount static
app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static",
)

# Load environment variables
load_dotenv()
url = os.getenv("NEO4J_URI", "neo4j+s://demo.neo4jlabs.com")
username = os.getenv("NEO4J_USER", "movies")
password = os.getenv("NEO4J_PW", "movies")
neo4j_version = os.getenv("NEO4J_VERSION", "4")
database = os.getenv("NEO4J_DATABASE", "movies")
port = os.getenv("PORT", "8080")

AWS_REGION_NAME = os.getenv("AWS_REGION_NAME", "NONE")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "NONE")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "NONE")
AWS_BUCKET = os.getenv("AWS_BUCKET", "NONE")
AWS_KEY = os.getenv("AWS_KEY", "NONE")

# Access the data base driver - async
DRIVER = AsyncGraphDatabase.driver(url, auth=basic_auth(username, password))


@asynccontextmanager
async def get_db():
    ''''
        Access the neo4j data base
    '''
    if neo4j_version >= "4":
        async with DRIVER.session(database=database) as session_:
            yield session_
    else:
        async with DRIVER.session() as session_:
            yield session_


# Add router to the explore page
app.include_router(explore.router)


@app.get("/")
async def root(request: Request):
    ''''
        Route to the main page '/'
    '''
    data = get_starting_ending_drivers_from_s3(
        AWS_REGION_NAME,
        AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY,
        AWS_BUCKET,
        AWS_KEY
    )
    return templates.TemplateResponse(
        "index.html", {"request": request, "data": data}
    )


@app.get("/unlimited")
async def unlimited(request: Request):
    ''''
        Route to the unlimited page '/unlimited'
    '''
    data = get_random_starting_ending_drivers()
    return templates.TemplateResponse(
        "unlimited.html", {"request": request, "data": data}
    )


@app.get("/search")
async def get_search(q: Optional[str] = None):
    '''
        use the search GET to query the DB
    '''
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
    '''Use the solve GET to query the DB'''
    async def work(tx, start_, final_):
        result = await tx.run(
            "MATCH (p1:Driver { fullName: '" + start_ + "' }),"
            "(p2:Driver { fullName: '" + final_ + "' }),"
            "path = shortestPath((p1)-[*..15]-(p2))"
            "RETURN [x in nodes(path) | x.fullName]"
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
    '''Use the graph GET to create a graph from the db'''
    async def work(tx, driver_):
        result = await tx.run(
            "MATCH (a:Driver {fullName: '" + driver_ +
            "'}) -[r:Teammate*1]-(b) RETURN a, r, b "
            "LIMIT 300"
        )
        return [record_ async for record_ in result]

    async with get_db() as db:
        driver_lst = [driver1, driver2, driver3, driver4, driver5]
        nodes_set = set()
        nodes = []
        names = []
        rels_set = set()
        for driver in driver_lst:
            if driver:
                results = await db.execute_read(work, driver)
                for start_node, _, ending_node in results:
                    if start_node["fullName"] not in nodes_set:
                        names, nodes, nodes_set = add_node(start_node, names,
                                                           nodes, nodes_set,
                                                           driver_lst)

                    if ending_node["fullName"] not in nodes_set:
                        names, nodes, nodes_set = add_node(ending_node, names,
                                                           nodes, nodes_set,
                                                           driver_lst)

                    rels_set.add(frozenset(
                            [namesListFull.index(start_node["fullName"]),
                             namesListFull.index(ending_node['fullName'])]
                        ))

        rels = [{"from": min(list(item)),
                 "to": max(list(item)),
                 "id": str(min(list(item))) +
                str(max(list(item)))} for item in list(rels_set)]
        return {"nodes": nodes, "links": rels}


@app.exception_handler(StarletteHTTPException)
async def my_custom_exception_handler(request: Request,
                                      exc: StarletteHTTPException):
    '''Handle HTTPExceptions here'''
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
        "apology.html", {"request": request,
                         "top": exc.status_code,
                         "bottom": escape(exc.detail)}
    )


if __name__ == "__main__":
    import uvicorn

    logging.root.setLevel(logging.INFO)
    logging.info("Starting on port %d, database is at %s", port, url)

    uvicorn.run(app, port=port, host="0.0.0.0")
