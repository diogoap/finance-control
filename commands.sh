### Heroku ###

# Heroku - View logs (Control+C to stop streaming the logs) #
heroku logs --tail

### Setting env variables ###
MONGOLAB_URI=mongodb://localhost:27017/finance-control
export MONGOLAB_URI

### Installing npm packages ###
npm install jsonschema --save
npm install

### Installing Bower packages ###
sudo npm install -g bower
bower init
bower install angular-ui/ui-grid.info --save
________________________________________________________________________________

### Node.js ###
sudo apt-get update
sudo apt-get install nodejs

### npm ###
sudo apt-get install npm
sudo ln -s /usr/bin/nodejs /usr/bin/node

### To run node automatically after changes ###
sudo npm install -g nodemon
nodemon file.js

### Mongo ###
#Remove
sudo service mongod stop
sudo apt-get purge mongodb-org*
#Install
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
sudo echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse"
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo service mongod start
#Install service
https://askubuntu.com/questions/770054/mongodb-3-2-doesnt-start-on-lubuntu-16-04lts-as-service/770133#770133?newreg=d296972c09e94a29b73e3156074bc2b2

### Docker ### 
References:
https://nodejs.org/fr/docs/guides/nodejs-docker-webapp/
https://www.digitalocean.com/community/tutorials/containerizing-a-node-js-application-for-development-with-docker-compose

#Build/run container
docker build -t diogo/finance-control-web .
docker run -it --rm --name finance-control-web --network finance-control -p 5000:5000 -d diogo/finance-control-web

#Build/run compose
docker-compose -f "docker-compose.yml" up -d --build

#Kill/Stop/Remove container
docker kill finance-control-web
docker stop finance-control-web
docker container rm finance-control-web
docker container rm finance-control-web -f

#Get container ID
docker ps
docker-compose ps

# Print app output
docker logs container_id

# Enter the container
docker exec -it finance-control-web /bin/bash

# Restore database
docker exec -it finance-control-db sh /backups/run_backup.sh
docker exec -it finance-control-db sh /backups/run_restore.sh
