# Install a (local) strapi-de-sol1 instance for development using Docker

You will get a strapi instance with the content model for strapi-de-sol1 provided. User accounts and content entries are not included.

## Set up

### Install & set up Docker

#### Unix

[Install Docker Engine](https://docs.docker.com/engine/install/) by follwing the guide for your distro.

[Install Docker Compose](https://docs.docker.com/compose/install/linux/#install-using-the-repository) as a plugin.

Alternatively, you may want to use the Docker Desktop environment which includes a GUI and all Docker components.

#### Add your user to `docker` group

To execute docker commands without sudo, add your Unix user to the `docker` group, see https://docs.docker.com/engine/install/linux-postinstall/

### Clone repo

    $ git clone https://github.com/hbz/strapi-de-sol1.git
    $ cd strapi-de-sol1

### Add `.env` file

For starting the docker container you will need an `.env` file. You can use the example file:

    $ cp .env.example .env

## Development

For development on your local machine you can use Docker compose: 

    $ docker compose up

to spin up the two docker containers. The strapi app is accessible at `http://localhost:1337/`.

You first need to create an admin user via the GUI or [via the CLI](https://docs.strapi.io/dev-docs/cli#strapi-admincreate-user). (First, go into the container with `$ docker exec -it strapi-de-sol1 bash`.)

In order to access the content-types through the [REST API](https://docs.strapi.io/dev-docs/api/rest) you need to set the appropriate permissions. Go to `http://localhost:1337/admin/settings/users-permissions/roles`, click on the respective role and set the permissions for each content-type. For more details please have a look at the [docs of the Users & Permissions plugin](https://docs.strapi.io/dev-docs/plugins/users-permissions).

### Plugin

To open a bash in your container (e.g. to use `strapi` CLI commands), run:

    $ docker exec -it strapi-de-sol1 bash

To see changes made to the `lookup` plugin in your admin UI, run (in the project root directory):

    $ cd -
    $ strapi build

### Config

Some config (e.g. field labels) is actually stored in the DB, not in repo files.

It can be dumped to a file inside the container and copied to the local repo with:

    docker compose exec strapi-de-sol1 strapi config:dump -f config.json
    docker compose cp strapi-de-sol1:./opt/app/config.json .

Reverse for restoring from the file:

    docker compose cp config.json strapi-de-sol1:./opt/app/
    docker compose exec strapi-de-sol1 strapi config:restore -f config.json

The current config dump is checked into the repo as `config.json`. *Caution:* credentials (eg. API Tokens) will also be dumped into this file. Be sure your config contains non-sensitive data only. In doubt you should not commit your config.

When running the restore command you can choose from different strategies: replace (default), merge, keep.

Read more in the [Strapi docs](https://docs.strapi.io/dev-docs/cli#strapi-configurationdump).

### Database

To access the underlying database, first open a bash in the database container:

    docker compose exec -it strapi-de-sol1DB bash

Then connect to the database:

    psql strapi strapi

There, we can query the DB, e.g. to check the number of holdings:

    select count(*) from holdings;

Or delete all holdings (double check to make sure you're in the right container):

    delete from holdings;

### Deployment

To deploy changes, go to the repo directory, pull the changes, and rebuild the container (`sudo docker compose -f docker-compose-prod.yml down ; sudo docker compose -f docker-compose-prod.yml up -d --build --force-recreate`).

For details, see our [internal Wiki](https://dienst-wiki.hbz-nrw.de/spaces/SEM/pages/1559005376/DE-Sol1+Katalogisierung+f%C3%BCr+Stadtarchiv+Solingen).

## Backup and restore

We create various daily backups for our test and productive instances:

1. Backup Postgresql `data` directory: `tar -czf [archivefile] data/`, restore via `restore-data-dir.sh` 
2. SQL dump of database: `pg_dump [database] -U [user] > | gzip > [dumpfile]` Read more in the [Postgresql docs](https://www.postgresql.org/docs/12/backup-dump.html)
3. Export strapi data: `strapi export -- --file export_strapi_de-sol1  --no-encrypt` Read more in https://docs.strapi.io/cms/cli#strapi-export, restore https://docs.strapi.io/cms/cli#strapi-import
4. Dump config: `config:dump -f config.json-dump`, see `config:restore` in https://docs.strapi.io/cms/cli#strapi-configuration-1
5. Backup current docker image: `docker image save --output [outputfile] strapi-de-sol1`, restore https://docs.docker.com/reference/cli/docker/image/load/

All backups mentioned above are run by cron. Check `/etc/cron.d/` for the git versioned crontab that contains the specific backups commands and file paths.

## Export holdings for testing

In order to update tests or test the final transformation of lobid-extra-holdings you need to export the holdings with the following steps:

```
docker compose exec strapi-de-sol1 npm run --silent strapi export -- --file strapi-export --no-encrypt
docker compose cp strapi-de-sol1:./opt/app/strapi-export.tar.gz .
zgrep -a -E '"type":"api::holding.holding"' strapi-export.tar.gz > strapi-holdings.ndjson
```