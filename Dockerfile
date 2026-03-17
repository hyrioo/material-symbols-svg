FROM node:24

WORKDIR /var/www

# Install and activate the latest Yarn 4.x via Corepack.
RUN corepack enable && corepack prepare yarn@4 --activate

CMD ["tail", "-f", "/dev/null"]
