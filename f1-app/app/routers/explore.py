from fastapi import Request, APIRouter
from fastapi.templating import Jinja2Templates


# Mount templates 
templates = Jinja2Templates(directory="templates")

# Create API Router
router = APIRouter()

@router.get("/explore")
async def root(request: Request):
    return templates.TemplateResponse(
        "graph.html", {"request": request}
    )
