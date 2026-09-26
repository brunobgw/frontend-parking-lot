FROM nginx:1.27-alpine

# Remove o conteúdo padrão do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos estáticos da aplicação (SPA HTML + CSS + JS puro)
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
