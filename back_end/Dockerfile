FROM python:3.10
ADD ./requirements.txt /opt/
ADD ./src /opt/
WORKDIR /opt/

RUN python3 -m pip install -r requirements.txt
CMD ["python", "app.py"]
