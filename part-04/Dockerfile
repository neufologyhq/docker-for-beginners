FROM node:24-slim
LABEL io.neufology.lesson="docker-part4"
WORKDIR /app
COPY app.js index.html ./
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 3000
CMD ["node", "app.js"]
