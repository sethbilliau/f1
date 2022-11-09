#!/usr/bin/env python
from contextlib import asynccontextmanager
import logging
import os
from tokenize import String
from typing import Optional
from dotenv import load_dotenv


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

# Mount static to 
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

@asynccontextmanager
async def get_db():
    if neo4j_version >= "4":
        async with driver.session(database=database) as session_:
            yield session_
    else:
        async with driver.session() as session_:
            yield session_


templates = Jinja2Templates(directory="templates")


@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse(
        "index.html", {"request": request}
    )


@app.get("/search")
async def get_search(q: Optional[str] = None):
    async def work(tx, q_):
        result = await tx.run(
            "MATCH (a:Driver {fullName: '" + q_ + "'} )"
            "-[r:Teammate*1] -> (b) RETURN b.fullName"
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
async def get_graph(limit: Optional[int] = 2, driver: Optional[str] = None):
    async def work(tx, limit_, driver_):
        result = await tx.run(
            "MATCH (a:Driver {fullName: '" + driver_ +
            "'}) -[r:Teammate*1.." + str(limit_)+ "] -> (b) RETURN a, r, b "
            "LIMIT 300"
        )
        return [record_ async for record_ in result]

    def add_node(newNode: dict, names_: list, nodes_: list, nodesSet_: set):
        """
        Add a new driver's node to the list of nodes, names, and nodesSet
        """
        names_.append(newNode["fullName"])
        nodes_.append({"id": names_.index(newNode["fullName"]), "label": newNode["fullName"]})
        nodesSet_.add(newNode["fullName"])
        return (names_, nodes_, nodesSet_)

    async with get_db() as db:
        results = await db.execute_read(work, limit, driver)
        nodesSet = set()
        nodes = []
        names = []
        rels = []
        for starting_node, _, ending_node in results:
            if starting_node["fullName"] not in nodesSet:
                names, nodes, nodesSet = add_node(starting_node, names, nodes, nodesSet)

            if ending_node["fullName"] not in nodesSet:
                names, nodes, nodesSet = add_node(ending_node, names, nodes, nodesSet)

                rels.append({"from": names.index(starting_node["fullName"]), "to": names.index(ending_node['fullName'])})

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

    uvicorn.run(app, port=port)
