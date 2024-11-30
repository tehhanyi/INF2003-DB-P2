# INF2003-DB-P2
NodeJS code for API calls

## To build and push to docker for new updates:
docker build -t 'docker-username'/inf2003-nodejs-api:latest .
docker push 'docker-username'/inf2003-nodejs-api:latest

## To run docker container locally:
docker run -p 3000:3000 'docker-username'/inf2003-nodejs-api:latest

## To deploy to Azure
1. create resource group
 az group create --name inf2003ResourceGroup --location eastus

2. create appservice
 az appservice plan create --name inf2003AppServicePlan --resource-group inf2003ResourceGroup --sku B1 --is-linux

3.  create webapp
 az webapp create --resource-group inf2003ResourceGroup --plan inf2003AppServicePlan --name inf2003-node-api --deployment-container-image-name 'docker-username'/inf2003-nodejs-api:latest                                                                       
4. configure web app to use docker hub
 az webapp config container set --name inf2003-node-api --resource-group inf2003ResourceGroup --docker-custom-image-name 'docker-username'/inf2003-nodejs-api:latest --docker-registry-server-url https://index.docker.io/v1/ --docker-registry-server-user 'docker-username' --docker-registry-server-password 'password'

## To check Architecture
docker inspect 'docker-username'/inf2003-nodejs-api:latest | grep Architecture

## To use Mac architecture
docker buildx create --use
docker buildx build --platform linux/amd64 -t 'docker-username'/inf2003-nodejs-api:latest . --push
