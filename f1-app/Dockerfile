FROM python:3.9

WORKDIR /usr/src/

COPY . .
RUN python -m pip install --upgrade pip
RUN python -m pip install -r ./requirements.txt
RUN python -m pip install python-dotenv

CMD [ "python", "./app/main.py" ]