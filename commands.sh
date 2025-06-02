

### Installing npm packages ###
npm install jsonschema --save
npm install

### Installing Bower packages ###
sudo npm install -g bower
bower init
bower install angular-ui/ui-grid.info --save

______________________________________________________________________________________________________

### Docker ### 

References:
https://nodejs.org/fr/docs/guides/nodejs-docker-webapp/
https://www.digitalocean.com/community/tutorials/containerizing-a-node-js-application-for-development-with-docker-compose

#Build/run container
docker build -t diogo/finance-control-web .
docker run -it --rm --name finance-control-web --network finance-control -p 8000:8000 -d diogo/finance-control-web

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
docker logs finance-control-web

# Enter the container
docker exec -it finance-control-web /bin/bash

# Backup database into container
docker exec -it finance-control-db sh /backups/run_backup.sh

# Restore database into container
docker exec -it finance-control-db sh /backups/run_restore.sh

# Full backup/restore
docker exec -it finance-control-db sh /backups/run_backup_restore.sh

# Full backup/restore with copy
docker exec -it finance-control-db sh /backups/run_backup_restore_with_copy.sh

_____________________________________________________________________________

### Node.js ###
sudo apt-get update
sudo apt-get install nodejs

### npm ###
sudo apt-get install npm
sudo ln -s /usr/bin/nodejs /usr/bin/node

### To run node automatically after changes ###
sudo npm install -g nodemon
nodemon file.js

_____________________________________________________________________________

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

_____________________________________________________________________________

### Git ####
#If needed to disable signing
git commit -m "message"  --no-gpg-sign