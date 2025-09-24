FROM nginx:alpine
COPY FRONT/ /usr/share/nginx/html

RUN chmod -R 755 /usr/share/nginx/html
