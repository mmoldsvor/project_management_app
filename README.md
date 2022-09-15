# project_management_app
Project management app for students.

## Back end
Start a local web server (localhost:5000) using the command:
```console
$ docker-compose up
```

Port can be specified using the environment variable API_PORT. It is also required to update the port mapping in the compose.yml file.


### Testing the webserver and database
To verify that the webserver is connected to the database, use the url localhost:5000.
Every time the page is loaded, a new row should be added and the value should increment accordingly.