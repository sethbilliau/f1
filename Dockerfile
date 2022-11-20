FROM python:3.9

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt
RUN python -m pip install --upgrade pip
RUN python -m pip install --no-cache-dir --upgrade -r ./requirements.txt

COPY . /code/

EXPOSE 8080
CMD ["python", "app/main.py"]