#FROM ubuntu
#RUN apt-get update
#RUN apt-get install -y git nodejs npm nodejs-legacy
#RUN git clone https://github.com/DuoSoftware/DVP-TwitterReciver.git /usr/local/src/twitterreciver
#RUN cd /usr/local/src/twitterreciver; npm install
#CMD ["nodejs", "/usr/local/src/twitterreciver/app.js"]

#EXPOSE 4647

FROM node:9.9.0
ARG VERSION_TAG
RUN git clone -b $VERSION_TAG https://github.com/DuoSoftware/DVP-TwitterReciver.git /usr/local/src/twitterreciver
RUN cd /usr/local/src/twitterreciver;
WORKDIR /usr/local/src/twitterreciver
RUN npm install
EXPOSE 4647
CMD [ "node", "/usr/local/src/twitterreciver/app.js" ]
