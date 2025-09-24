FROM nginx:alpine

# Copia os arquivos do seu site para a pasta do Nginx
COPY FRONT/ /usr/share/nginx/html

# ADICIONE ESTA NOVA LINHA
# Copia o nosso arquivo de configuração para dentro do Nginx, substituindo o padrão
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mantém o comando para garantir as permissões
RUN chmod -R 755 /usr/share/nginx/html
