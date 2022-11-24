#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Oct 20 11:23:11 2022

@author: sethbilliau
"""
from fastapi import Request, APIRouter
from fastapi.templating import Jinja2Templates


# Mount templates
templates = Jinja2Templates(directory="templates")

# Create API Router
router = APIRouter()


@router.get("/explore")
async def root(request: Request):
    """Route to explore.html"""
    return templates.TemplateResponse(
        "explore.html", {"request": request}
    )
